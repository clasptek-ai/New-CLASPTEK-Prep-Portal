# Package Manifest: @clasptek/application-identity

## Purpose

Declares the Application Layer commands, handlers, DTO structures, and identity query contracts to isolate database access and HTTP controllers from the domain.

## Metadata

- **Owner**: Technical Architecture & Application Leads
- **Depends On**: `@clasptek/domain-identity`, `@clasptek/kernel`
- **Publishes**: CreateUserHandler, UpdateProfileHandler, ArchiveUserHandler, RestoreUserHandler, and IdentityLookupService
- **Consumes**: Domain Entities, Specs, and Policy guards
- **Business Domain**: Identity Domain Core
- **ADR References**: [ADR-003](../../docs/architecture/ADR/003-ddd.md)
