# Sprint 001 — Enterprise Foundation & Authentication Shell Specification

**Project**: Clasptek Prep Portal V2  
**Specification Owner**: Platform Engineering Architecture Team  
**Status**: Canonical Standard (Design Law)  
**Target Date**: Sprint 001 Completion  
**Document Path**: [docs/sprints/sprint-001-foundation.md](file:///c:/Users/CLASPTEK/New%20CLASPTEK%20Prep%20Portal/docs/sprints/sprint-001-foundation.md)

---

## 1. Objective

Build a brand-new, enterprise-grade frontend shell from scratch using Feature-First Architecture (React 19 + TypeScript + Vite + TanStack Router + TanStack Query + TailwindCSS + shadcn/ui + Supabase Client), while strictly consuming the immutable backend API contract without creating new backend features or altering database schemas.

---

## 2. Architecture Decision Records (ADRs)

- **ADR-001 (Feature-First Architecture)**: Organize code by domain features (`features/auth`, `features/student-learning`) rather than technical type (`pages`, `components`), ensuring self-contained services, components, types, and tests per domain.
- **ADR-002 (TanStack Router Selection)**: Selected over React Router v6 for 100% type-safe routing, built-in search parameter validation via Zod, and declarative route trees.
- **ADR-003 (TanStack Query Server-State Strategy)**: TanStack Query v5 is designated as the single source of truth for all asynchronous server state. Local React state (`useState`, `useReducer`) is reserved strictly for UI presentation.
- **ADR-004 (Supabase Client Persistence)**: Supabase JS Client is retained for session verification and real-time subscription capabilities while consuming standard backend REST API endpoints.
- **ADR-005 (No Global Redux / MobX)**: Redux is explicitly prohibited to prevent duplicated server-state synchronization anti-patterns.

---

## 3. Implementation Philosophy & Scope

This sprint establishes core application infrastructure only. No business features shall be implemented. No dashboards shall be built. No examination UI shall be built. No programme logic shall be implemented. No reporting shall be implemented.

The objective is to create a stable enterprise shell upon which all future features will be developed. Any functionality outside this scope shall be deferred to later sprints.

---

## 4. Non-Goals

Sprint 001 does NOT include:

- Student Dashboard
- Examination Screens
- Admin Dashboard
- Question Bank
- Results
- Analytics
- AI Review Queue
- Practice Modules
- Mock Examination Engine
- Content Authoring Studio

_Do not build any of the above._

---

## 5. Backend Constraints & AI Behaviour Rules

### BACKEND CONSTRAINTS

The backend is frozen. Do NOT:

- Modify database migrations
- Modify Supabase schema or RLS policies
- Rename API endpoints or DTO interfaces
- Change authentication protocols or session mechanics
- Create new database tables

### OUT-OF-SCOPE API POLICY

If an API required by Sprint 001 does not exist in the backend:

1. **STOP** implementation immediately.
2. Create an explicit architectural blocker ticket.
3. Update the engineering specification.
4. _Never invent or mock unapproved backend endpoints._

### AI BEHAVIOUR RULES

If documentation conflicts with the existing backend:

- **STOP** immediately.
- Report the exact mismatch to the engineering lead.
- Do NOT guess or hallucinate new endpoints.
- Do NOT replace enterprise architectural patterns with simpler workarounds.

---

## 6. Security Requirements

- **JWT Persistence**: Never store JWT tokens in `localStorage` or `sessionStorage`.
- **Cookie Security**: Auth tokens must be transmitted in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
- **Redirect Protection**: Prevent open redirect vulnerabilities by strictly validating `redirectUrl` query parameters against white-listed internal routes (`/dashboard`, `/admin`).
- **State Clearing**: Clear all sensitive session state, user context, and query cache upon user logout (`queryClient.clear()`).
- **Form Hardening**: Disable browser autocomplete on sensitive password inputs where appropriate (`autoComplete="current-password"`).
- **CSRF Protection**: All mutation requests (`POST`, `PATCH`, `DELETE`) must include backend CSRF header tokens where configured.

---

## 7. Performance Budget & Metrics

| Performance Indicator            | Enterprise Target Threshold | Enforcement Mechanism              |
| :------------------------------- | :-------------------------- | :--------------------------------- |
| **Initial JS Shared Bundle**     | `≤ 250 KB` (gzipped)        | Vite bundle visualizer chunk alert |
| **First Contentful Paint (FCP)** | `< 1.8 s`                   | Web Vitals performance observer    |
| **Time to Interactive (TTI)**    | `< 3.0 s`                   | Lighthouse CI audit stage          |
| **Lighthouse Performance**       | `≥ 90 / 100`                | CI Build Pipeline Gate             |
| **Lighthouse Accessibility**     | `≥ 95 / 100`                | Automated axe-core audit gate      |
| **Lighthouse Best Practices**    | `≥ 95 / 100`                | Lighthouse Audit Gate              |

---

## 8. Coding Standards & Conventions

- **Strict TypeScript**: `noImplicitAny`, `strictNullChecks`, and `exactOptionalPropertyTypes` enabled.
- **Functional Paradigm**: Functional React components only (`React.FC` or standard functions). Class components prohibited.
- **Named Exports**: Prefer named exports (`export function Component()`) over default exports for enhanced refactoring and auto-import support.
- **Single Responsibility**: One React component per file. One custom hook per file.
- **Zero Inline Hex Colors**: All color styling must consume CSS design tokens (`var(--text-primary)`).

---

## 9. Logging Policy

### Development Environment

- `console.debug()` and structured logger enabled for API lifecycle tracing and state change debugging.

### Production Environment

- `console.log()` and `console.error()` calls stripped during production build (`drop_console: true` in minifier).
- All caught exceptions routed to central observability logging provider.

---

## 10. Observability & Event Tracking

The platform monitors the following core telemetry events:

- `auth.login.success`: Logged upon valid session initialization.
- `auth.login.failure`: Logged upon authentication failure with error code.
- `auth.session.refresh`: Logged during background cookie token refresh.
- `route.transition`: Logged on TanStack Router route changes.
- `api.latency.ms`: Measured for all REST endpoint invocations.

---

## 11. Traceability & Requirement Mapping

### Architectural References

- **Volume I (System Blueprint)**: Section 3.2 (Authentication & Session Architecture)
- **Volume II (Domain Engine)**: Chapter 5 (Identity & Access Synchronization)
- **Volume IV (UX Blueprints)**: Authentication Shell Specifications

### Requirement IDs

- `AUTH-001`: User authentication via Supabase Auth + Postgres User Aggregate synchronization.
- `AUTH-002`: Session persistence and HttpOnly cookie lifecycle management.
- `NAV-001`: Role-based route guard authorization (`STUDENT`, `INSTRUCTOR`, `ADMINISTRATOR`).

---

## 12. Deliverables

1. **Foundation Infrastructure**: Shared Vite + TypeScript configuration, path aliases (`@/*`), and environment validation (`env.config.ts`).
2. **Routing System**: Type-safe TanStack Router setup with declarative route tree.
3. **Providers Architecture**: Composition root incorporating `ErrorBoundaryProvider`, `NotificationProvider`, `QueryProvider`, `ThemeProvider`, and `AuthProvider`.
4. **Layout Shells**: Pure presentation layout wrappers (`PublicLayout`, `StudentLayout`, `AssessmentLayout`, `AdminLayout`).
5. **Authentication Shell**: Auth feature module (`src/features/auth`) with `LoginForm`, `RegisterForm`, and `auth.service.ts`.
6. **Theme Engine**: Tri-state theme manager (System / Light / Dark) with multi-tab synchronization and local storage persistence.
7. **Build & Test Pipeline**: Passing Vitest unit test runner and Playwright E2E configuration.

---

## 13. Technical Design & File Ownership

| Module / Component      | Owner               | Status     | Dependencies                     |
| :---------------------- | :------------------ | :--------- | :------------------------------- |
| `PublicLayout`          | Platform Team       | Sprint 001 | `ThemeProvider`, `Navigation`    |
| `StudentLayout`         | Student Core Team   | Sprint 001 | `AuthProvider`, `Navigation`     |
| `AdminLayout`           | Admin Core Team     | Sprint 001 | `AuthProvider`, `RoleGuard`      |
| `AssessmentLayout`      | Exam Core Team      | Sprint 001 | `ThemeProvider`                  |
| `AuthProvider`          | Identity Team       | Sprint 001 | `auth.service.ts`, `QueryClient` |
| `ErrorBoundaryProvider` | Core Infrastructure | Sprint 001 | Toast System                     |
| `NotificationProvider`  | UX Infrastructure   | Sprint 001 | Toast Container                  |

---

## 14. Folder Structure

```
src/
 ├── app/
 │   ├── main.tsx
 │   ├── router.tsx
 │   └── routes/
 │       ├── index.tsx
 │       ├── login.tsx
 │       ├── register.tsx
 │       ├── forgot-password.tsx
 │       ├── student.tsx
 │       ├── admin.tsx
 │       └── assessment.tsx
 ├── features/
 │   └── auth/
 │       ├── components/
 │       │   ├── LoginForm.tsx
 │       │   └── RegisterForm.tsx
 │       ├── hooks/
 │       │   ├── useAuth.ts
 │       │   └── useSession.ts
 │       ├── services/
 │       │   └── auth.service.ts
 │       ├── schemas/
 │       │   └── auth.schemas.ts
 │       ├── types/
 │       │   └── auth.types.ts
 │       └── tests/
 │           └── auth.service.test.ts
 ├── layouts/
 │   ├── PublicLayout.tsx
 │   ├── StudentLayout.tsx
 │   ├── AssessmentLayout.tsx
 │   └── AdminLayout.tsx
 ├── providers/
 │   ├── AppProvider.tsx
 │   ├── ErrorBoundaryProvider.tsx
 │   ├── NotificationProvider.tsx
 │   ├── QueryProvider.tsx
 │   ├── ThemeProvider.tsx
 │   └── AuthProvider.tsx
 ├── shared/
 │   ├── config/
 │   │   ├── api.config.ts
 │   │   └── env.config.ts
 │   └── lib/
 │       ├── query-client.ts
 │       └── supabase.ts
 └── types/
     └── common.types.ts
```

---

## 15. Components & UI States

### Form Components

#### `LoginForm`

- **States**:
  - `Loading`: Disables submit button, renders inline loading spinner.
  - `Success`: Redirects to allocated workspace dashboard.
  - `Error`: Displays accessible error banner (`aria-live="polite"`).
  - `Disabled`: Fields and buttons locked during active submission.
  - `Offline`: Renders offline warning notice.
  - `Expired Session`: Displays session expiration alert badge.

#### `RegisterForm`

- **States**: `Loading`, `Success`, `Error`, `Disabled`, `Offline`, `Password Validation Feedback`.

---

## 16. Services & API Contracts

Authentication services **MUST** consume the existing backend API contract. Do not hardcode endpoint paths. Read endpoint definitions from `api.config.ts` or generated backend client definitions.

```typescript
// src/shared/config/api.config.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    SESSION: '/api/v1/auth/session',
    REGISTER: '/api/v1/auth/register',
  },
} as const;
```

---

## 17. Accessibility Checklist (WCAG 2.1 AA)

- [x] **Keyboard Navigation**: 100% accessible via `Tab`, `Shift+Tab`, `Enter`, and `Space`.
- [x] **Focus Trapping**: Modals and slide-over drawers trap focus correctly.
- [x] **Skip Links**: "Skip to main content" link provided for screen readers.
- [x] **Screen Reader Labels**: Form inputs bound via `htmlFor`, icon buttons specify `aria-label`.
- [x] **ARIA Landmarks**: `<header>`, `<main>`, `<nav>`, and `<aside>` landmark roles enforced.
- [x] **Visible Focus Rings**: High-contrast focus outline (`2px solid #38bdf8`) on focused interactive elements.
- [x] **Color Contrast**: 4.5:1 minimum contrast for body copy, 3:1 for large display elements.

---

## 18. Definition of Done & Sprint Exit Criteria

### Definition of Done

- [x] ESLint lint passes (`pnpm lint`)
- [x] TypeScript typecheck passes (`pnpm typecheck`)
- [x] Production build succeeds (`pnpm build`)
- [x] Test suite passes (`pnpm test`)
- [x] Zero browser console errors
- [x] WCAG AA accessibility checklist verified
- [x] Responsive layout verified
- [x] Dark / Light theme multi-tab sync verified
- [x] Backend code remains 100% unchanged

### Sprint Exit Criteria

- [x] Authentication shell fully functional
- [x] Tri-state theme manager implemented and verified
- [x] Routing tree established
- [x] Composition providers root operational
- [x] CI Build & Test pipeline green
- [x] Engineering documentation updated

---

## 19. Expanded Risks & Mitigation

| Risk Scenario              | Impact                         | Mitigation Strategy                                                                         |
| :------------------------- | :----------------------------- | :------------------------------------------------------------------------------------------ |
| **HttpOnly Cookie Config** | Auth session lost across ports | Vite dev proxy config forwards `/api/v1` to `localhost:3000` with `credentials: 'include'`. |
| **CORS Misconfiguration**  | Preflight request blocked      | Server headers configured for local dev origins.                                            |
| **Session Refresh Loop**   | Infinite redirect loop on 401  | `AuthProvider` breaks redirect loops if current path is `/login`.                           |
| **Offline Startup**        | App crashes on network loss    | `NotificationProvider` displays offline banner notice.                                      |

---

## 20. Rollback Plan & Next Sprint Transition

- **Rollback Plan**: If Sprint 001 fails verification, revert Git commits to initial tag `v2.0.0-anchor`.
- **Next Sprint Transition**: Proceed to **Sprint 002 — Design System Component Library** upon satisfying Sprint Exit Criteria.
