# ADR-019: Academic Authoring Studio Architecture

## Status

Accepted

## Context

Phase 4 requires an Academic Authoring Studio for managing curriculum programs, drafting question banks, and orchestrating reviewers approval queues. To keep editing tasks structured, we need architectural routing and workspace standards.

## Decision

1. **Isolated Pathing Routing**: Enforce all authoring routing files under `/authoring/` (e.g. `/authoring/programmes/[programmeId]`).
2. **Dynamic Workspaces**: Design editing surfaces as multi-tab workspaces (Overview, Outcomes, Versions, Publishing) to avoid overloaded single pages.
3. **Decoupled Rich Text Editors**: Abstract editor stubs into shared components to allow future pluggable rich text processors.

## Consequences

- Clean logical boundaries for content curators and administrators.
- Reusable metadata editors standardise tagging properties.
