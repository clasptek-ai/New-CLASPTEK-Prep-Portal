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
