# Clasptek Prep Portal V2 — Pull Request Compliance Checklist

Every pull request must answer these questions. “Not applicable” requires a reason.

## Architectural traceability

- [ ] Which approved domain owns this change?
- [ ] Which aggregate or read model is changed?
- [ ] Which Phase 0.5 business rule IDs apply?
- [ ] Which ADR authorises the business/architecture decision?
- [ ] Which EDR authorises the implementation approach?
- [ ] Does this introduce a new business concept? If yes, stop and obtain an ADR.
- [ ] Are all cross-domain dependencies permitted?
- [ ] Is any source-of-truth ownership being duplicated?

## Behaviour and contracts

- [ ] Which commands are handled?
- [ ] Which domain events are published?
- [ ] Which events are consumed?
- [ ] Are event and API contracts backward compatible?
- [ ] Are idempotency and retry semantics defined?
- [ ] Are state-machine transitions valid?

## Data and security

- [ ] Which entities or projections are changed?
- [ ] Is a migration required?
- [ ] Are constraints, indexes and query plans reviewed?
- [ ] Which permissions are required?
- [ ] Which RLS policies are affected?
- [ ] Are tenant, enrollment and object-level negative tests included?
- [ ] Are audit records created for sensitive actions?
- [ ] Is PII minimised and classified?
- [ ] Are uploads, secrets or external payloads handled safely?

## Quality

- [ ] Unit tests added or updated.
- [ ] Integration and database tests added or updated.
- [ ] Contract tests added or updated.
- [ ] Browser tests added for critical flows.
- [ ] Accessibility checks completed.
- [ ] Performance budget reviewed.
- [ ] Failure, retry and rollback behaviour tested.
- [ ] Logs, metrics and traces added.
- [ ] Runbook or support documentation updated.
- [ ] Feature flag and rollout plan defined.
