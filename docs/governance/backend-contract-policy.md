# Backend Contract & Immutable REST API Policy

**Status**: Canonical Standard (Design Law)  
**Governance Scope**: All Frontend Invocations & API Client Services

---

## 1. Immutable Backend Contract

The backend database schema, Supabase Auth configuration, PostgreSQL migrations, and REST API controllers are frozen. Frontend applications MUST consume existing backend endpoints without creating new database tables or altering backend route signatures.

## 2. No Endpoint Invention Policy

- Frontend services MUST NOT invent or hardcode unapproved REST routes.
- All API paths MUST be referenced from canonical configuration dictionaries (e.g. `src/shared/config/api.config.ts`).
- If an API contract requirement is missing from the backend, frontend execution SHALL immediately stop and raise an architectural blocker ticket.
