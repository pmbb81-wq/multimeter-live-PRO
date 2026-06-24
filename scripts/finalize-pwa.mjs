// Post-build PWA finalizer (no dependencies).
// Runs after `next build`. It:
//   1. Globs out/ for precacheable static assets.
//   2. Computes a content-derived VERSION hash (changes when any asset changes,
//      which is what drives the prompted-update lifecycle).
//   3. Injects the precache list, base path, and version into out/sw.js.
//   4. Base-path-prefixes start_url/scope/icons in out/manifest.webmanifest.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
const BASE_PATH = process.env.PAGES_BASE_PATH ?? "";

// Extensions worth precaching for offline. RSC payload .txt files and the SW
// itself are intentionally excluded.
const PRECACHE_EXT = new Set([
  ".html", ".js", ".css", ".woff", ".woff2",
  ".png", ".svg", ".ico", ".webmanifest", ".json",
]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(OUT).filter((f) => {
  const dot = f.lastIndexOf(".");
  const ext = dot === -1 ? "" : f.slice(dot);
  if (!PRECACHE_EXT.has(ext)) return false;
  if (f.endsWith(`${sep}sw.js`)) return false; // never let the SW precache itself
  return true;
});

// URL for each file: base-path-prefixed, POSIX separators.
const toUrl = (f) => `${BASE_PATH}/${relative(OUT, f).split(sep).join("/")}`;
const urls = files.map(toUrl).sort();

// Always be able to satisfy a navigation to the scope root.
const precache = Array.from(new Set([`${BASE_PATH}/`, ...urls]));

// Version = hash over sorted (url + content) so it changes iff assets change.
const hash = createHash("sha256");
for (const f of files.sort()) {
  hash.update(toUrl(f));
  hash.update(readFileSync(f));
}
const version = hash.digest("hex").slice(0, 12);

// 3. Inject into out/sw.js
const swPath = join(OUT, "sw.js");
let sw = readFileSync(swPath, "utf8");
sw = sw
  .replace('"__VERSION__"', JSON.stringify(version))
  .replace('"__BASE_PATH__"', JSON.stringify(BASE_PATH))
  .replace("__PRECACHE_URLS__", JSON.stringify(precache));
writeFileSync(swPath, sw);

// 4. Base-path-prefix the manifest.
const manifestPath = join(OUT, "manifest.webmanifest");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const prefix = (p) => `${BASE_PATH}${p}`;
manifest.start_url = prefix(manifest.start_url);
manifest.scope = prefix(manifest.scope);
manifest.icons = manifest.icons.map((i) => ({ ...i, src: prefix(i.src) }));
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log(
  `[finalize-pwa] version=${version} base="${BASE_PATH || "/"}" precached=${precache.length} files`
);
