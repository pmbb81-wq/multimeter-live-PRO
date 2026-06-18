## Context

Recording is driven entirely from `app/page.tsx`. The async serial read loop calls
`handleReadings(readings)`, which iterates samples and — when `recordingRef.current`
is true — pushes to `recordedRef`, updates the Welford `statsRef`, and accumulates
chart points. Recording is toggled only by the user via `Controls` → `onToggleRecord`
→ `setRec` (which writes both `recordingRef.current` and the `recording` state).

The codebase has a firm convention: values read synchronously inside the async loop
live in **refs**; `useState` is reserved for values that drive renders. A guardrail
forbids calling `setState` per-sample — chart points are batched into a single
`setChartPoints` after the loop. Mode/unit changes are the one existing place that
calls `setState` (`flushSession`) mid-loop, but only on an **edge** (a transition),
not every sample.

This change adds an automatic start/stop trigger that fits that same loop and ref
pattern, with no parser/serial/backend changes.

## Goals / Non-Goals

**Goals:**
- Auto-start logging when `|baseValue|` crosses a user-set threshold, while armed.
- Auto-stop trigger-started logging when the signal falls below a release level,
  with hysteresis to prevent flapping.
- Preserve manual Start/Stop and never auto-stop a manually started session.
- Keep all trigger evaluation inside the existing read loop using refs.

**Non-Goals:**
- Configurable comparison operators (decided: magnitude-only for v1).
- Pre-trigger buffering (capturing samples from *before* the crossing).
- Per-mode threshold memory, or persisting trigger settings across reloads.
- Any backend, parser, or serial-layer change.

## Decisions

### 1. Evaluate the trigger inside `handleReadings`, driven by refs
Add `triggerArmedRef: boolean`, `triggerThresholdRef: number | null`, and
`triggerStartedRef: boolean` (whether the *current* recording session was started
by the trigger, used to scope auto-stop). These mirror the existing
`recordingRef` / `modeRef` / `unitRef` pattern so the hot path stays synchronous.
Backing `useState` (`triggerArmed`, `triggerThreshold` as a string like `rangeMin`)
exists only to render the controls; effects sync the refs (as `autoScaleRef` does).

*Alternative considered:* a separate `useEffect` watching `current`. Rejected —
it lags the loop by a render, can miss a sample that both crosses and clears
within one batch, and splits trigger logic away from where recording happens.

### 2. Magnitude comparison; ignore overload
Start condition: `baseValue !== null && Math.abs(baseValue) > threshold`. The
`null` (OL) guard is explicit so an overload never trips the trigger. Magnitude
was chosen so negative voltages/currents trigger naturally (a −5 V reading trips a
3 V threshold).

### 3. Hysteresis via a release ratio
Stop condition for a trigger-started session: `Math.abs(baseValue) < release`,
where `release = threshold * RELEASE_RATIO` with `RELEASE_RATIO ≈ 0.9` (a single
module-level constant). Arming at `threshold` and releasing at `0.9 × threshold`
gives a dead-band so a signal hovering at the threshold does not flap one event
into many sessions.

*Alternative considered:* "N consecutive below-threshold samples" debounce.
Rejected for v1 — sample-count timing is less intuitive to reason about than a
value band, and the ratio composes cleanly with the magnitude comparison.

### 4. Edge-triggered recording transitions, committed once per batch
Inside the loop, on a start/stop **edge** mutate `recordingRef.current` (and
`triggerStartedRef.current`) synchronously so the rest of the batch records
correctly, and remember that recording changed. **After** the loop, if recording
changed, call `setRecording(recordingRef.current)` once. On auto-start, reuse
`flushSession()` so a triggered capture begins clean; on auto-stop the session is
simply left as-is (its stats already reflect the captured window). This respects
the guardrail: no *per-sample* `setState`, only rare edge transitions — the same
shape as the existing mode-change branch.

### 5. Auto-stop is scoped to triggered sessions
Auto-stop only fires when `triggerStartedRef.current` is true. A manual Start sets
`triggerStartedRef = false`, so a manually started session is never auto-stopped by
the trigger dropping below the release level. A manual Stop clears both refs.

### 6. UI: a new "Trigger" section in `Controls`
Add a `RangeField`-style threshold input plus the existing `Toggle` ("Auto-start on
trigger"), wired through new props (`triggerThreshold`, `onTriggerThresholdChange`,
`triggerArmed`, `onTriggerArmedChange`, and a derived `canArm`). The toggle is
disabled unless a valid numeric threshold is present and `canRecord` (connected) —
reusing the existing gating idiom. Threshold is shown in the active base unit.

## Risks / Trade-offs

- **Signal flapping near the threshold** → mitigated by the release-ratio
  hysteresis (Decision 3); tune `RELEASE_RATIO` if real signals still fragment.
- **Threshold reinterpreted on mode change** (a "3" set for volts becoming "3 ohms"
  after switching modes) → resolved by clearing the threshold and disarming on any
  real mode/unit change, rather than storing thresholds per mode. The first reading
  after connect is guarded (initial detection, not a change) so a pre-typed
  threshold survives.
- **`setState` inside the loop on edges** → bounded to transitions, not per-sample,
  and committed once after the loop; consistent with existing `flushSession`
  usage, so it does not violate the batching guardrail in spirit.
- **Missed ultra-fast spikes between batches** → the trigger only sees delivered
  samples; sub-sample transients are out of scope (no pre-trigger buffer).

## Migration Plan

Purely additive and off by default (disarmed, empty threshold) — no migration or
data changes. Rollback is removing the trigger refs/state and the `Controls`
section; manual logging is untouched.

## Open Questions

- Should `RELEASE_RATIO` be user-adjustable, or is a fixed ~0.9 sufficient? (v1: fixed.)
- Should arming auto-disarm after one capture, or stay armed for repeated events?
  (v1 assumption: stays armed — re-triggers on each crossing.)
