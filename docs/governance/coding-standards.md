# Frontend Coding Standards & Conventions

**Status**: Canonical Standard (Design Law)  
**Governance Scope**: All React 19, TypeScript, and Component Files

---

## 1. TypeScript Rules

- Enforce strict TypeScript (`noImplicitAny`, `strictNullChecks`).
- Explicitly define DTO interfaces and domain models.
- Avoid using `any`; use `unknown` or specific generics when type is dynamic.

## 2. Component Design Standards

- Functional React components only (`React.FC` or standard function declarations).
- Prefer named exports (`export function ComponentName()`) over default exports.
- One component per file. One custom hook per file.
- All form controls MUST handle `Loading`, `Success`, `Error`, `Disabled`, `Offline`, and `Expired Session` UI states.
