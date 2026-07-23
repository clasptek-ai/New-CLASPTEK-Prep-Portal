# Clasptek Engineering Standards & Architectural Policy

**Status**: Canonical Standard (Design Law)  
**Governance Scope**: Enterprise Monorepo, Web Applications, Domain Packages

---

## 1. Feature-First Architecture

All frontend applications shall adhere to Feature-First Architecture:

- `src/features/[domain-feature]/`: Each domain feature owns its components, custom hooks, API service layer, Zod validation schemas, TypeScript interfaces, and unit tests.
- `src/layouts/`: Pure presentation layout containers without business logic.
- `src/providers/`: Global composition root providers.
- `src/shared/`: Shared design system components, configuration objects, and cross-cutting utility functions.

## 2. Server State vs Local UI State

- **Server State**: All server state data fetching, caching, and mutation MUST be managed via TanStack Query (`@tanstack/react-query`).
- **Local UI State**: `useState` and `useReducer` are reserved strictly for localized presentation state (e.g., dropdown open/close state, active tab selections).

## 3. Strict Separation of Concerns

- UI presentation components must remain "dumb" (free of direct `fetch`/API logic).
- API calls and asynchronous business logic belong exclusively inside services (`*.service.ts`) and custom hooks (`use*.ts`).
