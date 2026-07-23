# Workspace Implementation Baseline — v1.0

This governed engineering standard defines the technical requirements, architecture constraints, and quality gates for implementing workspaces within the Clasptek Prep Portal V2. All workspaces must adhere to these rules to maintain security, performance, and UI consistency.

---

## 1. `WorkspaceShell` Integration Standards

- **Generic Workspace Role Wrapper**: Every view belonging to a workspace role (e.g. `STUDENT`, `INSTRUCTOR`, `ADMIN`) must be wrapped within the single reusable `WorkspaceShell` container.
- **Client-side Routing Guard**: `WorkspaceShell` reads the role-specific permissions and maps standard client authorization checks using `<RouteGuard allowedRoles={...}>`.
- **Side Panel Collapsibility**: Sidebar expansion state preferences must be synced globally via the workspace preferences context to prevent screen shifts.
- **Next.js Router Navigation**: Any sidebar switch or redirection path must utilize Next.js client-side `useRouter().push()` routines instead of legacy window redirects.

---

## 2. Service Layer Conventions

- **Module Isolation**: Services must be grouped into separate directories per bounded context:
  - `/services/student/`
  - `/services/instructor/`
  - `/services/admin/` (new)
- **REST Endpoints Mapping**: All HTTP data fetches must go through `/src/services/api/client.ts` to allow local mocked storage bypass fallbacks.
- **Aggregated Endpoints**: Dashboard data must be fetched using a single aggregated endpoint (e.g., `getDashboardData()`) that acts as an orchestrator layer combining domain services.
- **No Direct API UI Calls**: React UI features components must NEVER call `apiClient`, `fetch`, or Supabase clients directly.

---

## 3. Context Provider Patterns

- **Context-Aware Screens**: Workspaces should instantiate a centralized context provider (e.g., `StudentWorkspaceProvider`) at the root page route level.
- **Scope Parameters**: The provider is responsible for loading initialization metrics:
  - Active profile identity details.
  - Active curriculum/programme references.
  - Notification alert counters.
- **Data Deduplication**: Components inside the shell must consume `useStudentWorkspace()` (or similar role hooks) to access state metrics, avoiding redundant backend initialization queries.

---

## 4. Navigation Registry Configs

- **Navigation Config Registry**: All active sidebar links, default route layouts, and workspace themes must be registered inside [workspace-registry.ts](file:///c:/Users/CLASPTEK/New%20CLASPTEK%20Prep%20Portal/apps/web/src/workspace/workspace-registry.ts).
- **Structure Contract**:
  ```typescript
  export interface WorkspaceConfig {
    id: WorkspaceId;
    name: string;
    themeAccent: string;
    defaultRoute: string;
    searchScope: string;
    permissions: string[];
    navigation: { name: string; href: string; icon: string }[];
  }
  ```

---

## 5. UI States & Service Error Handling

- **Loading States**: Screens must render standard, non-blocking skeletons or indicator feeds during asynchronous fetches.
- **Empty States**: Render clean messages with clear call-to-actions when records are missing.
- **Standardized Errors**: Services must return standardized response signatures:
  - Unexpected network faults must be caught gracefully and return appropriate fallbacks rather than throwing runtime errors.
  - Display non-intrusive alert toasts/banners instead of blocking browser dialog `alert()` windows.

---

## 6. Testing Expectations

- **Workspace Integration Specs**: Create a workspace test file (e.g., `admin-workspace.test.ts`) mapping the active navigation items count and services.
- **TypeScript & ESLint Checks**: Execute `pnpm run typecheck` and `pnpm run lint` before committing any layout revisions to ensure 100% type safety.

---

## 7. Security & Authorization Standards

- **RBAC Enforcement**: Role-Based Access Control must be enforced at both the UI and API layers.
- **RLS Enforcement**: Supabase Row-Level Security (RLS) policies remain the source of truth for all data access restrictions.
- **Server Validation**: Client-side authorization is for UX flow only and must never replace server-side enforcement. Services must never trust client-supplied role or ownership identifiers without server-side validation.
- **Provider Scoping**: Workspace context providers should initialize only the authenticated user's permitted data scope.

---

## 8. Performance Standards

- **Dashboard Aggregation**: Aggregated services must be used to minimize independent HTTP network queries.
- **Lazy Loading**: Use code-splitting and dynamic imports for secondary screens and heavy interactive components.
- **Pagination**: Paginate all large datasets (users, resources, assignments, questions, notifications).
- **Caching**: Cache stable reference datasets where appropriate.
- **Deduplication**: Prevent duplicate requests during sidebar router navigation.
- **Responsive Interactions**: Maintain interactive responsiveness on the main thread during background refetches.

---

## 9. Shared Component Standards

- **Design System Centralization**: Reuse UI components from the centralized Design System. Avoid duplicating card, table, dialog, badge, form, or notification codebases.
- **Composition over Replacement**: Workspace-specific components must compose shared design system components rather than replace them.
- **Design Tokens Usage**: Styling parameters must resolve from design tokens (colors, margins, sizes) instead of hardcoded ad-hoc utility variables.

---

## 10. Documentation Standards

Every completed workspace sprint must update the following core documentation items:

- Architecture specification blueprints.
- OpenAPI API Client definitions catalog.
- Database Schema and Migration manifests (if changes occur).
- Workspace User and Developer Guide docs.
- Versioned sprint Changelog logs.

---

## 11. Definition of Ready (DoR)

Before a workspace sprint begins, the following conditions must be met:

- [ ] Architecture design approved.
- [ ] API contracts confirmed.
- [ ] Database schema validated.
- [ ] UI requirements finalized.
- [ ] Shared components identified.
- [ ] Testing strategy agreed.
- [ ] Acceptance criteria documented.

---

## 12. Definition of Done (DoD)

A workspace implementation is complete only when:

- [ ] All screens are functional.
- [ ] All services use the Service Layer.
- [ ] No direct API or Supabase calls exist in UI components.
- [ ] No mock datasets remain.
- [ ] No hardcoded identifiers remain.
- [ ] RBAC and RLS are verified.
- [ ] Zero TypeScript errors.
- [ ] Zero ESLint warnings.
- [ ] All automated tests pass.
- [ ] Production build succeeds.
- [ ] Documentation is updated.
