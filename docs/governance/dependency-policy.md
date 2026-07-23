# Design System Dependency & Composition Policy

**Status**: Canonical Standard

## 1. Dependency Policy

The implementation engine SHALL:

- Reuse existing project dependencies (`react`, `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-query`) whenever possible.
- NOT introduce a new dependency if the functionality can be implemented natively using React, TypeScript, or Vanilla CSS.
- Justify every new dependency in the sprint completion report.
- Never introduce overlapping libraries (e.g. two icon libraries or two form validation libraries).
- Keep the dependency graph minimal and lean.

---

## 2. Public API Requirements

- Every component MUST be re-exported through `src/shared/ui/index.ts`.
- Future sprints MUST import components via `@/shared/ui`. Deep relative imports (`import Button from '@/shared/ui/button/Button'`) are strictly prohibited.

---

## 3. Composition Rules

- `Button` SHALL NOT render `Card`.
- `Card` SHALL NOT depend on `Input`.
- Validation helpers SHALL NOT import business logic or server state.
- Components may depend ONLY on Design Tokens, Shared Utilities, Shared Hooks, and Foundation Primitives.

---

## 4. Performance Requirements

Every component SHALL:

- Avoid unnecessary re-renders via `React.memo` where appropriate.
- Support tree-shaking.
- Avoid inline object creation in JSX props where practical.
- Avoid unnecessary context subscriptions.
