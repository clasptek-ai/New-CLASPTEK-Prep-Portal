# ADR-021: Unified Workspace Framework Architecture

## Status
Accepted

## Context
As the platform has expanded, layout, theme settings, and switcher mechanisms were replicated across four standalone pages layouts. Consolidating this duplicates logic simplifies styling adjustments.

## Decision
1. **Declarative Registry Mapping**: Register all core routes and navigation metadata in `workspace-registry.ts`.
2. **Dynamic Context Hydration**: Wrap app elements in `<WorkspaceProvider />` to cache theme states.
3. **Pluggable Event Buses**: Coordinate role changes via simple decoupled subscribers callbacks.

## Consequences
- Clean separation of UI styling from functional page components.
- Zero duplicate layouts.
