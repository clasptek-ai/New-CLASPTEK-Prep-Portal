# Clasptek Prep Portal V2 — Phase 1 Acceptance Checklist

## Scope control

- [ ] Only Identity & Access is implemented as a business domain.
- [ ] No course, enrollment, journey, learning, question, assessment, simulation, AI, analytics or student-success entity exists.
- [ ] No placeholder academic routes or UI are present.
- [ ] No new business concept or renamed canonical object was introduced.

## Foundation

- [ ] Clean checkout bootstrap succeeds.
- [ ] Build, lint, type-check and architecture tests pass.
- [ ] CODEOWNERS and protected branch rules are active.
- [ ] Configuration validation and secret management are operational.

## Database

- [ ] Clean migration and upgrade migration pass.
- [ ] Permitted schemas/entities only.
- [ ] Constraints, indexes and ownership reviewed.
- [ ] Default-deny RLS and negative tests pass.
- [ ] Backup restore is rehearsed.

## Identity and security

- [ ] Registration, verification, login, logout and reset pass.
- [ ] Sessions/devices are visible and revocable.
- [ ] No secrets/tokens in browser storage or logs.
- [ ] Authorization defaults to deny.
- [ ] Role assignments are scoped, expirable and audited.
- [ ] Critical threat-model issues are closed.
- [ ] Security headers, CSRF, CORS and rate limits pass.

## Platform services

- [ ] Private upload, validation, quarantine and scanning hooks pass.
- [ ] Notification retries, deduplication and dead-letter handling pass.
- [ ] Audit is immutable, restricted and redacted.
- [ ] Request IDs and trace context propagate through workers.
- [ ] Health checks, metrics, dashboards and alerts are verified.

## API and quality

- [ ] `/api/v1` contracts and OpenAPI match.
- [ ] Standard errors, pagination, filtering, sorting and idempotency pass.
- [ ] Unit, integration, database, contract and browser tests pass.
- [ ] Accessibility checks pass.
- [ ] CI blocks non-compliant changes.
- [ ] Deployment promotion and rollback are rehearsed.

## Documentation and operations

- [ ] Setup, coding, API, database, deployment and troubleshooting guides exist.
- [ ] Security, backup, rollback and incident runbooks exist.
- [ ] On-call and module owners accept handover.
- [ ] Phase 1 evidence pack is complete.

## Phase 2 gate

- [ ] Architecture Governance Board approval.
- [ ] Release Approval Group approval.
- [ ] No unresolved critical issue.
