## ADDED Requirements

### Requirement: Trigger threshold configuration

The system SHALL allow the user to enter a numeric trigger threshold, interpreted
in the active measurement mode's base SI unit (V, A, OM, F). The threshold input
SHALL be available in the recording controls regardless of connection state, but
the trigger SHALL only act on readings while the device is connected.

#### Scenario: User enters a threshold value

- **WHEN** the user types `5` into the trigger threshold field while in Voltage mode
- **THEN** the system stores `5` (volts) as the active trigger threshold

#### Scenario: Empty or non-numeric threshold

- **WHEN** the threshold field is empty or contains a non-numeric value
- **THEN** the trigger SHALL be treated as inactive and SHALL NOT start logging

### Requirement: Arming the trigger

The system SHALL provide an arm/disarm toggle ("Auto-start on trigger"). The
trigger SHALL only evaluate readings and auto-start logging when it is **armed**.
The toggle SHALL be disabled when no valid threshold is set or when the device is
disconnected.

#### Scenario: Trigger does not fire while disarmed

- **WHEN** the trigger is disarmed and a reading exceeds the threshold
- **THEN** logging SHALL NOT auto-start

#### Scenario: Arming requires a valid threshold

- **WHEN** the threshold field is empty
- **THEN** the arm toggle SHALL be disabled and the trigger cannot be armed

### Requirement: Auto-start on threshold crossing

When the trigger is armed and not already recording, the system SHALL start
logging as soon as the magnitude of the live reading's base value
(`|baseValue|`) exceeds the threshold. Overload (`OL`, `baseValue === null`)
readings SHALL NOT satisfy the trigger.

#### Scenario: Reading magnitude exceeds threshold

- **WHEN** the trigger is armed with threshold `3` (V) and a reading of `-5 V` arrives
- **THEN** logging auto-starts (magnitude `5` exceeds `3`)

#### Scenario: Reading magnitude below threshold

- **WHEN** the trigger is armed with threshold `3` (V) and a reading of `1 V` arrives
- **THEN** logging does not start

#### Scenario: Overload reading does not trigger

- **WHEN** the trigger is armed and an `OL` reading (`baseValue === null`) arrives
- **THEN** logging does not start

### Requirement: Auto-stop with hysteresis

When logging was started by the trigger, the system SHALL stop logging when the
reading magnitude falls back below a **release level** that is strictly lower
than the start threshold (hysteresis), so that a signal hovering near the
threshold does not rapidly flap logging on and off. The release level SHALL be
derived from the threshold (e.g. a fixed fraction below it) rather than equal to
it.

#### Scenario: Signal falls clearly below release level

- **WHEN** trigger-started logging is active with threshold `3` (V) and the reading drops to `1 V`
- **THEN** logging auto-stops and the session is flushed to statistics

#### Scenario: Signal dips between release level and threshold

- **WHEN** trigger-started logging is active and the reading dips just under the threshold but stays above the release level
- **THEN** logging continues (does not flap off)

#### Scenario: Single armed event produces a single session

- **WHEN** the signal rises above the threshold, oscillates near it, then settles below the release level
- **THEN** exactly one logging session is recorded for the event

### Requirement: Coexistence with manual logging

The trigger SHALL coexist with manual Start/Stop logging without conflict.
Auto-stop SHALL only apply to sessions that the trigger itself started; a session
the user started manually SHALL NOT be auto-stopped by the trigger falling below
the release level.

#### Scenario: Manual session is not auto-stopped

- **WHEN** the user manually starts logging and the (armed) trigger's signal is below the release level
- **THEN** logging continues until the user manually stops it

#### Scenario: Manual stop during a triggered session

- **WHEN** logging was auto-started by the trigger and the user clicks Stop
- **THEN** logging stops immediately and remains stopped until the trigger fires again

### Requirement: Safe reset on disconnect and mode change

The system SHALL safely reset trigger-driven recording on disconnect and on a
mode/unit change. A disconnect SHALL stop any trigger-started recording. A
mode/unit change SHALL stop any in-progress logging (manual or trigger-started),
flush the current session, AND reset the trigger: the threshold SHALL be cleared
to empty and the trigger SHALL be disarmed (since neither the captured data nor
the threshold value is meaningful in the new unit). The first reading after
connecting is initial detection, not a change, and SHALL NOT stop logging or
clear a threshold the user already entered.

#### Scenario: Disconnect stops triggered logging

- **WHEN** logging was auto-started by the trigger and the device disconnects
- **THEN** logging stops and the in-progress session is flushed

#### Scenario: Mode change stops logging and resets the trigger

- **WHEN** the measurement mode changes while logging is active (manual or trigger-started)
- **THEN** logging stops, the current session is flushed, the threshold is cleared to empty, and the trigger is disarmed

#### Scenario: First reading preserves a pre-entered threshold

- **WHEN** the user types a threshold while disconnected, then connects and the first reading arrives
- **THEN** the threshold is NOT cleared (initial mode detection is not a mode change)
