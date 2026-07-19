# ADR 028: Semantic Versioning and Optimistic Concurrency Control

## Context
Examination board structures change periodically. The platform must maintain historically accurate structures while allowing draft revisions. Concurrent updates by multiple academic authors must be prevented.

## Decision
- **Semantic Versioning:** Product structures are versioned with semantic versions (e.g. `1.0.0`, `2.1.0`).
- **Optimistic Concurrency:** Tables contain `version_no` (record incrementer) and `lock_version` (concurrency checker). Writes are rejected if expected version checks mismatch.

## Consequences
- Historical structures are preserved.
- Prevents write collisions and lost updates in multi-author studios.
