# Testing & Quality Assurance Policy

**Status**: Canonical Standard (Design Law)  
**Governance Scope**: Vitest, React Testing Library, Playwright

---

## 1. Unit & Service Testing

- All domain services (`*.service.ts`) MUST include Vitest unit test suites covering success and error status codes.
- Validation schemas (`*.schemas.ts`) MUST be tested for edge cases.

## 2. Component Testing

- Feature components MUST be tested for all explicit UI states (`Loading`, `Error`, `Disabled`).

## 3. End-to-End Testing

- Core user flows (Authentication, Session Recovery, Workspace Routing) MUST be verified via Playwright E2E tests.
