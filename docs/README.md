# Clasptek Prep Portal V2 — Architecture and Engineering Documentation

This directory contains the governing architecture and engineering documents for Clasptek Prep Portal V2.

## Reading order

1. `architecture/phase-0/Clasptek_Prep_Portal_V2_Phase_0_Enterprise_Architecture.md`
2. `architecture/phase-0-5/Clasptek_Prep_Portal_V2_Phase_0_5_Canonical_Architecture.md`
3. `engineering-governance/Clasptek_Prep_Portal_V2_Engineering_Implementation_Governance_Guide.md`
4. Supporting CSV catalogues and registers in the same directories.

## Authority order

- Phase 0 defines the product and solution architecture.
- Phase 0.5 defines the canonical domains, business rules, logical data design, commands and events.
- Engineering Governance controls how Phase 1 and later implementation must be delivered.
- Approved Architecture Decision Records supersede earlier decisions only where explicitly stated.

## Repository rule

Keep these documents under `docs/`. Do not place them inside `apps/web`, `packages`, `database/migrations`, or the repository root. Do not edit published governing documents silently; propose changes through an ADR or a clearly versioned revision.

---

## Documentation Directory Map

This repository organizes engineering and architectural documentation into distinct directories based on purpose and scope:

*   **[architecture/](file:///c:/Users/CLASPTEK/New%20CLASPTEK%20Prep%20Portal/docs/architecture/)**: Stores global architecture specifications, phase blueprints (Phases 0 through 3), and the Bounded Context Architecture Decision Records (ADRs) Registry.
    *   **[architecture/ADR/](file:///c:/Users/CLASPTEK/New%20CLASPTEK%20Prep%20Portal/docs/architecture/ADR/)**: Index and logs of Bounded Context architectural design decisions (ADR-001 through ADR-023).
*   **[domains/](file:///c:/Users/CLASPTEK/New%20CLASPTEK%20Prep%20Portal/docs/domains/)**: Stores specialized domain catalogs, aggregate definitions, and domain-level boundary documents.
*   **[engineering/](file:///c:/Users/CLASPTEK/New%20CLASPTEK%20Prep%20Portal/docs/engineering/)**: Contains engineering-specific design files, monorepo workspace baselines, and Engineering Decision Records (EDRs).
*   **[engineering-governance/](file:///c:/Users/CLASPTEK/New%20CLASPTEK%20Prep%20Portal/docs/engineering-governance/)**: Houses quality gates, PR compliance checklists, coding standards, and implementation governance rules.
*   **[enterprise-complete/](file:///c:/Users/CLASPTEK/New%20CLASPTEK%20Prep%20Portal/docs/enterprise-complete/)**: Autoritative catalogs for the complete enterprise scope, including database schemas, state machines, domain events, RBAC permissions, and the visual UI Design System.
*   **[governance/](file:///c:/Users/CLASPTEK/New%20CLASPTEK%20Prep%20Portal/docs/governance/)**: The canonical repository for Sprint-specific engineering governance reports (Architecture Freezes, Database Manifests, Metrics, OpenAPI/Performance Baselines, and Readiness Reports).
*   **[playbooks/](file:///c:/Users/CLASPTEK/New%20CLASPTEK%20Prep%20Portal/docs/playbooks/)**: Actionable step-by-step developer guidelines for environment configuration, onboarding setup, and troubleshooting.
*   **[releases/](file:///c:/Users/CLASPTEK/New%20CLASPTEK%20Prep%20Portal/docs/releases/)**: High-level baseline release logs and tags (e.g., `v0.1.0-platform-foundation`).
*   **[security/](file:///c:/Users/CLASPTEK/New%20CLASPTEK%20Prep%20Portal/docs/security/)**: Authorized authentication/authorization flows, threat matrices, Row-Level Security (RLS) policies, and the Security Operations Manual.
*   **[archive/](file:///c:/Users/CLASPTEK/New%20CLASPTEK%20Prep%20Portal/docs/archive/)**: Archive containing superseded or deprecated documents kept for historical audit trails.
