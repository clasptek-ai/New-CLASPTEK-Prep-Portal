# ADR 026: Transactional Outbox Pattern for Integration Events

## Context
When an exam product is published or updated, downstream contexts (e.g. Question Bank, Curriculum, Learning) must react. Dispatching events directly over network brokers inside the aggregate transaction creates distributed integrity risks.

## Decision
We implement the Transactional Outbox Pattern:
- **Outbox Table:** Domain events are converted to Integration Events and written to the `outbox_events` table inside the same transaction block as the aggregate mutations.
- **Relay Worker:** An asynchronous background worker processes the outbox records and broadcasts them downstream.

## Consequences
- Guarantees at-least-once event delivery.
- Prevents database-to-message-broker drift.
- Downstream domains are updated reliably.
