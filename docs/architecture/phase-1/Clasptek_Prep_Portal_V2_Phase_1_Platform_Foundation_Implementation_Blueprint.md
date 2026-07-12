# CLASPTEK PREP PORTAL VERSION 2

## Phase 1 — Platform Foundation Implementation Blueprint

**Document status:** Implementation-ready specification; execution evidence pending  
**Architecture status:** Frozen  
**Business-domain scope:** Identity & Access only  
**Platform-service scope:** Database, File & Media, Communication, Audit, Integration and Platform Operations foundations  
**Explicitly excluded:** Courses, Enrollments, Preparation Journey, Learning Workspace, Question Bank, Practice, Assessments, Exam Simulation, AI, Analytics, Student Success, Academic Intelligence and Admin Portal  
**Audience:** CTO, Technical Leads, Backend, Frontend, Database, Security, QA, DevOps and Delivery teams  
**Authority:** Must conform to Phase -1, Phase 0, Phase 0 Addendum, Phase 0.5 and Engineering Implementation Governance

---

# 0. Purpose and Implementation Position

This document translates the approved architecture into an executable Phase 1 engineering programme.

It does not redesign the platform and does not create new business concepts. It defines:

- The exact technical foundation to build.
- The permitted Phase 1 entities and interfaces.
- The module dependency order.
- Security, quality and operational requirements.
- Deliverables and acceptance evidence.
- The gate for proceeding to Phase 2.

Phase 1 is complete only when the foundation is deployed to staging, all critical controls have evidence and the Architecture Compliance Review passes.

## 0.1 Non-negotiable boundary

Phase 1 may implement:

- Identity & Access domain.
- Generic file/media foundation.
- Generic communication foundation.
- Audit and compliance foundation.
- Integration/outbox/job foundation.
- Platform operations and configuration.
- API, security, testing, observability and CI/CD foundations.

Phase 1 must not implement even simplified or placeholder versions of later business domains.

## 0.2 Approved implementation baseline

The implementation baseline follows the approved engineering decisions:

- Monorepo.
- pnpm workspaces.
- Turborepo task orchestration.
- Next.js web application.
- strict TypeScript.
- PostgreSQL/Supabase database.
- Supabase Auth behind an adapter.
- Supabase Storage behind an adapter.
- SQL-first migrations.
- durable asynchronous queue abstraction.
- OpenTelemetry-compatible instrumentation.
- REST-style `/api/v1` contracts with OpenAPI.
- Vitest and Playwright testing.
- GitHub Actions delivery.
- private-by-default storage.
- transactional outbox.
- feature-flagged rollout.

Exact dependency versions are pinned in the lockfile during implementation and upgraded through controlled EDR-compatible changes.

---

# 1. Phase 1 Architecture

```text
Browser
  |
  v
Next.js Web Application
  |
  +-- Authentication UI
  +-- Account/Profile UI
  +-- Session/Device Security UI
  +-- In-App Notification Shell
  |
  v
Versioned API Boundary
  |
  +-- Authentication Application Service
  +-- Identity Application Service
  +-- Authorization Policy Service
  +-- File Service
  +-- Notification Service
  +-- Audit Service
  +-- Configuration Service
  |
  v
Domain and Platform Modules
  |
  +-- Identity & Access
  +-- File & Media
  +-- Communication
  +-- Audit & Compliance
  +-- Integration
  +-- Platform Operations
  |
  +---------------------+----------------------+
  v                     v                      v
PostgreSQL        Private Object Storage   Durable Queue/Workers
  |
  v
Transactional Outbox

Cross-cutting:
Security | Validation | Logging | Metrics | Tracing | Testing | CI/CD
```

## 1.1 Dependency sequence

```text
Module 1 Project Foundation
        ↓
Modules 2 Database + 10 Configuration + 12 API
        ↓
Modules 3 Authentication + 4 Authorization + 5 Identity
        ↓
Modules 6 Storage + 7 Notifications + 8 Audit
        ↓
Modules 9 Observability + 11 Security + 13 Testing
        ↓
Module 14 CI/CD
        ↓
Module 15 Documentation and Handover
```

Security, audit, testing and observability begin with Module 1 and mature throughout the phase; they are not deferred until their numbered module.

---

# 2. Permitted Phase 1 Data Scope

The following logical records may be physically implemented because they belong to approved Phase 1 domains or technical platform services:

| Owner               | Permitted logical records                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Identity & Access   | UserAccount, PersonProfile, RoleDefinition, PermissionDefinition, RolePermission, RoleAssignment, Session/Device metadata, LoginHistory |
| Audit & Compliance  | AuditEvent, SecurityEvent reference/projection                                                                                          |
| File & Media        | FileAsset, UploadIntent, FileScanResult, FileVersion metadata                                                                           |
| Communication       | NotificationTemplate, Notification, NotificationRecipient, NotificationDelivery, supported platform preferences                         |
| Integration         | OutboxEvent, InboxReceipt/Deduplication, durable job metadata and dead-letter record                                                    |
| Platform Operations | FeatureFlag, FeatureFlagAssignment, ApplicationSetting, ConfigurationHistory                                                            |

Prohibited in Phase 1:

- Academy business records.
- Student Relationship records.
- Course or offering records.
- Enrollment records.
- goals or journeys.
- academic content.
- questions.
- attempts or responses.
- readiness, recommendation or analytics records.
- AI models, prompts or grade runs.

---

# 3. Global Engineering Requirements

## 3.1 Definition of Ready

A Phase 1 work item is ready only when it has:

- Owning module and team.
- Architecture/EDR references.
- permitted data scope.
- API and security classification.
- acceptance criteria.
- test plan.
- observability requirements.
- rollout and rollback approach.

## 3.2 Definition of Done

A Phase 1 work item is done only when:

- Implementation meets the approved architecture.
- database constraints and migrations are reviewed.
- API contracts are published.
- permissions and RLS are tested.
- audit is complete.
- tests pass.
- accessibility is verified.
- telemetry and alerts exist.
- documentation is current.
- rollback is proven.

---

# MODULE 1 — PROJECT FOUNDATION

## 1.1 Objective

Establish the production repository, build system, package boundaries and developer workflow used by every later phase. The outcome is a reproducible monorepo that makes architectural violations difficult and ordinary development predictable.

## 1.2 Architecture alignment

Implements Engineering Governance EDRs for a monorepo, workspace package management, strict dependency boundaries and documentation-as-code. Domain packages may be created only for approved Phase 1 domains and platform services. Empty placeholders for future academic domains are prohibited because they would create false ownership and premature coupling.

## 1.3 Database impact

No business tables are created. The repository includes the authoritative migration directory, database test harness and generated-type boundary. A local database bootstrap may create required extensions, schemas and migration metadata only.

## 1.4 API impact

No business API is introduced. The web and worker applications receive shared HTTP, validation, error, request-context and contract packages that later modules will use.

## 1.5 UI impact

Create only a minimal platform shell, error page and development diagnostics page restricted to non-production environments. No student dashboard, learning workspace or admin portal is permitted.

## 1.6 Security considerations

Supply-chain controls, secret scanning, protected environment files, dependency pinning and branch protection begin here. Workspace packages must not expose server-only code to browser bundles.

## 1.7 Testing requirements

Repository smoke tests, architecture dependency tests, TypeScript project-reference tests, lint/format tests and clean-install/build tests must run locally and in CI.

## 1.8 Principal risks

- **Tool proliferation:** Approve one tool for each concern and document replacement through an EDR.
- **Premature shared libraries:** Require two real consumers and a stable semantic purpose before creating a shared package.
- **Architecture leakage:** Enforce import boundaries and CODEOWNERS in CI.

## 1.9 Implementation work packages

- A clean checkout installs with one documented command.
- All applications and packages type-check and build.
- Architecture tests reject a forbidden cross-domain import.
- Server-only packages cannot be imported by browser code.
- Lockfile changes are required for dependency changes.
- No future-domain placeholder implementation exists.
- Repository ownership and review rules are active.

## 1.10 Deliverables

- Create `apps/web`, `apps/worker` and approved shared packages.
- Configure pnpm workspaces and deterministic lockfile handling.
- Configure Turborepo task orchestration and dependency-aware caching.
- Configure strict shared TypeScript base settings and application-specific extensions.
- Configure ESLint, Prettier, EditorConfig and import-boundary rules.
- Configure pre-commit lightweight checks and pre-push validation.
- Create repository templates: pull request, issue, ADR, EDR and incident.
- Configure CODEOWNERS and ownership files.
- Create architecture fitness tests.
- Create local bootstrap and verification scripts.

## 1.11 Acceptance criteria

- [ ] Production monorepo structure.
- [ ] Workspace and build configuration.
- [ ] Strict TypeScript configuration.
- [ ] Linting and formatting standards.
- [ ] Git hooks and repository templates.
- [ ] CODEOWNERS and dependency-boundary rules.
- [ ] Developer bootstrap scripts.

---

# MODULE 2 — DATABASE FOUNDATION

## 2.1 Objective

Create the governed PostgreSQL foundation required by Identity & Access and reusable platform services without introducing academic business tables.

## 2.2 Architecture alignment

Implements the database-first, relational-first, version-first and audit principles. Logical ownership follows the approved schemas. Physical details remain traceable to the Phase 0.5 objects and Engineering Governance database standards.

## 2.3 Database impact

Create only foundational schemas and shared platform entities:

- `identity`: user-account linkage, person profile, role definitions, permission definitions, role-permission mapping, scoped role assignments, device/session metadata and login history.
- `audit`: immutable audit events and security-event references.
- `file_media`: file asset metadata, upload intents and scan results.
- `communication`: notification templates, notification records and channel delivery attempts.
- `integration`: transactional outbox, consumer inbox/deduplication and durable job metadata where the approved queue implementation requires it.
- `platform`: feature-flag definitions, flag assignments, governed application settings and configuration history.

Authentication credentials, password hashes and refresh tokens remain provider-managed and are not duplicated in application tables.

Create approved UUID generation, UTC timestamp rules, audit columns, constraint naming, selective archival, version columns and migration metadata. No course, enrollment, journey, question, assessment, simulation, AI, readiness or analytics table is permitted.

## 2.4 API impact

Database access is available only through repository ports and controlled platform services. No generic table CRUD endpoints are created.

## 2.5 UI impact

No database administration UI is implemented. Migration and seed operations use controlled scripts and CI jobs.

## 2.6 Security considerations

RLS is enabled where authenticated users can access records. Default deny is used. Service roles receive minimum scope. Sensitive audit, permission and provider mapping records are server-only.

## 2.7 Testing requirements

Migration tests, clean-build tests, upgrade-path tests, RLS positive/negative tests, constraint tests and representative query-plan tests are required.

## 2.8 Principal risks

- **Business leakage:** A database review must reject any entity not owned by Identity, Audit, File & Media, Communication, Integration or Platform Operations.
- **Irreversible migrations:** Use expand/contract sequencing and production-like rehearsal.
- **Weak tenant compatibility:** Include nullable future academy scope only where Phase 0.5 permits it; do not invent academy records in Phase 1.
- **Provider duplication:** Keep credentials and token secrets in the authentication provider.

## 2.9 Implementation work packages

- A clean database can be created entirely from migrations.
- Upgrading from every Phase 1 migration checkpoint succeeds.
- All primary, foreign, uniqueness and state constraints pass tests.
- RLS defaults to deny for protected records.
- No authentication secret is duplicated in application tables.
- All timestamps use UTC instants.
- All entities have an accountable owner and retention classification.
- No prohibited academic tables exist.

## 2.10 Deliverables

- Create domain schemas and ownership grants.
- Configure ordered SQL-first migration framework.
- Create approved PostgreSQL extensions only.
- Create identity and platform foundation entities.
- Create audit event store.
- Create transactional outbox and consumer deduplication primitives.
- Create logical index and constraint conventions.
- Create seed framework separated into reference, development and test data.
- Create database test runner.
- Document backup, restore and migration-review workflow.

## 2.11 Acceptance criteria

- [ ] Initial database migrations.
- [ ] Database standards and review checklist.
- [ ] Reference seed package.
- [ ] Test fixtures and database test suite.
- [ ] Schema ownership grants.
- [ ] RLS foundation.
- [ ] Backup and restore runbook.

---

# MODULE 3 — AUTHENTICATION

## 3.1 Objective

Implement secure account authentication workflows while keeping authentication identity separate from the application profile and authorization model.

## 3.2 Architecture alignment

Implements the approved Identity & Access domain and IDN rules. The authentication provider is accessed through an adapter. Provider identities map to one canonical `UserAccount`; provider-specific details do not leak into other domains.

## 3.3 Database impact

Persist only provider identity linkage, account state, verification state, security metadata, device/session metadata and login history. Password material and refresh-token secrets remain provider-owned.

## 3.4 API impact

Provide versioned authentication contracts for registration, login, logout, password recovery, password reset, email verification, session refresh, session listing, session revocation and device naming/revocation. Provider callbacks remain internal integration endpoints.

## 3.5 UI impact

Implement accessible authentication screens:

- Register.
- Sign in.
- Verify email status.
- Forgot password.
- Reset password.
- Session-expired recovery.
- Account security with active devices/sessions.
- Minimal account profile.

“Remember me” controls session persistence policy; it must not create custom insecure token storage.

## 3.6 Security considerations

Use secure HTTP-only cookies, same-site policy, CSRF controls, login throttling, email verification, privileged MFA readiness, session revocation, suspicious-login events and generic credential-error messages. The platform must support provider-enforced refresh-token rotation.

## 3.7 Testing requirements

Unit tests for state mapping and policies; provider-adapter contract tests; browser tests for all auth journeys; rate-limit tests; cookie/security-header tests; session-revocation tests; replay and callback-validation tests.

## 3.8 Principal risks

- **Account enumeration:** Use generic responses for login and recovery.
- **Session theft:** Use secure cookies, token rotation, revocation and device visibility.
- **Duplicate identities:** Enforce unique provider identity mapping and controlled merge review.
- **Provider coupling:** Keep all provider SDK calls inside the authentication adapter.

## 3.9 Implementation work packages

- Registration creates one provider identity link and one canonical user account.
- Unverified users cannot receive privileged access.
- Login, logout, reset and verification flows work across supported browsers.
- Session revocation blocks subsequent authenticated requests.
- Remember-me behaviour follows approved cookie lifetime policy.
- No tokens appear in local storage, URLs or logs.
- Authentication provider outage produces a safe, observable failure.
- All auth security tests pass.

## 3.10 Deliverables

- Implement authentication provider adapter.
- Implement registration and verification orchestration.
- Implement login/logout and secure cookie handling.
- Implement recovery and reset workflows.
- Implement refresh and session-expiry behaviour.
- Implement session/device inventory and revocation.
- Record login-success, failure and risk events.
- Create accessible auth UI.
- Create auth threat model and runbook.

## 3.11 Acceptance criteria

- [ ] Authentication application service.
- [ ] Provider adapter.
- [ ] Versioned auth contracts.
- [ ] Authentication UI.
- [ ] Session/device management.
- [ ] Security-event integration.
- [ ] Auth test suite and threat model.

---

# MODULE 4 — AUTHORIZATION

## 4.1 Objective

Implement the reusable authorization framework for scoped roles, permissions and policy evaluation without introducing later-phase business scopes.

## 4.2 Architecture alignment

Implements RBAC plus ABAC, scoped RoleAssignment records, least privilege, separation of duties and default denial. Phase 1 supplies the engine and global/platform scope; academy, course, offering and enrollment evaluators are extension points implemented only in their owning future phases.

## 4.3 Database impact

Create role definitions, permission definitions, role-permission mappings and role assignments using approved identity objects. Store scope type and optional scope reference without creating foreign keys to future entities. Scope resolvers are registered only when the owning domain exists.

## 4.4 API impact

Provide internal authorization service contracts and a restricted platform API for viewing the current principal’s effective permissions. Role-management commands are server-side/bootstrap operations in Phase 1; no general administrative CRUD API is exposed.

## 4.5 UI impact

UI may show account capabilities and access-denied states. There is no role-management admin portal in Phase 1. Initial privileged assignments are performed through audited bootstrap scripts.

## 4.6 Security considerations

Default deny, server-side enforcement, no hard-coded role checks, step-up authentication for high-risk permission changes, separation-of-duty checks and full audit of assignments/revocations.

## 4.7 Testing requirements

Policy unit tests, permission matrix tests, assignment-lifecycle tests, default-deny tests, privilege-escalation tests and future-scope extension tests.

## 4.8 Principal risks

- **Role-name authorization:** Require permission checks, not UI or role-string checks.
- **Future-scope leakage:** Provide extension interfaces without simulating course/enrollment entities.
- **Bootstrap privilege:** Use one-time audited scripts and remove temporary credentials.

## 4.9 Implementation work packages

- Every protected Phase 1 endpoint declares permissions.
- Unknown permissions and scopes deny access.
- No backend decision depends only on a role name.
- Role assignment and revocation are audited.
- Expired and revoked assignments grant no access.
- Privilege-escalation negative tests pass.
- No future business entity is created to support authorization.

## 4.10 Deliverables

- Implement permission registry and typed permission codes.
- Implement scoped role-assignment aggregate and lifecycle.
- Implement policy evaluation service.
- Implement authorization middleware/interceptors.
- Implement `requirePermission` and object-policy interfaces.
- Create bootstrap role/permission seed process.
- Create audited privileged role-assignment command.
- Create negative authorization test harness.

## 4.11 Acceptance criteria

- [ ] Authorization library.
- [ ] Role and permission reference data.
- [ ] Policy evaluation service.
- [ ] Request authorization boundary.
- [ ] Bootstrap and emergency-access runbook.
- [ ] Authorization test matrix.

---

# MODULE 5 — IDENTITY DOMAIN

## 5.1 Objective

Implement the approved Identity & Access business domain records and application services, excluding Student Relationship, Academy, Enrollment and every academic domain.

## 5.2 Architecture alignment

The domain owns authentication identity linkage, canonical person profile, account status, security posture, sessions/device metadata, role assignments and login history. Authentication credentials remain external; profile and role remain separate.

## 5.3 Database impact

Implement canonical identity aggregates and projections:

- `UserAccount`.
- `PersonProfile`.
- `RoleAssignment`.
- application-visible session/device metadata.
- login/security history.

Do not create `Student`, `Enrollment`, `AcademyMembership`, `Course` or `PreparationJourney` records.

## 5.4 API impact

Provide `/api/v1/me`, profile update, security summary, active sessions, revoke session and effective permissions. Privileged account suspension/activation remains an internal command until the later operational UI exists.

## 5.5 UI impact

Provide account profile and security pages only. The profile must not ask for academic goals, course preferences, target exams or enrollment information.

## 5.6 Security considerations

Field-level PII controls, data minimisation, account suspension without deleting history, profile/account separation and audit for privileged changes.

## 5.7 Testing requirements

Aggregate tests, profile validation tests, identity uniqueness tests, account-state tests, PII serialization tests, security-history tests and browser tests.

## 5.8 Principal risks

- **Identity becoming Student domain:** Use person/account terminology and prohibit academic fields.
- **PII overcollection:** Require an approved purpose for every profile field.
- **Account/profile drift:** Use one canonical mapping and reconciliation checks.

## 5.9 Implementation work packages

- One person has one canonical profile.
- Authentication identity and profile remain separate.
- Account suspension blocks login without deleting identity history.
- Profile APIs return only authorised fields.
- No academic or enrollment information is stored.
- All privileged identity changes are audited.
- Identity data-retention policy is documented.

## 5.10 Deliverables

- Implement UserAccount aggregate and repository.
- Implement PersonProfile aggregate and repository.
- Implement account activation/suspension/closure commands.
- Implement profile query/update use cases.
- Implement login-history projection.
- Implement account-security summary.
- Integrate audit and authorization.
- Create identity data-retention hooks.

## 5.11 Acceptance criteria

- [ ] Identity domain package.
- [ ] Identity repositories and application services.
- [ ] Profile and account APIs.
- [ ] Account UI.
- [ ] Identity test suite.
- [ ] Identity operations runbook.

---

# MODULE 6 — FILE STORAGE FOUNDATION

## 6.1 Objective

Create a provider-neutral private file and media service that later domains can reuse safely.

## 6.2 Architecture alignment

Implements the approved File & Media domain foundation and anti-corruption boundary around storage providers. Phase 1 owns generic file lifecycle and security, not academic meaning.

## 6.3 Database impact

Create `FileAsset`, upload intent/session, scan result and immutable file-version metadata. Ownership uses generic owner type/reference contracts; future domain ownership is validated by future adapters. Do not create course-resource, submission or speaking-recording tables.

## 6.4 API impact

Provide versioned APIs for requesting an upload, completing upload, checking processing status, requesting authorised download and retiring an unused asset. Storage provider callbacks remain internal.

## 6.5 UI impact

Provide a small authenticated file-upload test component for engineering verification only, excluded from production navigation unless required for profile image upload. Profile image support is optional and must use the same service.

## 6.6 Security considerations

Private by default; short-lived upload/download grants; type, size and signature validation; quarantine; virus-scanning hook; checksum; path non-predictability; malware and content-disposition controls; no public bucket for restricted content.

## 6.7 Testing requirements

Provider-adapter tests, malicious filename tests, MIME mismatch tests, oversized upload tests, quarantine tests, signed-URL expiry tests, cross-user access tests and scanner failure tests.

## 6.8 Principal risks

- **Malicious upload:** Quarantine until validation and scan complete.
- **Orphaned files:** Use upload expiry and reconciliation jobs.
- **Provider lock-in:** Use canonical asset metadata and storage adapter.
- **Premature academic metadata:** Keep file purpose generic and defer domain-specific links.

## 6.9 Implementation work packages

- Unapproved assets cannot be downloaded.
- Cross-user access is denied.
- MIME, extension, signature and size validation operate together.
- Scan failure leaves the asset quarantined.
- Signed access expires as configured.
- Orphaned upload intents are cleaned safely.
- No academic business entity is introduced.

## 6.10 Deliverables

- Implement storage provider port and adapter.
- Implement upload-intent and completion workflow.
- Implement file validation service.
- Implement virus-scanner interface and stub/test adapter.
- Implement quarantine and approval states.
- Implement authorised download grants.
- Implement cleanup and orphan reconciliation jobs.
- Add telemetry and security events.

## 6.11 Acceptance criteria

- [ ] Storage abstraction.
- [ ] Upload/download APIs.
- [ ] File validation pipeline.
- [ ] Scanning hooks.
- [ ] Private storage policies.
- [ ] File lifecycle jobs.
- [ ] Storage threat model and runbook.

---

# MODULE 7 — NOTIFICATION FOUNDATION

## 7.1 Objective

Create channel-neutral notification infrastructure reusable by future business domains.

## 7.2 Architecture alignment

Implements the Communication domain foundation. Future domains publish notification requests/events; Communication owns templates, preferences, channel dispatch and delivery history. Phase 1 includes only identity/security templates.

## 7.3 Database impact

Create versioned notification templates, notification records, in-app recipient records, channel delivery attempts and deduplication keys. Preferences may cover platform/security categories only; academic categories are added by future owners.

## 7.4 API impact

Provide internal notification command contracts and authenticated APIs for listing/reading in-app notifications and managing supported preferences. Email/SMS/push providers are behind adapters.

## 7.5 UI impact

Provide a minimal notification centre and unread indicator in the authenticated account shell. No academic announcements or admin notification builder.

## 7.6 Security considerations

Template output encoding, sensitive-data minimisation, mandatory-security category, unsubscribe rules, provider credential isolation, channel verification and audit of template publication.

## 7.7 Testing requirements

Template rendering tests, provider contract tests, deduplication tests, retry/dead-letter tests, in-app access tests, unsubscribe tests and bounce/failure tests.

## 7.8 Principal risks

- **Notification spam:** Use deduplication, category policies and rate controls.
- **Sensitive content leakage:** Templates receive minimum structured data and forbid secrets/academic responses.
- **Provider outage:** Use durable queues, retry classification and in-app fallback where appropriate.

## 7.9 Implementation work packages

- Notifications are delivered asynchronously.
- Duplicate requests do not create duplicate user messages.
- Mandatory security notifications cannot be disabled.
- Provider failures are retried or dead-lettered appropriately.
- Users can access only their notifications.
- All templates are versioned and tested.
- No academic announcement capability is implemented.

## 7.10 Deliverables

- Implement notification command and event contracts.
- Implement template registry and versioning.
- Implement email provider adapter.
- Define SMS and push ports with test adapters.
- Implement in-app notification store and query.
- Implement dispatch worker, retries and dead-letter handling.
- Implement delivery telemetry and provider webhooks.
- Create initial verification, reset and security-alert templates.

## 7.11 Acceptance criteria

- [ ] Notification platform service.
- [ ] Template registry.
- [ ] Email integration.
- [ ] SMS/push abstractions.
- [ ] In-app notification UI/API.
- [ ] Dispatch workers.
- [ ] Notification runbook.

---

# MODULE 8 — AUDIT & LOGGING

## 8.1 Objective

Create immutable audit capability and structured operational logging shared by every later phase.

## 8.2 Architecture alignment

Implements Audit & Compliance as the authoritative ledger for privileged and sensitive actions while Platform Operations owns diagnostic logs. Audit events and logs are deliberately separate.

## 8.3 Database impact

Create append-only `AuditEvent` records with actor, service identity, scope, action, entity reference, reason, correlation and restricted change summary. Operational logs remain in the observability backend, not the transactional business database.

## 8.4 API impact

Provide internal audit-recording contracts and restricted query/export interfaces for security operations. No general audit administration UI is implemented.

## 8.5 UI impact

No ordinary user-facing audit UI. The account security page may show selected user-relevant login/security events through a safe projection.

## 8.6 Security considerations

Tamper resistance, restricted access, sensitive-field redaction, reason requirements for privileged changes, correlation propagation, retention classification and fail-safe policy. Critical commands must not silently proceed if mandatory audit cannot be recorded.

## 8.7 Testing requirements

Audit immutability tests, redaction tests, privileged-access tests, correlation tests, failure-mode tests and log-schema validation.

## 8.8 Principal risks

- **Audit containing sensitive content:** Use allow-listed summaries and redaction before persistence.
- **Audit failure blocking availability:** Classify mandatory versus best-effort events and provide durable buffering.
- **Confusing logs and audit:** Use separate contracts, stores, retention and ownership.

## 8.9 Implementation work packages

- Sensitive Phase 1 commands produce audit records.
- Audit records cannot be updated through application interfaces.
- Logs contain trace/request correlation.
- Secrets and protected content are redacted.
- Audit access is permission-restricted and itself audited.
- Critical audit failure behaviour is tested.

## 8.10 Deliverables

- Implement canonical audit event envelope.
- Implement audit application service and repository.
- Implement structured logging library.
- Implement redaction and safe-context policies.
- Propagate request, trace and actor context.
- Implement security-event taxonomy.
- Create restricted audit query/export service.
- Create retention and archive jobs.

## 8.11 Acceptance criteria

- [ ] Audit service.
- [ ] Structured logging package.
- [ ] Security-event catalogue.
- [ ] Redaction library.
- [ ] Correlation middleware.
- [ ] Audit retention runbook.

---

# MODULE 9 — OBSERVABILITY

## 9.1 Objective

Provide production telemetry, health, alerting and operational dashboards before business domains are added.

## 9.2 Architecture alignment

Implements observability-first engineering and Platform Operations ownership. Telemetry is vendor-neutral at instrumentation boundaries.

## 9.3 Database impact

No business entities. Optional operational metadata such as deployment version is external to the transactional model. Alert and dashboard configuration lives as infrastructure code.

## 9.4 API impact

Expose public liveness and controlled readiness endpoints. Detailed dependency diagnostics require authenticated operational access. Instrument all API and worker boundaries.

## 9.5 UI impact

No user-facing UI. Operational dashboards live in the chosen observability platform. A non-production diagnostics page may show build/version information.

## 9.6 Security considerations

Telemetry must not expose PII, secrets, tokens or full request bodies. Health endpoints must not reveal internal topology. Alert access is restricted.

## 9.7 Testing requirements

Instrumentation tests, health-state tests, trace-propagation tests, alert simulations, log-redaction tests and synthetic availability checks.

## 9.8 Principal risks

- **False confidence:** Readiness checks must represent ability to perform critical work, not just process existence.
- **Telemetry cost:** Use sampling and retention by signal value.
- **PII leakage:** Use structured allow-lists and redaction.

## 9.9 Implementation work packages

- Every request has a request ID and trace context.
- Queue jobs preserve correlation.
- Health endpoints correctly fail under dependency loss.
- Critical alerts reach the named on-call path.
- Dashboards show release version and environment.
- No PII or secret appears in telemetry samples.

## 9.10 Deliverables

- Configure OpenTelemetry-compatible instrumentation.
- Implement request and worker trace context.
- Implement liveness/readiness/dependency health.
- Define core technical and security metrics.
- Create platform, API, database, worker and auth dashboards.
- Configure alert routing and severity.
- Create synthetic checks.
- Create operational runbook links in alerts.

## 9.11 Acceptance criteria

- [ ] Observability package.
- [ ] Health endpoints.
- [ ] Metrics and tracing.
- [ ] Operational dashboards.
- [ ] Alert rules.
- [ ] Synthetic monitoring.
- [ ] On-call runbooks.

---

# MODULE 10 — CONFIGURATION

## 10.1 Objective

Create typed, validated and auditable configuration for environments, secrets, feature flags and governed application settings.

## 10.2 Architecture alignment

Implements the architecture distinction among deployment configuration, secrets, safe application settings and business configuration. Phase 1 must not create academic configuration.

## 10.3 Database impact

Create governed feature-flag and application-setting records only where runtime editing is approved. Secrets remain outside PostgreSQL. Configuration change history is audited.

## 10.4 API impact

Provide internal configuration-query services and a restricted feature-evaluation contract. No generic public settings API.

## 10.5 UI impact

No settings admin portal. Non-secret configuration may be displayed in a restricted diagnostics view. Feature management is performed through approved scripts/provider interface until a later operations UI.

## 10.6 Security considerations

Fail-fast validation, environment separation, no secret exposure, typed schemas, least-privilege access, configuration provenance and feature-flag expiry.

## 10.7 Testing requirements

Configuration-schema tests, startup-failure tests, secret-redaction tests, flag-evaluation tests, environment-isolation tests and audit tests.

## 10.8 Principal risks

- **Configuration drift:** Store schemas and environment manifests in source control.
- **Secrets in settings:** Separate secret manager from application settings.
- **Permanent flags:** Require owner, review date and removal task.

## 10.9 Implementation work packages

- Applications fail startup when critical configuration is invalid.
- Secrets never appear in client bundles or logs.
- Every flag has an owner and expiry/review date.
- Environment-specific configuration is documented.
- No academic configuration is introduced.
- Configuration changes are traceable.

## 10.10 Deliverables

- Define configuration taxonomy and ownership.
- Implement typed environment loader.
- Implement secret-provider port.
- Implement application-settings service.
- Implement feature-flag evaluation adapter.
- Create environment validation command.
- Create configuration change audit.
- Document local, CI, staging and production setup.

## 10.11 Acceptance criteria

- [ ] Configuration package.
- [ ] Environment schemas.
- [ ] Secret-management integration.
- [ ] Feature-flag foundation.
- [ ] Application-setting foundation.
- [ ] Configuration runbook.

---

# MODULE 11 — SECURITY FOUNDATION

## 11.1 Objective

Implement cross-cutting security controls and prove the platform’s secure default before later domains are developed.

## 11.2 Architecture alignment

Applies OWASP-aligned controls, zero-trust service boundaries, least privilege, secure defaults and Engineering Governance threat-modelling requirements.

## 11.3 Database impact

Security policies use existing identity, audit and platform entities. No separate unowned security database is created. Rate-limit counters may use the approved cache/edge provider.

## 11.4 API impact

Security middleware protects all APIs: secure headers, request-size limits, CORS, CSRF where cookie-authenticated state changes occur, validation, abuse limits and safe error responses.

## 11.5 UI impact

Authentication and account-security interfaces follow secure UX: no account enumeration, explicit session state, safe redirects and accessible errors.

## 11.6 Security considerations

Controls include:

- Content Security Policy.
- HSTS and secure transport.
- frame restrictions.
- MIME sniffing prevention.
- referrer policy.
- secure cookies.
- CSRF tokens/origin checks.
- strict CORS allow-list.
- input and output validation.
- authentication and recovery throttles.
- dependency, secret and container scanning.
- encryption in transit/at rest.
- security incident classification.
- threat models for auth, authorization, files and notifications.

## 11.7 Testing requirements

SAST, dependency scanning, secret scanning, DAST, security header tests, CSRF/CORS tests, rate-limit tests, authentication abuse tests, file-upload security tests and manual review.

## 11.8 Principal risks

- **Security as late hardening:** Make controls part of shared middleware and blocking CI gates.
- **Rate limits harming legitimate auth:** Use route-specific policies and measurable thresholds.
- **Misconfigured CORS/CSRF:** Use explicit environment allow-lists and browser integration tests.

## 11.9 Implementation work packages

- All security headers pass automated verification.
- Cookie-authenticated mutations resist CSRF.
- Unapproved origins are rejected.
- Authentication abuse is throttled.
- Secrets and vulnerable dependencies fail CI according to severity policy.
- Critical threat-model mitigations are complete.
- No unresolved critical security finding remains.

## 11.10 Deliverables

- Create platform threat model.
- Implement secure header policy.
- Implement CSRF defence.
- Implement CORS policy.
- Implement rate-limit abstraction and policies.
- Configure input/request limits.
- Configure security scanning in CI.
- Create incident-response baseline.
- Perform Phase 1 penetration review.

## 11.11 Acceptance criteria

- [ ] Security middleware.
- [ ] Rate-limit service.
- [ ] CSRF and CORS controls.
- [ ] Secure-cookie policy.
- [ ] Security scanning pipeline.
- [ ] Threat models.
- [ ] Incident-response runbook.

---

# MODULE 12 — API FOUNDATION

## 12.1 Objective

Create consistent versioned API, command, query, validation and error conventions for all future services.

## 12.2 Architecture alignment

Implements API-first engineering and preserves domain ownership. The foundation supplies protocol and contract primitives; it does not create a generic business service or universal repository.

## 12.3 Database impact

No new business entities. Request idempotency records may use a platform/integration technical entity where durable deduplication is required.

## 12.4 API impact

Define:

- `/api/v1` versioning.
- canonical request context.
- success and error envelopes.
- stable error codes.
- schema validation.
- cursor pagination.
- allow-listed filtering and sorting.
- idempotency.
- request IDs.
- correlation.
- deprecation headers.
- OpenAPI publication.
- internal service-authentication contract.

Do not expose arbitrary filter expressions or generic CRUD generators.

## 12.5 UI impact

Frontend consumes generated or validated API contracts. Shared client utilities provide error mapping, pagination and request correlation.

## 12.6 Security considerations

Every endpoint declares authentication, permission, rate-limit and data-classification requirements. Error responses must not leak internals.

## 12.7 Testing requirements

Contract tests, schema tests, error-code tests, pagination tests, filter/sort allow-list tests, idempotency tests, request-size tests and compatibility tests.

## 12.8 Principal risks

- **Generic API abstraction hiding business meaning:** Keep business endpoints in owning domains and share only transport primitives.
- **Breaking contracts:** Use compatibility tests and deprecation windows.
- **Unsafe filtering:** Use allow-listed fields and operators.

## 12.9 Implementation work packages

- All Phase 1 APIs use `/api/v1` and standard errors.
- Every request receives a request ID.
- Invalid input never reaches application services.
- Pagination is deterministic.
- Unsupported filters/sorts are rejected.
- Retrying an idempotent command does not duplicate outcomes.
- OpenAPI and implementation contracts agree.

## 12.10 Deliverables

- Create API contract package.
- Define canonical error catalogue.
- Implement request context and IDs.
- Implement validation boundary.
- Implement cursor pagination primitives.
- Implement safe filtering/sorting primitives.
- Implement idempotency support.
- Configure OpenAPI generation and contract testing.
- Create API client conventions.

## 12.11 Acceptance criteria

- [ ] API standards.
- [ ] Transport middleware.
- [ ] Error and validation library.
- [ ] Pagination/filter/sort framework.
- [ ] Idempotency service.
- [ ] OpenAPI baseline.
- [ ] Contract test harness.

---

# MODULE 13 — TESTING FOUNDATION

## 13.1 Objective

Create the automated quality platform and test conventions required by all future phases.

## 13.2 Architecture alignment

Implements test-first quality, risk-based coverage and the Engineering Governance testing pyramid. Test utilities must not embed domain rules or create alternative models.

## 13.3 Database impact

Create isolated database test environments, migration fixtures, RLS personas and deterministic cleanup. No production data is copied into tests.

## 13.4 API impact

Create contract-test harnesses for APIs, events and provider adapters.

## 13.5 UI impact

Configure component, browser and accessibility test harnesses for the auth/account shell only.

## 13.6 Security considerations

Test secrets are synthetic; security test cases include negative authorization, malicious inputs and rate limits. CI test artifacts must avoid PII.

## 13.7 Testing requirements

The module itself delivers unit, integration, contract, database, UI, accessibility, security, load-smoke and coverage foundations.

## 13.8 Principal risks

- **Coverage theatre:** Require rule and risk mapping rather than only line percentages.
- **Flaky end-to-end tests:** Use deterministic fixtures, owned retries only at infrastructure boundaries and flake tracking.
- **Slow CI:** Parallelise by test type and use dependency-aware execution.

## 13.9 Implementation work packages

- Every Phase 1 critical rule maps to an automated test.
- RLS has positive and negative tests.
- Auth critical journeys pass browser tests.
- Accessibility scans run in CI.
- Coverage reports are published.
- Flaky tests are visible and owned.
- No test depends on production user data.

## 13.10 Deliverables

- Configure Vitest-based unit/integration testing.
- Configure database and RLS test harness.
- Configure API and event contract testing.
- Configure Playwright browser testing.
- Configure accessibility automation.
- Configure security test hooks.
- Configure coverage and test-result reporting.
- Create test-data builders and synthetic fixtures.
- Create flaky-test governance.

## 13.11 Acceptance criteria

- [ ] Testing packages and configuration.
- [ ] Database test utilities.
- [ ] Contract test framework.
- [ ] Browser and accessibility test framework.
- [ ] Coverage dashboards.
- [ ] Test-data standards.
- [ ] QA runbook.

---

# MODULE 14 — CI/CD FOUNDATION

## 14.1 Objective

Create repeatable, secure and reversible delivery pipelines from pull request to production.

## 14.2 Architecture alignment

Implements trunk-based development, required quality gates, environment promotion, feature flags, controlled migrations and operational readiness from Engineering Governance.

## 14.3 Database impact

Pipelines validate and apply migrations through approved service identities. Production migrations require approval, backup verification and post-migration reconciliation.

## 14.4 API impact

No API feature impact. Pipeline publishes API and event contract artifacts.

## 14.5 UI impact

Preview deployments may render the Phase 1 auth/account shell. No academic UI.

## 14.6 Security considerations

OIDC or short-lived deployment credentials, protected environments, signed artifacts where supported, secret scanning, supply-chain checks and separation of duties.

## 14.7 Testing requirements

Pipeline self-tests, rollback rehearsal, failed-migration simulation, environment-promotion tests and post-deployment smoke tests.

## 14.8 Principal risks

- **Pipeline bypass:** Protect branches/environments and audit emergency deployment.
- **Environment drift:** Use infrastructure/configuration as code and promotion of the same artifact.
- **Rollback incompatible with migration:** Use backward-compatible expand/contract releases.

## 14.9 Implementation work packages

- Pull requests cannot merge with failing required gates.
- The same built artifact is promoted between environments.
- Production secrets are unavailable to pull-request jobs.
- Migration failure prevents application promotion.
- Rollback has been rehearsed.
- Post-deployment checks detect a failed release.
- Every release records version, owner, changes and rollback.

## 14.10 Deliverables

- Create pull-request validation workflow.
- Create build and artifact workflow.
- Create staging deployment workflow.
- Create production promotion workflow.
- Create migration validation/application workflow.
- Create rollback and feature-disable procedures.
- Configure environment approvals.
- Configure release manifests and change summaries.
- Configure post-deployment verification.

## 14.11 Acceptance criteria

- [ ] GitHub Actions workflows.
- [ ] Protected environment configuration.
- [ ] Artifact and release strategy.
- [ ] Database deployment workflow.
- [ ] Rollback runbook.
- [ ] Release checklist.

---

# MODULE 15 — DOCUMENTATION

## 15.1 Objective

Deliver the operational and developer documentation required to use, review, support and extend the Phase 1 foundation.

## 15.2 Architecture alignment

Implements documentation-as-code and architecture traceability. Documentation clarifies implementation but cannot redefine the authoritative architecture.

## 15.3 Database impact

Document schemas, entity ownership, migrations, RLS, backup, restore and data retention.

## 15.4 API impact

Publish API standards, OpenAPI baseline, errors, authentication flows, idempotency and versioning.

## 15.5 UI impact

Document auth/account UI behaviour, accessibility requirements and supported environments.

## 15.6 Security considerations

Include security setup, threat models, secret rotation, incident response and secure development guidance.

## 15.7 Testing requirements

Documentation link validation, command verification, clean-machine setup test and runbook exercise.

## 15.8 Principal risks

- **Documentation drift:** Update docs in the same pull request and assign owners/review dates.
- **Unexecutable setup guides:** Test bootstrap instructions in CI or a clean environment.
- **Architecture contradiction:** Link to authoritative decisions rather than restating them inconsistently.

## 15.9 Implementation work packages

- A new engineer can bootstrap the platform from the guide.
- Every document has an owner and review date.
- All commands and links are verified.
- Architecture references are correct.
- Operational staff can execute restore, rollback and incident procedures.
- Phase 1 handover is complete.

## 15.10 Deliverables

- Create developer setup guide.
- Create architecture compliance guide.
- Create coding standards.
- Create API standards.
- Create database standards.
- Create deployment guide.
- Create troubleshooting guide.
- Create security and incident guide.
- Create on-call and operational runbooks.
- Create Phase 1 release and handover record.

## 15.11 Acceptance criteria

- [ ] Developer setup guide.
- [ ] Architecture compliance guide.
- [ ] Coding standards.
- [ ] API standards.
- [ ] Database standards.
- [ ] Deployment guide.
- [ ] Troubleshooting guide.
- [ ] Security and operations runbooks.

---

# FINAL ARCHITECTURE COMPLIANCE REVIEW

## A. Compliance assertions

| Review area                      | Required result | Phase 1 blueprint assessment                                                                         |
| -------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| Architecture violations          | None            | The blueprint uses only approved domains and platform services.                                      |
| Duplicate concepts               | None            | Authentication, Identity, Authorization, Audit and Notifications have distinct ownership.            |
| Business leakage                 | None            | Academic and enrollment entities are explicitly prohibited.                                          |
| Unauthorized domain creation     | None            | No new business domain is introduced.                                                                |
| Duplicate database               | None            | PostgreSQL remains the single transactional source of truth.                                         |
| Duplicate authentication data    | None            | Credentials and refresh-token secrets remain provider-owned.                                         |
| Missing security controls        | None critical   | Security controls are defined as blocking acceptance criteria.                                       |
| Missing audit capability         | None            | Audit is a mandatory foundation and critical-command dependency.                                     |
| Missing observability            | None            | Health, metrics, traces, logs, alerts and runbooks are required.                                     |
| Missing testing                  | None            | Unit, integration, contract, database, browser, accessibility and security foundations are included. |
| Missing documentation            | None            | Eight required documentation groups and handover are defined.                                        |
| Premature academic functionality | None            | All later domains are excluded.                                                                      |

## B. Critical issues that must be resolved during execution

1. Approve or confirm all Phase 1 EDRs marked proposed in the Engineering Governance register.
2. Name actual accountable engineers/teams for Identity, Database, Security, SRE, QA and Release.
3. Approve production environment, hosting and observability vendor accounts.
4. Approve exact retention periods for identity, login history, audit, file metadata and notification delivery.
5. Approve session lifetime, remember-me lifetime, refresh rotation and privileged MFA policies.
6. Approve rate-limit thresholds after performance and abuse testing.
7. Select and approve the virus-scanning provider or isolated scanning mechanism.
8. Approve the durable queue implementation and dead-letter operating procedure.
9. Complete threat models and remediate every critical finding.
10. Rehearse backup restore, migration recovery and application rollback.
11. Complete staging deployment with synthetic data only.
12. Complete Phase 1 operational handover and on-call ownership.

## C. Phase 2 readiness decision

**Phase 2 is not approved at document-design time.**

The blueprint is implementation-ready, but Phase 2 may begin only after Phase 1 has produced objective evidence that:

- All fifteen modules meet their acceptance criteria.
- Staging is operational.
- Critical security findings are closed.
- RLS and authorization negative tests pass.
- Authentication and session recovery are reliable.
- audit, logging, traces and alerts operate end to end.
- backup and rollback have been rehearsed.
- CI/CD quality gates block non-compliant releases.
- documentation and operational ownership are complete.
- no prohibited academic entity or placeholder implementation exists.

Once these conditions pass, the Architecture Governance Board and Release Approval Group may issue a formal **Phase 1 Complete / Phase 2 Approved** decision.

# APPENDIX A — Phase 1 Production Routes

Permitted public or authenticated routes include:

```text
/register
/login
/verify-email
/forgot-password
/reset-password
/account
/account/profile
/account/security
/account/notifications
```

Permitted technical routes include:

```text
/api/v1/auth/*
/api/v1/me
/api/v1/me/profile
/api/v1/me/sessions
/api/v1/me/permissions
/api/v1/files/*
/api/v1/notifications/*
/health/live
/health/ready
```

No academic route may be introduced.

# APPENDIX B — Phase 1 Completion Evidence Pack

The final evidence pack must contain:

- Repository and dependency-boundary report.
- Database migration and RLS test report.
- Authentication security report.
- Authorization matrix results.
- File-upload security report.
- Notification delivery/retry report.
- Audit immutability and redaction report.
- Observability screenshots/exports and alert test.
- Configuration validation report.
- OWASP/threat-model closure report.
- API contract report.
- Test and accessibility report.
- CI/CD and rollback rehearsal report.
- Backup/restore report.
- Documentation inventory.
- Architecture compliance sign-off.
