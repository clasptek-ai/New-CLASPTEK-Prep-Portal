# Package Manifest: @clasptek/application-identity-sync

## Purpose

Provides event-driven identity synchronization logic, consuming webhook payloads from Supabase Auth and syncing user aggregates.

## Metadata

- **Owner**: Platform Infrastructure Team
- **Depends On**: `@clasptek/kernel`, `@clasptek/domain-identity`, `@clasptek/application-identity`
- **Publishes**: `IdentitySynchronizer` helper classes.
- **Consumes**: Supabase webhook payloads.
- **Business Domain**: Bounded Context Synchronization
- **ADR References**: None
