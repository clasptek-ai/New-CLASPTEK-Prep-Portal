# ADR-017: Presentation Layer Architecture

## Status

Accepted

## Context

Phase 4 requires the implementation of the Student Experience Portal. To maintain absolute decoupling of presentation and business domain logic, and to support robust testing and future swap-outs of core UI libraries (like TailwindCSS/shadcn), we require a structured presentation layer architecture.

## Decision

We enforce a strict layered folder hierarchy:

1. **Thin App Router Views (`app/`)**: Contain Next.js Page components. Responsibility is limited to loading raw initial data (Server Components) and rendering Feature Screen wrappers.
2. **Modular Features (`features/`)**: Contain self-contained logic, visual components, layout compositions, local state, and Zod validations for specific screens (e.g. `dashboard/`, `coach/`).
3. **Stateless UI Design System (`components/ui/`)**: Reusable atomic primitives (buttons, inputs, cards, lists) built around styling abstractions.
4. **SVG Visual Charts (`components/charts/`)**: Custom lightweight SVG drawing components (Line, Radar, HeatMap).
5. **Centralized Services Layer (`services/`)**: Centralized endpoint fetching actions with error logging and mock fallback overrides.

## Consequences

- Zero database queries or domain logic leaks into React files.
- Simple testing isolation.
- Swap-out of UI dependencies is possible without editing feature screens.
