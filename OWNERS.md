# Clasptek Prep Portal V2 — Module Ownership Registry

| Module/Package Path       | Team Owner                   | Primary Responsibilities                              |
| ------------------------- | ---------------------------- | ----------------------------------------------------- |
| `/apps/web`               | Frontend Platform Team       | Web App Experience and Shell                          |
| `/apps/worker`            | Site Reliability Engineering | Background job processors                             |
| `/packages/persistence`   | Database Engineering         | DB connection pools, migrations, schema maps          |
| `/packages/configuration` | Site Reliability Engineering | Environment loaders, validation settings              |
| `/packages/observability` | Site Reliability Engineering | Structured logging, OpenTelemetry traces              |
| `/packages/validation`    | Frontend & Backend Platform  | Shared validation schemas                             |
| `/packages/contracts`     | Platform Architecture Team   | API and external event contracts                      |
| `/packages/events`        | Platform Architecture Team   | Event bus interface, envelope structures              |
| `/packages/authorization` | Platform Security Team       | RBAC, permissions registry, policy engine             |
| `/packages/testing`       | Quality Assurance Team       | Testing configuration, Vitest & Playwright helpers    |
| `/packages/ui`            | Frontend Design System Team  | Core design system, Vanilla CSS foundations           |
| `/packages/kernel`        | Platform Architecture Team   | DDD core modules (AggregateRoot, Entity, DomainEvent) |
| `/packages/shared`        | Platform Architecture Team   | Global utility modules                                |
