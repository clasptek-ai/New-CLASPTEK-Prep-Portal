# package: @clasptek/domain-assessment-runtime

## Core Aggregate Roots

- `AssessmentInstance` (owns immutable snapshot, policies)
- `AssessmentSession` (owns active delivery, lifecycle state machine)

## Key Value Objects

- `TimerPolicy` (Countdown, Stopwatch, Section Timer, Per Question Timer, Unlimited)
- `NavigationPolicy` (Free, Sequential, No Backtracking, Section Locked, Adaptive)
- `AutosavePolicy` (Interval, On Navigation, On Answer, Manual Only)

## Key Entities

- `StudentAnswerSheet` (records active options select status)
- `RuntimeCheckpoint` (unsynced items, device fingerprint, elapsed state)
- `SecurityIncident` (window focus alerts, copy/paste tracking)
