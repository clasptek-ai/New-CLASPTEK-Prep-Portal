# ADR-018: Instructor Workspace Architecture

## Status

Accepted

## Context

Phase 4 requires an Instructor Workspace for managing classrooms, diagnostic assessments, and calibrating AI outcomes. To prevent layout complexity and simplify role redirection, we need structured routing guidelines.

## Decision

1. **Unified Context Routing**: Enforce all instructor routing layouts under `/instructor/` (e.g. `/instructor/students/[studentId]`). This cleanly isolates student-facing pages from teacher workspaces.
2. **Permission Checkpoints**: Action buttons (such as overrides or mock releases) query granular user privileges.
3. **Tabbed Nested Workspaces**: Avoid flat bloated files by utilizing tab containers for dynamic sub-feature renders.
4. **Instructor Scoping**: Enforce strict row-level scoping so Instructors can only query data matching their assigned programmes.
5. **Pluralized Services Layer**: Standardize on plural domain services under `services/instructor/` to isolate queries from UI components.

## Consequences

- Clean separation of concerns between Student and Instructor experiences.
- Strict security boundaries blocking Instructor-to-Instructor profile leakages.
- Clearer API routing structure.
