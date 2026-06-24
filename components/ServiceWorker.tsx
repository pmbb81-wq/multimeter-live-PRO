'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Registers the service worker (production only) and surfaces a prompted update:
 * when a new worker is waiting, show a non-blocking toast with Reload / Later.
 * The app never reloads on its own — applying an update is always user-initiated,
 * so an in-progress recording is never lost without consent.
 */
export function ServiceWorker() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  // True only after the user clicks Reload, so the first-install controllerchange
  // (from the SW's clients.claim()) does not reload the page.
  const reloadingRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const swUrl = new URL('sw.js', document.baseURI).toString();

    const track = (worker: ServiceWorker | null) => {
      if (!worker) return;
      // Only treat as an update when there is already a controller (not first install).
      const promote = () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          setWaiting(worker);
        }
      };
      promote();
      worker.addEventListener('statechange', promote);
    };

    let registration: ServiceWorkerRegistration | undefined;

    navigator.serviceWorker
      .register(swUrl)
      .then((reg) => {
        registration = reg;
        if (reg.waiting && navigator.serviceWorker.controller) {
          setWaiting(reg.waiting);
        }
        reg.addEventListener('updatefound', () => {
          track(reg.installing);
        });
        // Proactively check on load — an installed PWA launch doesn't reliably
        // trigger the browser's implicit update check, so without this the prompt
        // only appears after the site is opened in a normal browser tab.
        reg.update().catch(() => {});
      })
      .catch(() => {
        /* registration failure is non-fatal — app still works online */
      });

    // Re-check whenever the app is brought to the foreground (covers reopening or
    // refocusing the installed PWA, which is where implicit checks fall short).
    const checkForUpdate = () => {
      if (document.visibilityState === 'visible') registration?.update().catch(() => {});
    };
    document.addEventListener('visibilitychange', checkForUpdate);

    const onControllerChange = () => {
      if (reloadingRef.current) window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      document.removeEventListener('visibilitychange', checkForUpdate);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  if (!waiting) return null;

  const reload = () => {
    reloadingRef.current = true;
    waiting.postMessage('SKIP_WAITING');
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-panel px-4 py-3 shadow-lg">
        <span className="text-xs text-fg">A new version is available.</span>
        <button
          onClick={reload}
          className={clsx(
            'flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white',
            'transition-opacity hover:opacity-90'
          )}
        >
          <RefreshCw size={13} />
          Reload
        </button>
        <button
          onClick={() => setWaiting(null)}
          className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-fg"
        >
          <X size={13} />
          Later
        </button>
      </div>
    </div>
  );
}
