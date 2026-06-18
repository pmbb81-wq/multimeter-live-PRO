## 1. Trigger state & refs (app/page.tsx)

- [x] 1.1 Add `triggerArmed` (boolean) and `triggerThreshold` (string, like `rangeMin`) `useState`, plus `RELEASE_RATIO` module constant (~0.9)
- [x] 1.2 Add refs `triggerArmedRef`, `triggerThresholdRef` (number | null), and `triggerStartedRef` (boolean); sync the first two via effects (mirror `autoScaleRef`), parsing the threshold with `toFinite`
- [x] 1.3 Set `triggerStartedRef.current = false` in `handleToggleRecord`/`setRec` for manual starts, and clear it on manual stop so manual sessions are never auto-stopped

## 2. Trigger evaluation in the read loop (app/page.tsx)

- [x] 2.1 In `handleReadings`, resolve threshold/release/armed once before the loop (hot-path opt, like the range bounds)
- [x] 2.2 In the per-sample loop, on a start edge (`armed && !recordingRef.current && baseValue !== null && |baseValue| > threshold`): call `flushSession()`, set `recordingRef.current = true` and `triggerStartedRef.current = true`, and mark recording-changed
- [x] 2.3 On a stop edge (`triggerStartedRef.current && recording && baseValue !== null && |baseValue| < release`): set `recordingRef.current = false`, clear `triggerStartedRef`, and mark recording-changed
- [x] 2.4 After the loop, if recording changed, call `setRecording(recordingRef.current)` exactly once (no per-sample setState)
- [x] 2.5 Ensure the disconnect effect and mode/unit-change branch still leave the trigger in a safe state (recording stopped / session flushed, `triggerStartedRef` cleared)

## 3. Controls UI (components/Controls.tsx)

- [x] 3.1 Add props: `triggerThreshold`, `onTriggerThresholdChange`, `triggerArmed`, `onTriggerArmedChange`, `canArm`
- [x] 3.2 Add a "Trigger" `SectionHeader` with a `RangeField`-style threshold input and the `Toggle` ("Auto-start on trigger")
- [x] 3.3 Disable the arm toggle unless `canArm` (valid numeric threshold && connected); show the active base unit alongside the field
- [x] 3.4 Wire the new props from `app/page.tsx` (compute `canArm` from `toFinite(triggerThreshold) !== null && status === 'connected'`)

## 4. Verification

- [x] 4.1 `npx tsc --noEmit` passes and `npm run lint` is clean
- [x] 4.2 Manually verify against scenarios: arm + magnitude crossing auto-starts; signal hovering near threshold does not flap (one session); manual session is not auto-stopped; disconnect/mode-change reset behave correctly
