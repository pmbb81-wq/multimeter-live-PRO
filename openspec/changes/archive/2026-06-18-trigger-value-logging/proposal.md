## Why

Today a session can only be logged by manually clicking **Start Logging**, which
means an operator has to watch the readout and react in time to capture a
transient event (an inrush current, a voltage spike, a continuity blip). For
unattended or fast events this is unreliable — the interesting moment is often
already over before the button is pressed. An automatic value-based trigger lets
the app start (and stop) logging on its own when the measured signal crosses a
user-defined threshold.

## What Changes

- Add a **trigger** mode to the recording controls: a numeric threshold field
  plus an **arm/disarm** toggle ("Auto-start on trigger").
- When armed, logging **auto-starts** as soon as the live reading's magnitude
  (`|baseValue|`) exceeds the threshold, and **auto-stops** when the reading
  falls back below it.
- Apply **hysteresis** (a release level / debounce) on the stop edge so a signal
  hovering near the threshold does not rapidly flap logging on and off and
  fragment one event into many tiny sessions.
- The threshold is interpreted in the **active mode's base SI unit** (V, A, OM,
  F), consistent with how readings are normalized internally.
- Manual Start/Stop continues to work and coexists with the armed trigger.
- Disconnect or a mode/unit change disarms or safely resets the trigger.

No breaking changes — the trigger is additive and off by default.

## Capabilities

### New Capabilities
- `trigger-logging`: Automatically start and stop session logging based on whether
  the live measurement crosses a user-configured threshold, with arming control
  and hysteresis to handle noisy signals.

### Modified Capabilities
<!-- None: no existing specs in openspec/specs/; manual-logging behavior is preserved unchanged. -->

## Impact

- **`app/page.tsx`** — orchestrator gains trigger state (`triggerArmed`,
  `triggerThreshold`) and refs read inside the async `handleReadings` loop
  (`triggerArmedRef`, `triggerThresholdRef`, plus the existing `recordingRef`);
  the per-sample pass evaluates the trigger and may toggle `recording` /
  `flushSession()`.
- **`components/Controls.tsx`** — new threshold input + arm toggle, wired through
  props; respects the existing `canRecord` (connected) gating.
- **No parser, serial, or backend changes.** Trigger evaluates the already-
  normalized `baseValue`, so `lib/parser.ts` and `lib/useSerial.ts` are untouched.
- No new dependencies.
