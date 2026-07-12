# CLASPTEK PREP PORTAL VERSION 2

## Engineering Implementation Governance Guide

**Document type:** Enterprise Engineering Constitution  
**Status:** Governance Approval Draft  
**Authority:** Binding for Phase 1 and later implementation after approval  
**Architecture status:** Frozen; changes require an approved ADR  
**Planning horizon:** 5–10 years  
**Audience:** Software Engineers, Frontend Engineers, Backend Engineers, Database Engineers, AI Engineers, QA Engineers, DevOps Engineers, Technical Leads, Engineering Managers and Product Owners

---

# 0. Purpose, Scope and Authority

This handbook defines how engineering teams must implement the approved Clasptek Prep Portal Version 2 architecture.

It does not redesign the architecture, domains, business objects, state machines, business rules or logical data model. Those are governed by:

- Phase -1 — Product Strategy and Domain Discovery.
- Phase 0 — Enterprise Product and Solution Architecture.
- Phase 0 Addendum — Preparation Journey Architecture.
- Phase 0.5 — Canonical Domain, Business Rules and Logical Data Design.
- Approved Architecture Decision Records.

This document bridges those architecture assets and day-to-day delivery.

Every implementation must be traceable to:

```text
Approved Domain
→ Aggregate or Read Model
→ Business Rule
→ Command or Query
→ Permission
→ Event
→ Test
→ Telemetry
→ Documentation
```

An implementation that cannot establish this traceability is non-compliant.

## 0.1 Normative language

- **MUST / MUST NOT:** mandatory.
- **SHOULD / SHOULD NOT:** required unless a documented exception is approved.
- **MAY:** optional within the stated boundary.
- **Owner:** the single team accountable for a module.
- **ADR:** Architecture Decision Record authorising product or architecture change.
- **EDR:** Engineering Decision Record authorising an implementation-level decision.

## 0.2 Exception rule

No deadline, prototype, vendor limitation or individual preference automatically overrides this handbook.

Exceptions require:

1. A documented risk.
2. A named owner.
3. A time limit.
4. A remediation plan.
5. Approval from the appropriate governance body.
6. An ADR when architecture is affected.
7. An EDR when only implementation is affected.

---

# SECTION 1 — ENGINEERING PRINCIPLES

## EGP-001 — Architecture before implementation

No schema, service, route, UI flow, queue or AI workflow may be implemented unless it maps to an approved domain, aggregate, business rule, command, event and permission. This prevents implementation convenience from silently changing the product model.

## EGP-002 — One accountable owner per module

Every domain module has one accountable engineering team. Teams may collaborate, but accountability is never shared. Ownership includes correctness, operability, documentation, quality and lifecycle stewardship.

## EGP-003 — Single source of truth

Each business fact has one authoritative owner. Read models, caches, analytics, timelines and search indexes are projections and must never become competing sources of truth.

## EGP-004 — Domain boundaries are transaction boundaries

A domain changes its own aggregates through its application services. Other domains communicate through contracts and events rather than direct table mutation.

## EGP-005 — High cohesion and low coupling

Code that changes for the same business reason belongs together. Cross-domain dependencies must be explicit, directional and minimal.

## EGP-006 — Composition over duplication

Shared delivery, validation, authorization, audit and UI primitives are composed through stable interfaces. Practice, assessment, diagnostics and simulation must not duplicate attempts, responses, timing or submission logic.

## EGP-007 — Immutable published academic content

Published questions, forms, rubrics, curricula, competency frameworks, simulation policies and readiness models are not edited in place. Corrections create new versions and preserve historical reproducibility.

## EGP-008 — Version-first thinking

Anything whose meaning may change over time must carry a version identity before release. Consumers must be able to reproduce the rules and content used for historical outcomes.

## EGP-009 — Business invariants are enforced server-side

Client applications may improve usability but cannot be trusted to enforce entitlement, timing, scoring, publication, readiness or security rules.

## EGP-010 — Database-first integrity

Application validation is mandatory, but critical uniqueness, ownership, referential and state invariants must also be protected by the database where logically enforceable.

## EGP-011 — Test-driven quality

Tests are part of design, not a final verification activity. Business rules and failure modes must have automated tests before a change is considered complete.

## EGP-012 — Security-first

Every feature begins with a threat and authorization assessment. Least privilege, object-level authorization, RLS, secure storage and audit are default requirements.

## EGP-013 — Privacy and data minimisation

Only data needed for a defined academic, operational or legal purpose is collected, exposed, logged or shared. Sponsor and AI access use minimum necessary context.

## EGP-014 — Observability-first

A feature that cannot be monitored, diagnosed and supported is not production-ready. Logs, metrics, traces, business signals and runbooks are implementation deliverables.

## EGP-015 — Asynchronous by default for long work

AI grading, media processing, exports, recommendations, readiness recalculation and bulk imports run through durable jobs. User requests acknowledge acceptance rather than holding open long transactions.

## EGP-016 — Idempotency and deterministic recovery

Commands that may be retried must not create duplicate business outcomes. Workers must support retries, deduplication and dead-letter handling.

## EGP-017 — Backward compatibility

Contracts, events and database changes evolve through additive, versioned and deprecation-controlled changes. Consumers receive a migration window.

## EGP-018 — Accessible by default

Student and staff experiences target WCAG AA-level accessibility. Keyboard, screen-reader, contrast, focus and responsive behaviour are tested as acceptance requirements.

## EGP-019 — Performance budgets are features

Latency, payload, query and rendering budgets are defined before release. Performance regressions block production when they threaten exam reliability or user experience.

## EGP-020 — AI is governed software

Prompts, models, evaluation sets, thresholds, costs, safety policies and outputs are versioned and reviewed like code. AI never bypasses authoritative business rules.

## EGP-021 — Configuration is not hidden code

Academic configuration is typed, validated, versioned and auditable. Infrastructure secrets and operational configuration remain outside ordinary administrative content.

## EGP-022 — No silent failure

Errors must be explicit, classified and observable. Fallbacks must preserve integrity and inform users when results are delayed, provisional or unavailable.

## EGP-023 — Evidence over assumption

Scaling, partitioning, service extraction, caching and denormalisation require measured evidence and an EDR or ADR where applicable.

## EGP-024 — Documentation is executable governance

Contracts, diagrams, runbooks, data dictionaries and decision records are maintained in the repository and reviewed with the implementation they govern.

## Principle enforcement

The principles are enforceable through:

- Automated dependency rules.
- Pull-request templates.
- database migration review.
- API and event contract tests.
- architecture fitness tests.
- security and RLS tests.
- release quality gates.
- operational readiness reviews.
- ADR and EDR governance.

A principle may be strengthened by a team standard. It may not be weakened without governance approval.

---

# SECTION 2 — REPOSITORY STRUCTURE

## 2.1 Repository strategy

Use a **monorepo** for the initial and medium-term platform.

### Monorepo advantages

- One atomic change can update a domain contract, producer, consumer, tests and documentation.
- Shared packages are visible and versioned together.
- Architecture dependency rules can be enforced centrally.
- Database migrations and application changes remain coordinated.
- CI can detect cross-domain impact.
- Engineering standards remain consistent.

### Polyrepo trade-offs

Polyrepos support independently released teams and stronger repository isolation, but would introduce:

- Contract version coordination.
- Duplicated tooling.
- release-order complexity.
- distributed dependency management.
- harder architectural conformance checks.

A domain may move to another repository only after service extraction is approved by an ADR.

## 2.2 Canonical repository structure

```text
clasptek-prep-v2/
├── apps/
│   ├── web/                       # Student, instructor and operations web experience
│   ├── worker/                    # Durable asynchronous job consumers
│   └── migration-runner/          # Controlled large data migrations
├── packages/
│   ├── domain/
│   │   ├── identity-access/
│   │   ├── enrollment/
│   │   ├── preparation-journey/
│   │   ├── assessment-delivery/
│   │   └── ...                    # One package boundary per canonical domain where justified
│   ├── application/               # Use-case orchestration and ports
│   ├── contracts/
│   │   ├── api/
│   │   ├── events/
│   │   └── schemas/
│   ├── authorization/             # Permission evaluation contracts and shared primitives
│   ├── database/                  # Generated types, connection ports and test utilities
│   ├── integrations/              # Provider adapters behind domain ports
│   ├── observability/             # Logging, tracing and metric primitives
│   ├── validation/                # Shared primitive schemas; never domain business rules
│   ├── ui/                        # Governed design system
│   ├── testing/                   # Test factories and infrastructure
│   └── configuration/             # Typed non-secret configuration
├── database/
│   ├── migrations/
│   ├── policies/
│   ├── functions/
│   ├── views/
│   ├── seeds/
│   ├── fixtures/
│   └── tests/
├── infrastructure/
│   ├── environments/
│   ├── deployment/
│   ├── monitoring/
│   ├── backup/
│   └── runbooks/
├── docs/
│   ├── architecture/
│   ├── adr/
│   ├── edr/
│   ├── api/
│   ├── events/
│   ├── data-dictionary/
│   ├── threat-models/
│   ├── operations/
│   └── product/
├── scripts/
├── tests/
│   ├── architecture/
│   ├── performance/
│   ├── security/
│   └── end-to-end/
└── tooling/
```

## 2.3 Package rules

- Domain packages MUST expose a documented public interface.
- Internal folders MUST NOT be imported by another domain.
- Shared packages MUST contain stable cross-cutting primitives, not displaced business logic.
- A new shared package requires an EDR and at least two legitimate consumers.
- Circular package dependencies are prohibited.
- UI packages cannot import database or provider adapters.
- Domain packages cannot import framework, storage, HTTP or AI SDKs.
- Workers invoke application services; they do not duplicate domain rules.
- Database migrations remain in one authoritative ordered location.

## 2.4 Documentation location

Documentation lives beside code in the repository and is reviewed through pull requests. Generated documentation may be published elsewhere, but the repository version is authoritative.

---

# SECTION 3 — MODULE OWNERSHIP

## 3.1 Ownership policy

Each canonical domain has exactly one accountable engineering team.

The owner is accountable for:

- Public interfaces.
- business-rule fidelity.
- aggregate integrity.
- module tests.
- migrations owned by the domain.
- event compatibility.
- performance.
- security.
- documentation.
- operational support.
- technical-debt remediation.

Another team may contribute only through the owner’s review and merge process.

| Domain                       | Accountable Engineering Team               | Business Owner                             | Responsibilities                                                                                                                                                              | Allowed Dependencies                                                                                          | Forbidden Dependencies                                                                                     | Escalation Path                                                                  |
| ---------------------------- | ------------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Identity & Access            | Platform Security Engineering              | Platform Security Team                     | Registration; verification; authentication; session management; MFA; account recovery; service identities; identity-provider federation.                                      | Platform Operations; Audit & Compliance.                                                                      | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Security Lead → Chief Software Engineer → Architecture Governance Board          |
| Student Relationship         | Student Platform Engineering               | Student Services / Product Operations      | Prospect conversion; student profile status; onboarding; re-engagement; alumni classification; relationship history.                                                          | Identity & Access; Enrollment; Communication.                                                                 | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Academy                      | Tenant Platform Engineering                | Platform Administration                    | Academy creation; settings; branding; membership; academy-level policies; feature entitlements.                                                                               | Identity & Access; Audit & Compliance.                                                                        | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Sponsor Relationship         | Privacy & Delegated Access Engineering     | Student Services / Privacy Officer         | Sponsor linkage; consent; visibility scope; access expiry; revocation; sponsor communications.                                                                                | Identity & Access; Student Relationship; Enrollment; Audit & Compliance.                                      | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Security Lead → Chief Software Engineer → Architecture Governance Board          |
| Exam Product & Specification | Exam Specification Engineering             | Chief Academic Office                      | Exam products; editions; sections; modules; score scales; timing; tools; question families; accommodations; result interpretation.                                            | Academic Publishing; Competency Framework.                                                                    | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Competency Framework         | Academic Model Engineering                 | Academic Standards Team                    | Competency hierarchies; observable indicators; prerequisite relationships; mappings; framework versions.                                                                      | Exam Product & Specification; Academic Publishing.                                                            | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Course & Offering            | Course Platform Engineering                | Academic Product Management                | Courses; course versions; offerings; cohorts; instructors; capability configuration; availability windows.                                                                    | Academy; Exam Product & Specification; Learning Content.                                                      | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Enrollment                   | Enrollment Engineering                     | Academy Administration                     | Enrollment approval; activation; dates; suspension; transfer; completion; curriculum pinning; entitlement checks.                                                             | Student Relationship; Course & Offering; Academy.                                                             | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Goal Management              | Preparation Experience Engineering         | Student Success Product Team               | Target exam; overall and sectional target scores; target date; available hours; preferences; prior results; goal revisions.                                                   | Exam Product & Specification; Enrollment.                                                                     | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Preparation Journey          | Preparation Experience Engineering         | Preparation Experience Team                | Journey creation; stage transitions; baseline coordination; active path and plan references; journey snapshots; closure and retake decisions.                                 | Enrollment; Goal Management; Diagnostic Assessment; Learning Path; Exam Readiness.                            | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Diagnostic Assessment        | Assessment Science Engineering             | Assessment Science Team                    | Diagnostic blueprints; assignment; baseline tests; placement; confidence; gap reports; retest and waiver policies.                                                            | Assessment Definition; Examination Delivery; Competency Framework; Academic Evidence.                         | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Learning Content             | Learning Content Engineering               | Academic Content Team                      | Curriculum versions; modules; lessons; learning objectives; prerequisites; resources; release rules; completion evidence.                                                     | Course & Offering; Competency Framework; Academic Publishing; File & Media.                                   | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Learning Path                | Personalization Engineering                | Personalization Team / Academic Design     | Path templates; path generation; prerequisites; remediation and acceleration branches; step status; path revision.                                                            | Diagnostic Assessment; Goal Management; Learning Content; Competency Framework; Mastery.                      | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| File & Media                 | Media Platform Engineering                 | Platform Media & Security Team             | Asset registration; signed upload/delivery authorization; quarantine; malware scanning; media metadata; derivatives; lifecycle; ownership references; retention and disposal. | Identity & Access; Academy; Platform Operations; Audit & Compliance.                                          | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Study Planning               | Personalization Engineering                | Student Success Product Team               | Weekly plans; activity scheduling; workload constraints; replanning; adherence; catch-up periods.                                                                             | Learning Path; Goal Management; Recommendation Engine; Course & Offering.                                     | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Learning Workspace           | Learning Experience Engineering            | Student Experience Team                    | Workspace context; capability resolution; navigation; action queue; cross-domain read projections; workspace preferences.                                                     | Enrollment; Preparation Journey; Learning Content; Study Planning; Recommendation Engine; Exam Readiness.     | Owning grades, attempts, readiness, recommendations or course content                                      | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Question Bank                | Assessment Content Engineering             | Assessment Content Team                    | Question identity and versions; stimuli; answer definitions; options; taxonomy; exposure; authoring and review.                                                               | Competency Framework; Academic Publishing; File & Media; Psychometrics.                                       | Editing published question versions in place                                                               | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Academic Publishing          | Academic Publishing Engineering            | Academic Quality Assurance                 | Publication workflows; reviewer assignments; quality gates; immutable manifests; emergency withdrawal; correction impact.                                                     | Question Bank; Learning Content; Assessment Definition; Exam Simulation; AI Academic Intelligence.            | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Adaptive Practice            | Practice Engineering                       | Personalization & Assessment Science       | Practice policies; candidate pools; adaptive selection; session assembly; feedback policies; exposure control.                                                                | Question Bank; Competency Framework; Mastery; Goal Management; Academic Evidence.                             | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Assessment Definition        | Assessment Definition Engineering          | Assessment Design Team                     | Definitions; versions; blueprints; forms; sections; scoring; timing; release policies; attempt rules.                                                                         | Exam Product & Specification; Competency Framework; Question Bank; Academic Publishing.                       | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Exam Simulation              | Exam Experience Engineering                | Exam Experience Team                       | Simulation policies; section orchestration; breaks; tools; adaptive routing; accommodations; fidelity validation; incidents.                                                  | Exam Product & Specification; Assessment Definition; Examination Delivery; File & Media.                      | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Backend Architect → Engineering Review Board        |
| Examination Delivery         | Examination Platform Engineering           | Examination Platform Team                  | Deliveries; eligibility; attempts; section runs; response autosave; timer authority; final submission; recovery.                                                              | Enrollment; Assessment Definition; Exam Simulation; Identity & Access.                                        | Using browser time as authoritative exam time                                                              | Domain Tech Lead → Principal Backend Architect → Engineering Review Board        |
| Submission & Grading         | Grading Platform Engineering               | Assessment Operations / Grading Team       | Submission normalization; objective scoring; AI grading orchestration; instructor review; override; grade release; appeal.                                                    | Examination Delivery; Question Bank; AI Academic Intelligence; Academic Publishing.                           | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Backend Architect → Engineering Review Board        |
| Academic Evidence            | Academic Intelligence Platform Engineering | Academic Intelligence Platform             | Evidence normalization; source classification; skill linkage; reliability; recency; provenance; supersession.                                                                 | Competency Framework; Examination Delivery; Submission & Grading; Learning Content.                           | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Mastery                      | Mastery & Readiness Engineering            | Assessment Science / Academic Intelligence | Mastery models; estimates; confidence; coverage; recency; histories; contradictory evidence handling.                                                                         | Academic Evidence; Competency Framework; Psychometrics.                                                       | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → AI/Assessment Governance Lead → Architecture Governance Board |
| Exam Readiness               | Mastery & Readiness Engineering            | Assessment Science / Product Analytics     | Readiness models; predicted score range; target gap; confidence; readiness state; estimated ready date; history.                                                              | Goal Management; Mastery; Exam Simulation; Academic Evidence; Study Planning.                                 | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → AI/Assessment Governance Lead → Architecture Governance Board |
| Recommendation Engine        | Recommendation Engineering                 | Personalization Team                       | Candidate generation; eligibility; ranking; explanation; diversity; expiry; response and outcome tracking.                                                                    | Learning Path; Study Planning; Mastery; Exam Readiness; Adaptive Practice; Learning Content.                  | Using an LLM as the sole eligibility or ranking authority                                                  | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| AI Academic Intelligence     | AI Engineering                             | AI Engineering & Academic Governance       | AI gateway; model and prompt registry; evaluators; tutor; coach; planner; predictor; evaluation datasets; cost and safety.                                                    | Submission & Grading; Learning Content; Recommendation Engine; Exam Readiness; Audit & Compliance.            | Writing final grades or readiness directly without governed domain commands                                | Domain Tech Lead → AI/Assessment Governance Lead → Architecture Governance Board |
| Student Success              | Student Success Engineering                | Student Success Team                       | Engagement health; consistency; trajectory; intervention rules; cases; owner assignment; action plans; outcomes.                                                              | Preparation Journey; Study Planning; Exam Readiness; Communication; Academic Intelligence.                    | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Achievement & Milestones     | Engagement Engineering                     | Student Experience / Student Success       | Achievement definitions; eligibility rules; awards; revocation; milestone display.                                                                                            | Student Success; Academic Evidence; Exam Readiness; Study Planning.                                           | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Psychometrics & Item Quality | Psychometrics Engineering                  | Assessment Science Team                    | Difficulty; discrimination; distractor analysis; exposure; timing; form reliability; pilot analysis; retirement recommendations.                                              | Question Bank; Examination Delivery; Assessment Definition; Academic Intelligence.                            | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → AI/Assessment Governance Lead → Architecture Governance Board |
| Academic Intelligence        | Analytics Engineering                      | Academic Analytics Team                    | Metric definitions; cohort analysis; course effectiveness; readiness distribution; AI agreement; instructor impact; target achievement.                                       | Academic Evidence; Mastery; Exam Readiness; Psychometrics; Student Success; Submission & Grading.             | Becoming the transactional source of truth                                                                 | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Academic Operations          | Academic Operations Engineering            | Head of Academic Operations                | Work queues; assignments; SLAs; incident coordination; publishing calendar; live assessment monitoring.                                                                       | Academic Publishing; Examination Delivery; Submission & Grading; Student Success; Platform Operations.        | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Communication                | Communications Engineering                 | Product Operations                         | Announcements; templates; preferences; channel selection; delivery; retries; opt-out; mandatory security notices.                                                             | Identity & Access; Academy; Student Success; Audit & Compliance.                                              | Direct writes to another domain's source-of-truth records; Browser-side enforcement of business invariants | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Audit & Compliance           | Security & Compliance Engineering          | Security & Compliance                      | Audit ledger; security events; access logs; retention; legal hold; export; tamper detection.                                                                                  | Platform Operations.                                                                                          | Storing secrets, answer keys or full student submissions in audit payloads                                 | Security Lead → Chief Software Engineer → Architecture Governance Board          |
| Integration                  | Integration Engineering                    | Integration Engineering                    | External mappings; webhooks; import/export; provider credentials; retries; provenance; reconciliation.                                                                        | Identity & Access; Exam Product & Specification; Communication; AI Academic Intelligence; Audit & Compliance. | Persisting external identifiers as canonical business identity                                             | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |
| Platform Operations          | Site Reliability Engineering               | DevOps / Site Reliability Engineering      | Environment configuration; feature flags; health; queues; backups; restore; capacity; incident response; service identities.                                                  | Identity & Access; Audit & Compliance.                                                                        | Changing academic policy through infrastructure configuration                                              | Domain Tech Lead → Principal Engineering Manager → Engineering Review Board      |

## 3.2 Ownership enforcement

- CODEOWNERS MUST identify the accountable team.
- Every domain package MUST contain an `OWNERS.md`.
- Database entities MUST identify an owner domain in the data dictionary.
- On-call ownership MUST match production module ownership.
- Temporary contributors do not acquire ownership through implementation.
- A transfer of ownership requires an EDR, updated runbooks and explicit acceptance by the receiving team.

---

# SECTION 4 — DATABASE IMPLEMENTATION STANDARDS

## 4.1 Migration standards

- Every schema change MUST be a version-controlled migration.
- Production console edits are prohibited.
- Migrations MUST be deterministic, repeatable in clean environments and reviewable.
- Schema expansion MUST precede application dependence.
- Destructive contraction MUST occur only after all consumers migrate.
- Large data backfills MUST run as resumable jobs, not one unbounded deployment transaction.
- Every migration MUST define rollback or forward-recovery behaviour.
- Migration files MUST identify the owner domain and linked work item.
- Migration ordering MUST be globally deterministic.
- Staging rehearsal is mandatory for high-risk migrations.

## 4.2 Naming conventions

- Schemas and tables: plural `snake_case`.
- Columns: `snake_case`.
- Primary key: `id`.
- Foreign key: `<entity>_id`.
- Academy scope: `academy_id`.
- Timestamps: `_at`.
- Date-only values: `_date`.
- Actor references: `created_by`, `updated_by`, `deleted_by`.
- Version sequence: `version_number`.
- State fields: domain-specific names, not generic `status` where ambiguous.
- Index names: `idx_<table>__<columns>`.
- Unique constraints: `uq_<table>__<business_key>`.
- Foreign keys: `fk_<table>__<referenced_table>`.
- Check constraints: `ck_<table>__<rule>`.

## 4.3 Primary key and UUID policy

- Canonical business records MUST use non-semantic globally unique identifiers.
- UUID generation MUST occur through an approved database or server-side mechanism.
- Sequential user-visible numbers MAY exist as separate display references.
- External provider IDs MUST never replace canonical IDs.
- Natural business keys MUST be protected with explicit unique constraints where required.
- IDs MUST not encode academy, role, date or business meaning.

## 4.4 Foreign keys

- Every canonical relationship MUST use a foreign key unless a documented cross-store boundary prevents it.
- Foreign-key delete actions MUST be explicit.
- Cascade delete is prohibited for evidence, attempts, submissions, grades, audit, published content and historical versions.
- Academy-scoped child records SHOULD use composite integrity controls where needed to prevent cross-academy references.
- Deferrable constraints MAY be used only for a documented transaction requirement.

## 4.5 Standard audit columns

Mutable business records SHOULD include:

- `created_at`.
- `created_by`.
- `updated_at`.
- `updated_by`.

Archivable or selectively soft-deletable records MAY include:

- `deleted_at`.
- `deleted_by`.
- `deletion_reason`.

Published version records SHOULD include:

- `approved_at`.
- `approved_by`.
- `published_at`.
- `published_by`.
- `retired_at`.
- `retired_by`.

Audit columns do not replace the append-only audit ledger.

## 4.6 Soft delete

Soft deletion is selective, not universal.

Use soft deletion when:

- Business recovery is required.
- References may still exist.
- Regulatory or academic history must be preserved.
- An administrator must be able to restore the record.

Do not soft-delete merely to avoid integrity design.

Attempts, evidence, grade decisions, official results, audit records and published versions are archived or invalidated according to their domain rules; they are not casually deleted.

All default queries for soft-deletable entities MUST explicitly address deleted state.

## 4.7 Versioning

- Published versions are immutable.
- Stable identity and version identity MUST be separate.
- References from historical activity MUST point to the exact version used.
- Corrections create a later version and a supersession relationship.
- Version numbers MUST be monotonic within the stable identity.
- Publication manifests MUST pin all transitive academic dependencies required for reproduction.

## 4.8 Temporal history

Temporal history is mandatory where a past decision must be reconstructed.

Use one of:

- Immutable version records.
- effective-from/effective-to records.
- append-only history.
- audited state transition records.

Do not rely on `updated_at` as sufficient history.

## 4.9 Indexing

Every index requires a documented query or integrity purpose.

Standards:

- Index foreign keys used for joins or delete checks.
- Create composite indexes in actual filter and ordering sequence.
- Use partial indexes for active or pending subsets.
- Use unique indexes for canonical business uniqueness.
- Avoid indexing every column.
- Review write amplification and storage.
- Validate important indexes with representative query plans.
- Monitor unused and duplicate indexes.
- Full-text and JSON indexes require a documented search use case.

## 4.10 Partitioning

Partitioning is not a default.

It requires:

- Measured table growth.
- Query or maintenance evidence.
- A documented partition key.
- retention and archival behaviour.
- operational ownership.
- an EDR.

Likely future candidates include audit, telemetry, notification delivery and high-volume event facts.

## 4.11 Transaction standards

- Transactions MUST be as short as correctness permits.
- External network calls MUST NOT occur inside open database transactions.
- Source state and outbox event records MUST commit atomically.
- Application services define transaction boundaries.
- Domain repositories MUST not independently create hidden nested transactions.
- Concurrency-sensitive updates MUST use optimistic version checks, locks or atomic database operations.
- Deadlock-prone lock ordering MUST be documented and tested.

## 4.12 Backup expectations

- Point-in-time recovery.
- encrypted automated backups.
- periodic logical exports.
- object-storage recovery strategy.
- quarterly restore tests.
- documented RPO/RTO.
- backup alerting.
- owner-assigned recovery runbooks.

## 4.13 Database review checklist

A database review MUST confirm:

1. Owner domain.
2. business rule traceability.
3. aggregate boundary.
4. naming.
5. primary and foreign keys.
6. academy scope.
7. uniqueness.
8. nullability.
9. check constraints.
10. version and history behaviour.
11. soft deletion.
12. RLS.
13. indexes and query plans.
14. migration risk.
15. rollback or forward recovery.
16. backup and retention implications.
17. analytics or event projection effects.

---

# SECTION 5 — BACKEND DEVELOPMENT STANDARDS

## 5.1 Layering

Backend modules follow Clean Architecture:

```text
Transport Adapter
→ Application Use Case
→ Domain Model
→ Repository / Service Ports
→ Infrastructure Adapters
```

Transport handlers MUST NOT contain business rules.

Domain code MUST NOT depend on HTTP, database, queue, storage or AI SDKs.

## 5.2 API design

- APIs express business resources and commands.
- Generic table CRUD is prohibited for core workflows.
- Public contracts are versioned.
- Commands are explicit: activate, submit, approve, publish, override, invalidate.
- Request and response schemas are documented.
- Cursor pagination is used for large collections.
- Field selection and filters are allow-listed.
- Student contracts exclude answer definitions and restricted internal metadata.
- Idempotency keys are required for retryable create and submit commands.
- Correlation IDs propagate across synchronous and asynchronous work.

## 5.3 Validation

Validation occurs in layers:

1. Transport shape validation.
2. identity and permission validation.
3. domain-state validation.
4. aggregate invariant enforcement.
5. database constraints.
6. external response validation.

Shared validation libraries MAY define primitive formats. Domain-specific rules remain in their owning domain.

## 5.4 Error handling

Errors MUST be classified:

- Validation error.
- authentication error.
- authorization error.
- not found.
- conflict/state violation.
- rate limit.
- dependency unavailable.
- transient failure.
- internal defect.

Public errors use stable codes and safe messages.

Internal details, stack traces and provider payloads MUST NOT be returned to clients.

## 5.5 Exception handling

- Expected business failures are modeled results, not generic exceptions.
- Unexpected exceptions are captured at application boundaries.
- Catch-and-ignore is prohibited.
- Retries apply only to classified transient failures.
- Every terminal asynchronous failure enters a dead-letter or review workflow.
- User-visible failure states must be actionable.

## 5.6 Logging

- Structured JSON logs.
- correlation and trace context.
- domain, command and entity reference.
- safe academy context.
- stable error code.
- duration and outcome.

Never log secrets, tokens, answer keys, full essays, raw recordings or unrestricted AI context.

## 5.7 Caching

- Cache only data with an explicit owner, key, TTL and invalidation strategy.
- Caches are never authoritative.
- Permission-sensitive caches include user and scope context.
- Do not cache answer keys in shared browser-accessible layers.
- Cache stampede protection is required for expensive shared projections.
- Cache introduction requires measured benefit.

## 5.8 Concurrency

- Aggregate updates use version tokens where concurrent editing is possible.
- Attempt saves are idempotent and ordered.
- Final submission is a guarded one-way transition.
- Workers acquire jobs safely and support lease expiry.
- Distributed locks are a last resort and require an EDR.
- Duplicate event delivery is assumed.

## 5.9 Asynchronous processing

Use background jobs for:

- AI evaluation.
- audio processing.
- readiness calculations.
- recommendation generation.
- notifications.
- exports.
- file scanning.
- large imports.
- analytics projections.

Jobs MUST include:

- stable job type and version.
- idempotency key.
- correlation ID.
- academy scope.
- retry classification.
- maximum attempts.
- dead-letter destination.
- telemetry.
- operator recovery action.

## 5.10 Retry policy

- Exponential backoff with jitter for transient dependencies.
- Maximum attempts and total retry window are explicit.
- Validation, permission and permanent provider errors are not retried.
- Side effects require idempotency.
- Circuit breaking protects persistently failing dependencies.
- Retries must not extend exam deadlines or duplicate grading decisions.

## 5.11 Configuration

- Typed and validated at startup.
- Secrets stored in approved secret management.
- No environment-specific values committed to source.
- Academic configuration is versioned business data.
- Feature flags are separately governed.
- Missing critical configuration fails fast.
- Configuration changes are auditable.

## 5.12 Dependency injection

Use explicit constructor or factory injection through interfaces.

A global mutable service locator is prohibited.

Infrastructure adapters are composed at application boundaries.

## 5.13 External integrations

Every provider has an anti-corruption adapter.

Adapters MUST:

- Translate external identifiers.
- validate inbound payloads.
- use timeouts.
- classify errors.
- support retries safely.
- record provenance.
- expose provider-independent results.
- quarantine invalid inbound data.

---

# SECTION 6 — FRONTEND DEVELOPMENT STANDARDS

## 6.1 Feature-based architecture

Frontend code is organised by approved capability and domain context, not by generic technical folders alone.

A feature may contain:

- Route composition.
- server queries.
- client interaction.
- local components.
- accessibility tests.
- browser tests.
- analytics instrumentation.

Business rules remain server-side.

## 6.2 Page ownership

Every page has one accountable feature owner.

Pages compose domain read models but do not own transactional truth.

The Learning Workspace is a governed composition shell and MUST NOT duplicate readiness, recommendation, attempt or progress calculations.

## 6.3 Components

- Shared components belong in the design system only when broadly reusable and semantically stable.
- Domain-specific components remain with the feature.
- Prop-driven composition is preferred over copy-paste variants.
- Business terminology is reflected in component names.
- Components MUST not query the database directly.
- Visual hiding never substitutes for authorization.

## 6.4 Accessibility

Mandatory requirements:

- Keyboard-complete operation.
- visible focus.
- semantic HTML.
- accessible names and descriptions.
- screen-reader announcements for save, timer and validation state.
- sufficient contrast.
- reduced-motion support.
- accessible charts and alternatives.
- no colour-only status.
- logical heading structure.
- target sizes suitable for touch.
- accessible modal and focus management.

## 6.5 Responsive design

Support:

- Mobile.
- tablet.
- laptop.
- desktop.
- examination full-screen layouts.

Exam interactions must preserve readability and answer entry without horizontal page scrolling, except where the exam specification requires structured wide content.

## 6.6 Performance

- Define bundle and route budgets.
- Prefer server rendering for initial authorised data.
- Avoid unnecessary client components.
- Virtualise large lists.
- Optimise media.
- Lazy-load non-critical modules.
- Avoid waterfall requests.
- Measure interaction responsiveness.
- Protect exam autosave and timer rendering from expensive rerenders.

## 6.7 State management

Distinguish:

- Server state.
- URL state.
- local interaction state.
- form state.
- durable unsent exam-response state.

Do not introduce a global state store for convenience.

State library adoption requires an EDR and a defined state category.

## 6.8 Error boundaries

- Route and feature boundaries provide safe recovery.
- Exam pages preserve locally buffered responses when possible.
- Errors show a correlation reference, not internal details.
- Critical failures provide an escalation or retry path.
- Failed optional widgets must not crash the entire workspace.

## 6.9 Loading states

Loading behaviour should communicate:

- What is loading.
- whether prior data is still valid.
- whether an operation is blocking.
- whether background processing continues.

Skeletons should resemble actual layout and not create misleading content.

## 6.10 Empty states

Empty states explain:

- Why no data exists.
- whether action is required.
- who can resolve it.
- the next permitted action.

“No data” must not conceal permission failures or system errors.

## 6.11 Offline and connectivity behaviour

For exam delivery:

- Buffer unsent answer changes locally.
- show connection state.
- retry idempotently.
- never claim a save until acknowledged.
- reconcile after reconnect.
- derive time from server deadlines.
- preserve integrity if submission cannot be confirmed.

For normal learning pages, graceful cached reading MAY be supported, but offline writes require explicit conflict handling.

---

# SECTION 7 — AI ENGINEERING GOVERNANCE

## 7.1 AI release units

The release unit is not merely a model name. It is:

```text
AI Capability
+ Provider Adapter Version
+ Model Identifier
+ Prompt Version
+ Rubric or Policy Version
+ Structured Output Schema
+ Evaluation Dataset Version
+ Threshold Configuration
```

## 7.2 Prompt versioning

- Prompts live in the governed prompt registry.
- No production prompt is embedded anonymously in UI or worker code.
- Prompt versions are immutable after release.
- Every change records author, purpose, evaluation and approval.
- System, task and formatting instructions are separated.
- Prompt rendering is deterministic and testable.
- Sensitive hidden instructions are never returned to clients.

## 7.3 Model versioning

- Approved models are registered by provider and exact identifier.
- Aliases that silently change model behaviour are prohibited for high-impact grading.
- Model retirement includes migration and fallback plans.
- Historical AI runs retain model and provider identifiers.
- Model changes require regression evaluation.

## 7.4 Evaluation

Each AI capability requires:

- Representative benchmark dataset.
- expert-reviewed expected outputs.
- scoring rubric.
- acceptance thresholds.
- edge and adversarial cases.
- subgroup review where relevant and lawful.
- regression comparisons.
- cost and latency measurement.
- release report.

AI grading requires human-score agreement studies before automatic release is enabled.

## 7.5 Hallucination controls

- Ground responses in authorised platform context.
- Use retrieval from approved sources.
- require structured outputs where decisions are consumed by software.
- validate citations or evidence references.
- reject unsupported fields.
- distinguish fact, interpretation and suggestion.
- prevent the assistant from inventing student records.
- do not permit an LLM to create canonical readiness, grades or permissions directly.

## 7.6 Confidence

Confidence must be meaningful for the capability.

It may combine:

- Model signal.
- schema completeness.
- agreement across evaluators.
- evidence coverage.
- input quality.
- benchmark calibration.

A raw provider probability must not be exposed as academic confidence without validation.

## 7.7 Human review

Human review is mandatory when:

- Confidence is below threshold.
- outputs disagree.
- schema validation fails.
- safety or integrity flags appear.
- the assessment policy requires review.
- a student appeals.
- an instructor override is requested.
- the model or prompt is in monitored rollout.

## 7.8 Fallback behaviour

Fallback must be defined per capability:

- Queue for later processing.
- alternate approved provider.
- rules-based feedback.
- human review.
- clear “result delayed” status.

Fallback must not silently reduce academic quality while presenting the result as equivalent.

## 7.9 Provider abstraction

All AI SDK usage is confined to provider adapters.

Domain-facing contracts use canonical requests and responses.

Provider-specific raw payloads are retained only where justified and access-controlled.

## 7.10 Cost monitoring

Track:

- Cost per request.
- cost per student.
- cost per course.
- cost per assessment type.
- token/audio usage.
- retry cost.
- fallback cost.
- budget thresholds.

Cost controls may route to cheaper approved models only where evaluation proves suitability.

## 7.11 Prompt testing

Tests include:

- Snapshot rendering.
- schema output tests.
- injection attempts.
- missing context.
- contradictory context.
- long input.
- unsupported language.
- provider error.
- model refusal.
- harmful or disallowed request.
- active-assessment integrity cases.

## 7.12 Safety and privacy

- Minimum necessary student context.
- no cross-student context.
- no active-exam answer assistance.
- restricted sponsor visibility.
- PII redaction where possible.
- provider retention policy review.
- data residency assessment.
- incident response.

## 7.13 Auditability

Every consequential AI run records:

- Capability.
- student/academy scope.
- input references or hashes.
- prompt and model versions.
- rubric/policy version.
- output.
- validation result.
- confidence.
- cost.
- latency.
- review status.
- final authority decision.

---

# SECTION 8 — SECURITY IMPLEMENTATION STANDARDS

## 8.1 Authentication

- Approved identity provider behind an adapter.
- secure HTTP-only cookie sessions for browser applications.
- MFA for privileged staff.
- email verification.
- session revocation.
- password-reset protections.
- rate limiting.
- suspicious login monitoring.
- no authentication tokens in URLs or logs.

## 8.2 Authorization

Every request evaluates:

1. Authenticated principal.
2. account status.
3. academy membership.
4. role permissions.
5. resource ownership or assignment.
6. enrollment or sponsor scope.
7. object state.
8. time and release conditions.
9. explicit denial policies.

Client-side checks are only user-experience optimisations.

## 8.3 RLS

- RLS applies defence in depth to academy and student-sensitive records.
- Default deny.
- Policies use stable identity and membership relationships.
- Service identities receive minimum scope.
- RLS is tested with positive and negative cases.
- Policy changes require database and security review.
- Privileged administrative bypasses are explicit and audited.
- Answer keys and hidden assessment content require stricter isolation than normal course content.

## 8.4 Secrets

- Secrets are stored in an approved secret manager.
- Secrets never enter source control, logs, analytics or client bundles.
- Separate credentials per environment.
- Least-privilege provider keys.
- Rotation policy.
- breach revocation runbook.
- local development uses non-production credentials.

## 8.5 Encryption

- TLS for all network traffic.
- provider-supported encryption at rest.
- additional application-level encryption for selected highly sensitive fields only where threat modelling justifies it.
- managed key rotation.
- no custom cryptography.

## 8.6 PII handling

- Classify personal data.
- minimise collection.
- restrict exports.
- mask data in support views.
- prevent PII in telemetry.
- define retention.
- provide lawful deletion or anonymisation flows where compatible with academic record obligations.
- sponsor access is field-scoped.

## 8.7 Rate limiting and abuse

Limits apply by:

- IP.
- identity.
- academy.
- command.
- provider budget.
- upload size.
- export workload.

Exam autosave limits must tolerate expected legitimate traffic.

## 8.8 Audit logging

Mandatory for:

- Role and membership changes.
- enrollment changes.
- publication.
- grade overrides.
- result release.
- sponsor access.
- data exports.
- model/prompt changes.
- security changes.
- privileged data access.
- destructive or archival operations.

## 8.9 Secure uploads

- Direct-to-private-storage upload where appropriate.
- short-lived upload grants.
- MIME and extension verification.
- content signature inspection.
- size limits.
- malware scanning.
- quarantine until approved.
- media processing in isolated workers.
- never execute uploaded content.
- preserve provenance and ownership.

## 8.10 OWASP-aligned implementation

Security review should cover:

- Injection.
- broken access control.
- authentication failures.
- insecure design.
- security misconfiguration.
- vulnerable dependencies.
- integrity failures.
- logging and monitoring failures.
- server-side request forgery.
- API object-level authorization.
- unrestricted resource consumption.
- unsafe AI/LLM integration.

## 8.11 Threat modelling

Threat modelling is required for:

- Authentication.
- sponsor access.
- assessment delivery.
- answer keys.
- file upload.
- AI context.
- grade override.
- exports.
- external webhooks.
- migration.
- administration.

Each threat model records assets, actors, trust boundaries, abuse cases, mitigations, residual risks and owners.

---

# SECTION 9 — TESTING STRATEGY

## 9.1 Test pyramid and ownership

The team that owns a module owns its tests.

Testing must emphasise fast domain and integration tests, with focused end-to-end coverage for critical journeys.

## 9.2 Unit tests

Cover:

- Domain rules.
- value objects.
- state transitions.
- ranking policies.
- scoring.
- validation.
- error classification.

Target: all critical business rules and decision branches, not a vanity percentage.

## 9.3 Integration tests

Cover:

- Repositories.
- transactions.
- outbox.
- queue handlers.
- storage adapters.
- AI adapters through controlled fakes.
- provider error behaviour.

## 9.4 API tests

Verify:

- Contract shape.
- authentication.
- authorization.
- idempotency.
- state conflicts.
- pagination.
- error codes.
- restricted field omission.

## 9.5 Contract tests

Required for:

- Public APIs.
- domain events.
- provider adapters.
- generated clients.
- event consumers.

Backward compatibility is tested automatically.

## 9.6 Database tests

Verify:

- Constraints.
- foreign keys.
- unique business keys.
- state checks.
- RLS.
- tenant isolation.
- answer-key restrictions.
- migration from previous state.
- rollback or forward recovery.
- important query plans.

## 9.7 UI tests

Component and interaction tests cover:

- Validation.
- loading.
- empty states.
- errors.
- permissions.
- responsive layouts.
- keyboard behaviour.
- autosave status.
- timer display.

## 9.8 AI tests

Include:

- Benchmark evaluations.
- regression.
- schema adherence.
- hallucination and unsupported claims.
- prompt injection.
- privacy leakage.
- active-assessment restrictions.
- confidence thresholds.
- provider failure and fallback.
- cost and latency.

## 9.9 Load and resilience tests

Critical scenarios:

- 5,000 concurrent authenticated users.
- 2,000 simultaneous attempts.
- autosave spikes.
- synchronized submissions.
- queue backlog.
- AI provider outage.
- storage latency.
- database connection pressure.
- reconnect storms.
- report exports.

Targets must be confirmed by approved non-functional requirements.

## 9.10 Security tests

- SAST.
- dependency scanning.
- secret scanning.
- DAST.
- authorization tests.
- RLS tests.
- file-upload abuse.
- webhook forgery.
- rate-limit tests.
- manual penetration testing before major launch.

## 9.11 Accessibility tests

- Automated accessibility scan.
- keyboard-only journey.
- screen-reader spot checks.
- focus order.
- contrast.
- zoom and reflow.
- touch targets.
- reduced motion.
- accessible errors and timers.

## 9.12 Regression tests

Every escaped defect requires a regression test unless technically impossible and formally documented.

## 9.13 End-to-end journeys

Minimum critical journeys:

- Registration and verification.
- enrollment activation.
- goal and journey creation.
- diagnostic completion.
- workspace access.
- practice session.
- assessment autosave and submission.
- simulation interruption and recovery.
- AI writing/speaking review.
- grade release.
- readiness update.
- recommendation acceptance.
- sponsor scoped access.
- grade override.
- publication workflow.

## 9.14 Coverage expectations

- Critical domain rules: 100% mapped to tests.
- State transitions: all legal and illegal transitions tested.
- Public API contracts: 100% contract tested.
- RLS policies: positive and negative tests for every protected entity.
- Critical E2E journeys: production-release blocking.
- Overall line coverage is monitored but must not replace risk-based coverage.

---

# SECTION 10 — OBSERVABILITY

## 10.1 Structured logging

Logs contain:

- Timestamp.
- severity.
- service and module.
- environment.
- trace and correlation ID.
- command or job type.
- safe entity reference.
- academy context where allowed.
- outcome.
- duration.
- error code.

## 10.2 Metrics

Technical metrics:

- Request rate and latency.
- error rate.
- database connections.
- query latency.
- queue depth and age.
- worker throughput.
- storage failures.
- cache effectiveness.
- deployment health.

Academic operational metrics:

- attempt starts and submissions.
- autosave failures.
- simulation incidents.
- grading backlog.
- AI review rate.
- readiness calculation delay.
- recommendation generation delay.
- publication queue age.

## 10.3 Tracing

Trace synchronous and asynchronous boundaries.

Trace context MUST propagate through:

- HTTP.
- database transactions.
- outbox.
- queues.
- workers.
- provider calls.
- event consumers.

## 10.4 Dashboards

Required dashboards:

- Platform health.
- examination delivery.
- AI operations and cost.
- database health.
- queue health.
- media processing.
- security events.
- release health.
- academic operations.

## 10.5 Alerting

Alerts must be:

- Actionable.
- severity-classified.
- routed to an owner.
- linked to a runbook.
- deduplicated.
- tested.

Page immediately for:

- Submission failure spike.
- answer-key exposure.
- cross-tenant access signal.
- database unavailability.
- widespread autosave failure.
- critical security incident.
- unrecoverable data corruption.

## 10.6 Health checks

Separate:

- Liveness.
- readiness.
- dependency health.
- deep operational checks.

A service should not report ready if it cannot safely perform its critical work.

## 10.7 AI monitoring

Monitor:

- Provider availability.
- latency.
- schema rejection.
- confidence.
- human-review rate.
- override rate.
- benchmark drift.
- cost.
- prompt/model distribution.
- safety incidents.

## 10.8 Business metrics

Business metrics must use governed definitions and must never be emitted as unowned ad-hoc names.

---

# SECTION 11 — CI/CD STRATEGY

## 11.1 Branching

Use trunk-based development with short-lived branches.

- Main is always releasable.
- Branches should normally live less than a few days.
- Long-running features remain behind feature flags.
- Direct pushes to protected branches are prohibited.
- Emergency fixes follow the same review and audit controls with accelerated approval.

## 11.2 Pull requests

- One coherent purpose.
- linked work item.
- domain owner review.
- required specialist review for database, security or AI changes.
- green automated checks.
- completed compliance checklist.
- no unresolved critical comments.
- architecture impact declared.

## 11.3 Pipeline stages

1. Dependency and secret scan.
2. formatting and lint.
3. architecture dependency tests.
4. type checking.
5. unit tests.
6. database and integration tests.
7. contract tests.
8. build.
9. ephemeral or preview deployment.
10. browser and accessibility tests.
11. security tests.
12. migration validation.
13. staging deployment.
14. smoke and performance checks.
15. approval.
16. production deployment.
17. post-deployment verification.

## 11.4 Release pipeline

- Releases have a version and manifest.
- changed domains and contracts are listed.
- migrations are identified.
- feature flags and rollout cohorts are defined.
- support and on-call owner is named.
- rollback criteria are explicit.
- AI releases include model/prompt evaluation reports.

## 11.5 Rollback

Rollback strategies include:

- Feature flag disable.
- application rollback.
- worker version rollback.
- provider/model rollback.
- forward-fix migration.
- traffic reduction.
- job pause.
- read-only mode where approved.

Database changes must be designed so application rollback remains possible during the deployment window.

## 11.6 Environments

- Local.
- shared development.
- staging.
- production.

No environment shares production credentials or student data by default.

Test data must be synthetic or appropriately anonymised.

## 11.7 Feature flags

- Owner.
- purpose.
- scope.
- default.
- expiry date.
- removal task.
- audit.
- emergency override.

Stale flags are technical debt.

## 11.8 Database deployment

- Validate migration on a production-like copy.
- estimate lock and duration.
- backup status verified.
- expand before contract.
- large backfills separated.
- monitor during rollout.
- reconcile after completion.

## 11.9 AI deployment

- Register model and prompt.
- run evaluation.
- approve thresholds.
- deploy behind a flag.
- use shadow or limited traffic where possible.
- monitor quality, cost and safety.
- define rollback.
- preserve previous version.

---

# SECTION 12 — CODE REVIEW CHECKLIST

# Clasptek Prep Portal V2 — Pull Request Compliance Checklist

Every pull request must answer these questions. “Not applicable” requires a reason.

## Architectural traceability

- [ ] Which approved domain owns this change?
- [ ] Which aggregate or read model is changed?
- [ ] Which Phase 0.5 business rule IDs apply?
- [ ] Which ADR authorises the business/architecture decision?
- [ ] Which EDR authorises the implementation approach?
- [ ] Does this introduce a new business concept? If yes, stop and obtain an ADR.
- [ ] Are all cross-domain dependencies permitted?
- [ ] Is any source-of-truth ownership being duplicated?

## Behaviour and contracts

- [ ] Which commands are handled?
- [ ] Which domain events are published?
- [ ] Which events are consumed?
- [ ] Are event and API contracts backward compatible?
- [ ] Are idempotency and retry semantics defined?
- [ ] Are state-machine transitions valid?

## Data and security

- [ ] Which entities or projections are changed?
- [ ] Is a migration required?
- [ ] Are constraints, indexes and query plans reviewed?
- [ ] Which permissions are required?
- [ ] Which RLS policies are affected?
- [ ] Are tenant, enrollment and object-level negative tests included?
- [ ] Are audit records created for sensitive actions?
- [ ] Is PII minimised and classified?
- [ ] Are uploads, secrets or external payloads handled safely?

## Quality

- [ ] Unit tests added or updated.
- [ ] Integration and database tests added or updated.
- [ ] Contract tests added or updated.
- [ ] Browser tests added for critical flows.
- [ ] Accessibility checks completed.
- [ ] Performance budget reviewed.
- [ ] Failure, retry and rollback behaviour tested.
- [ ] Logs, metrics and traces added.
- [ ] Runbook or support documentation updated.
- [ ] Feature flag and rollout plan defined.

## 12.1 Required reviewers

| Change type                         | Required reviewer                          |
| ----------------------------------- | ------------------------------------------ |
| Domain rule or aggregate            | Domain owner                               |
| Cross-domain contract               | Both domain owners and Principal Architect |
| Database migration                  | Database Architect or delegate             |
| RLS or authentication               | Security Lead                              |
| AI prompt/model/policy              | AI Governance reviewer                     |
| Examination timing/submission       | Examination Platform Lead                  |
| Accessibility-sensitive interaction | Frontend accessibility reviewer            |
| Infrastructure or deployment        | SRE reviewer                               |
| Public API/event breaking change    | Architecture Governance Board              |

---

# SECTION 13 — DEFINITION OF DONE

A feature is complete only when all applicable conditions are satisfied.

## 13.1 Product and architecture

- Acceptance criteria approved.
- domain owner identified.
- business rules implemented.
- ADR and EDR traceability supplied.
- no new unapproved concept.
- aggregate and dependency boundaries preserved.

## 13.2 Data and contracts

- Migrations reviewed.
- constraints and indexes verified.
- API and event contracts documented.
- backward compatibility confirmed.
- projections and analytics updated.

## 13.3 Security and privacy

- Permissions implemented and tested.
- RLS verified.
- audit records implemented.
- threat assessment completed.
- PII handling approved.
- secrets and uploads secure.

## 13.4 Quality

- Required tests pass.
- accessibility verified.
- performance budgets pass.
- failure and retry behaviour tested.
- no unresolved critical defects.

## 13.5 Operations

- Logs, metrics and traces added.
- dashboards and alerts updated.
- runbooks available.
- rollout and rollback verified.
- support owner briefed.

## 13.6 Documentation

- User-facing documentation updated where required.
- technical documentation updated.
- data dictionary updated.
- ADR/EDR updated.
- release notes prepared.

“Code complete” is not “Done.”

---

# SECTION 14 — ENGINEERING QUALITY GATES

| Gate ID | Gate                     | Exit Criteria                                                                                              | Evidence                      | Approver                     |
| ------- | ------------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------- |
| QG-01   | Architecture Compliance  | Domain owner, aggregate, rule, command, event and permission references supplied; no forbidden dependency. | Architecture Compliance Check | Principal Architect          |
| QG-02   | Database Compliance      | Migration reviewed; constraints, indexes, RLS, rollback and query plans verified.                          | Database Review               | Principal Database Architect |
| QG-03   | Security Compliance      | Threat model, authorization, secret handling, upload controls and audit verified.                          | Security Review               | Security Lead                |
| QG-04   | Test Compliance          | Required unit, integration, contract, database and browser tests pass.                                     | Automated Test Pipeline       | QA Architect                 |
| QG-05   | Performance Compliance   | Budgets and load scenarios pass without exam-critical regression.                                          | Performance Test Report       | SRE Lead                     |
| QG-06   | Accessibility Compliance | Keyboard, screen-reader, focus, contrast and responsive checks pass.                                       | Accessibility Report          | Frontend Lead                |
| QG-07   | Observability Compliance | Logs, metrics, traces, dashboards, alerts and runbooks exist.                                              | Operational Readiness Review  | SRE Lead                     |
| QG-08   | AI Governance Compliance | Prompt/model versions, evaluations, thresholds, costs, fallback and human review approved.                 | AI Release Review             | AI Governance Lead           |
| QG-09   | Documentation Compliance | Contracts, diagrams, data dictionary and user/operations documentation updated.                            | Documentation Check           | Technical Lead               |
| QG-10   | Release Compliance       | Feature flag, rollout, rollback, migration and support ownership approved.                                 | Release Approval              | Release Manager              |

## 14.1 Gate enforcement

- Critical gates are blocking.
- Waivers are time-bound and risk-owned.
- A waiver cannot conceal a known data-loss, cross-tenant, answer-key, grading-integrity or critical-security risk.
- Production approval records the evidence and approvers.
- Repeated waivers become technical debt and trigger governance review.

---

# SECTION 15 — TECHNICAL DEBT GOVERNANCE

## 15.1 Debt categories

### Architecture debt

- Boundary violations.
- duplicate concepts.
- unapproved dependencies.
- temporary bypasses.
- oversized modules.

### Database debt

- Missing constraints.
- inefficient queries.
- legacy columns.
- weak naming.
- missing history.
- oversized migrations.

### Security debt

- Excessive permissions.
- missing RLS.
- outdated dependencies.
- unrotated secrets.
- incomplete threat mitigations.

### AI debt

- Missing evaluations.
- stale prompts.
- undocumented models.
- poor cost controls.
- unreviewed fallbacks.
- benchmark drift.

### Documentation debt

- Missing contracts.
- outdated diagrams.
- incomplete runbooks.
- undocumented decisions.
- data-dictionary drift.

### Test debt

- Missing regression tests.
- flaky tests.
- untested policies.
- skipped browser flows.
- weak test data.

## 15.2 Debt register

Every debt item records:

- ID.
- category.
- description.
- cause.
- affected domains.
- risk.
- owner.
- creation date.
- target resolution.
- temporary control.
- status.
- linked ADR/EDR.
- recurrence prevention.

## 15.3 Severity

- **Critical:** threatens security, data, exam integrity or legal obligations; blocks release.
- **High:** likely material failure or escalating operational risk; scheduled immediately.
- **Medium:** meaningful maintainability or quality cost; planned within a defined quarter.
- **Low:** local improvement; managed in normal backlog.

## 15.4 Review cadence

- Critical and high debt: weekly.
- Domain debt: every sprint review.
- Platform debt: monthly Engineering Review Board.
- Portfolio debt: quarterly Architecture Governance Board.

## 15.5 Approval workflow

Debt may be accepted temporarily only with:

- Named owner.
- risk statement.
- mitigating control.
- expiry.
- remediation work item.
- approval at the required severity level.

---

# SECTION 16 — ARCHITECTURE COMPLIANCE

Developers MUST NOT:

- Create duplicate business objects.
- duplicate business rules.
- create a second source of truth.
- create exam-product-specific duplicate engines.
- introduce new domains without an ADR.
- break aggregate boundaries.
- mutate another domain’s records directly.
- bypass application/domain services.
- bypass audit logging.
- hard-code permissions or exam policies.
- create orphan state machines.
- edit published versions.
- use analytics projections as transactional truth.
- let AI write authoritative outcomes outside governed commands.
- expose answer keys through student contracts.
- use browser time as exam authority.
- persist external provider shapes as canonical data.
- add a shared package to hide unclear ownership.
- introduce a cache without an invalidation strategy.
- perform external network calls in database transactions.

## 16.1 Automated fitness functions

CI SHOULD enforce:

- Package dependency directions.
- no cross-domain internal imports.
- public contract schema compatibility.
- migration naming and ordering.
- event envelope requirements.
- forbidden client imports.
- no AI SDK outside adapters.
- no service credentials in browser code.
- no direct answer-key imports into student features.
- CODEOWNERS coverage.
- documentation references in PR metadata.

## 16.2 Compliance exception

An exception requires:

- ADR for architecture impact.
- EDR for implementation-only impact.
- risk and expiry.
- test and operational controls.
- governance approval.
- a tracked removal plan.

---

# SECTION 17 — ENGINEERING DECISION RECORDS

## 17.1 EDR purpose

ADRs govern business and architecture.

EDRs govern implementation choices that remain within the approved architecture.

An EDR is required when a decision:

- Affects multiple teams.
- introduces a significant dependency.
- changes engineering workflow.
- creates operational commitment.
- selects a provider or framework.
- changes data-access strategy.
- changes testing or deployment standards.

| EDR     | Status   | Decision                                             | Context                                                                                                                           | Rationale                                                                                                  |
| ------- | -------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| EDR-001 | Approved | Use a single monorepo                                | Keep applications, workers, contracts, domain packages, database assets, tests and infrastructure under one versioned repository. | Atomic changes and contract visibility outweigh independent repository autonomy at the current team scale. |
| EDR-002 | Proposed | Use pnpm workspaces                                  | Manage JavaScript/TypeScript packages through a strict workspace-aware package manager.                                           | Fast deterministic installs and explicit workspace dependencies.                                           |
| EDR-003 | Proposed | Use Turborepo task orchestration                     | Coordinate build, lint, type-check and test pipelines across the monorepo.                                                        | Provides dependency-aware task execution and cacheable CI work.                                            |
| EDR-004 | Approved | Use Next.js App Router for the web application       | Implement student, instructor and administrative experiences in one governed web application with clear feature boundaries.       | Matches the approved stack and supports server-side access checks.                                         |
| EDR-005 | Proposed | Use TanStack Query for client server-state           | Use a dedicated query cache only where client-side revalidation is needed.                                                        | Separates server state from local UI state and provides controlled invalidation.                           |
| EDR-006 | Proposed | Use React Hook Form plus schema validation           | Standardise accessible form state, validation and server error mapping.                                                           | Avoids custom form frameworks and duplicated validation plumbing.                                          |
| EDR-007 | Approved | Use PostgreSQL as the transactional source of truth  | All canonical transactional state remains in managed PostgreSQL.                                                                  | Supports relational integrity, transactions, RLS and temporal audit.                                       |
| EDR-008 | Approved | Use SQL-first migrations                             | Schema changes are version-controlled migration files reviewed with application changes.                                          | Prevents schema drift and keeps physical design explicit.                                                  |
| EDR-009 | Approved | Use Supabase Auth behind an identity adapter         | Authentication uses the approved provider without leaking provider-specific identity concepts into business domains.              | Preserves portability and isolates authentication concerns.                                                |
| EDR-010 | Approved | Use Supabase Storage behind a media adapter          | Store restricted media in private buckets and expose only authorised signed access.                                               | Matches the approved platform while preserving an abstraction boundary.                                    |
| EDR-011 | Proposed | Use a PostgreSQL-backed durable queue initially      | Run long jobs through a durable queue with retry and dead-letter support.                                                         | Reduces new infrastructure while providing transactional integration.                                      |
| EDR-012 | Proposed | Introduce Redis only for proven needs                | Use Redis for distributed rate limits, locks or high-value caching only after measured justification.                             | Avoids premature cache inconsistency and operational cost.                                                 |
| EDR-013 | Approved | Use a provider-neutral AI gateway                    | All AI calls pass through typed provider adapters and governed model/prompt registries.                                           | Prevents vendor lock-in and centralises controls.                                                          |
| EDR-014 | Proposed | Use OpenTelemetry-compatible instrumentation         | Emit traces, metrics and structured context through a vendor-neutral standard.                                                    | Allows observability backend changes without reinstrumenting domains.                                      |
| EDR-015 | Approved | Use transactional outbox events                      | Commit domain changes and outbound event records in one database transaction.                                                     | Prevents lost events and dual-write inconsistency.                                                         |
| EDR-016 | Approved | Use REST-style command/query contracts               | Expose explicit versioned business APIs rather than generic table CRUD.                                                           | Supports authorization, idempotency and business semantics.                                                |
| EDR-017 | Proposed | Use OpenAPI as the public contract description       | Generate and validate API clients and contract tests from an approved API specification.                                          | Creates a cross-team source of truth.                                                                      |
| EDR-018 | Approved | Use feature flags for controlled rollout             | New capabilities, models and risky migrations are enabled by environment, academy or cohort.                                      | Supports gradual exposure and rollback.                                                                    |
| EDR-019 | Approved | Use immutable publication manifests                  | Every academic publication records exact content, rules, approvals and version identities.                                        | Provides reproducibility and safe correction.                                                              |
| EDR-020 | Proposed | Use Playwright for end-to-end browser testing        | Automate critical student and operations journeys across supported browsers.                                                      | Provides reliable cross-browser workflow tests.                                                            |
| EDR-021 | Proposed | Use Vitest for TypeScript unit and integration tests | Standardise fast TypeScript testing across web and worker packages.                                                               | Reduces tooling fragmentation.                                                                             |
| EDR-022 | Approved | Use contract-tested domain events                    | Every event has a versioned schema, compatibility policy and consumer contract tests.                                             | Prevents asynchronous integration drift.                                                                   |
| EDR-023 | Approved | Use server-authoritative examination time            | All deadlines and validity decisions derive from server timestamps.                                                               | Protects integrity across clock drift and browser manipulation.                                            |
| EDR-024 | Approved | Use private-by-default media access                  | Files are inaccessible unless a domain permission grants a short-lived access mechanism.                                          | Protects student data and premium academic content.                                                        |

## 17.2 EDR template

```text
EDR ID and title
Status
Owner
Date
Decision
Context
Alternatives considered
Trade-offs
Rationale
Security impact
Data impact
Operational impact
Testing impact
Migration or adoption plan
Rollback or exit strategy
Consequences
Review date
```

Approved EDRs are immutable. Supersession occurs through a later EDR.

---

# SECTION 18 — IMPLEMENTATION ROADMAP

The roadmap converts approved architecture into engineering delivery. Product backlog detail may evolve, but domain order and critical dependencies require governance approval to change.

## 18.1 Roadmap summary

| Phase    | Programme                                      | Epic                            | Feature / Scope                                                                             | Dependencies                           | Acceptance Criteria                                                   | Primary Risk                        | Deliverable                      |
| -------- | ---------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------- | ----------------------------------- | -------------------------------- |
| Phase 1  | Platform Foundation                            | Repository & Toolchain          | Create monorepo, package boundaries, lint/type/test standards and dependency rules.         | Architecture and EDR approval          | Build, type-check, lint and test run consistently locally and in CI.  | Tooling fragmentation               | Working engineering platform     |
| Phase 1  | Platform Foundation                            | Environments & CI/CD            | Create development, staging and production deployment pipelines with secrets and approvals. | Repository foundation                  | Repeatable deployment with rollback evidence.                         | Environment drift                   | Controlled deployment pipeline   |
| Phase 1  | Platform Foundation                            | Observability Foundation        | Implement trace context, structured logs, metrics, health endpoints and alert routing.      | Application skeleton                   | Every service emits correlated telemetry.                             | Unobservable early defects          | Operational baseline             |
| Phase 2  | Identity, Academy & Authorization              | Identity Adapter                | Integrate authentication through a provider adapter and secure session boundary.            | Phase 1                                | Authentication flows and staff MFA pass security tests.               | Provider coupling                   | Trusted identity layer           |
| Phase 2  | Identity, Academy & Authorization              | Academy Scope & Permissions     | Implement academy membership, permission evaluation and RLS foundations.                    | Identity                               | Cross-tenant negative tests pass.                                     | Tenant leakage                      | Authorisation platform           |
| Phase 3  | Exam Specification, Course, Enrollment & Goals | Exam Specification Registry     | Implement versioned exam products, score scales and policy configuration.                   | Phase 2                                | Historical versions remain reproducible.                              | Hard-coded exam logic               | Exam specification module        |
| Phase 3  | Exam Specification, Course, Enrollment & Goals | Course & Enrollment             | Implement course versions, offerings, cohorts and active entitlement.                       | Academy and exam specification         | Only active enrolled students receive access.                         | Access inconsistency                | Course entitlement               |
| Phase 3  | Exam Specification, Course, Enrollment & Goals | Goal Management                 | Implement versioned goals and recalculation triggers.                                       | Enrollment                             | Material goal changes preserve history and emit events.               | Silent goal mutation                | Goal module                      |
| Phase 4  | Preparation Journey, Diagnostics & Workspace   | Preparation Journey             | Implement journey lifecycle and snapshots.                                                  | Enrollment and goals                   | Journey state changes follow canonical rules.                         | Overlapping state ownership         | Journey orchestration            |
| Phase 4  | Preparation Journey, Diagnostics & Workspace   | Diagnostic Delivery             | Implement diagnostic policy using the shared delivery kernel.                               | Journey and assessment foundation      | Baseline evidence and gap analysis produced.                          | Duplicate assessment code           | Diagnostic capability            |
| Phase 4  | Preparation Journey, Diagnostics & Workspace   | Learning Workspace              | Build authorised workspace composition and read projection.                                 | Journey, enrollment and course         | Workspace shows only permitted capability state.                      | Read model becoming source of truth | Student preparation experience   |
| Phase 5  | Competency, Learning Paths & Question Bank     | Competency Framework            | Implement immutable versioned competency graphs and mappings.                               | Exam specification                     | All academic objects map to approved competencies.                    | Taxonomy divergence                 | Academic spine                   |
| Phase 5  | Competency, Learning Paths & Question Bank     | Learning Path & Study Plan      | Implement path generation, scheduling and revisions.                                        | Diagnostics and competencies           | Plans reflect goals, availability and prerequisites.                  | Unexplainable personalisation       | Personalised route               |
| Phase 5  | Competency, Learning Paths & Question Bank     | Question Bank                   | Implement question versions, stimuli, answers, rubrics and publishing workflow.             | Competencies and publishing            | Published versions are immutable and answer keys isolated.            | Question corruption                 | Governed item bank               |
| Phase 6  | Unified Examination Definition & Delivery      | Assessment Definitions          | Implement blueprints, forms, sections, item pinning and publication manifests.              | Question Bank                          | Forms pin exact approved versions.                                    | Historical mismatch                 | Assessment design                |
| Phase 6  | Unified Examination Definition & Delivery      | Delivery Kernel                 | Implement eligibility, attempts, responses, autosave, timing and final submission.          | Assessment definitions                 | Idempotent saves/submits and recovery tests pass.                     | Response loss                       | Reliable examination core        |
| Phase 7  | Adaptive Practice & Assessments                | Adaptive Practice               | Implement candidate eligibility, exposure, difficulty and priority policies.                | Mastery foundation and question bank   | Selection is explainable and no protected item leakage occurs.        | Pseudo-adaptive claims              | Adaptive practice                |
| Phase 7  | Adaptive Practice & Assessments                | Standard Assessments            | Implement scheduling, release and objective grading.                                        | Delivery kernel                        | Assessment states and releases follow policy.                         | Premature result release            | Assessment capability            |
| Phase 8  | Exam Simulation                                | Simulation Policy Packs         | Implement configurable exam-specific timing, sequence, tools and accommodations.            | Exam specification and delivery kernel | Fidelity QA passes for each launch exam.                              | Exam-specific duplication           | Simulation engine                |
| Phase 8  | Exam Simulation                                | Incident & Recovery             | Implement reconnect, incident capture, restart and invalidation workflows.                  | Simulation sessions                    | Disputed sessions have traceable evidence.                            | Exam integrity disputes             | Operational resilience           |
| Phase 9  | AI Evaluation & Learning Assistance            | AI Gateway & Registries         | Implement provider adapters, prompt/model versions, budgets and audit.                      | Platform foundation                    | No direct provider calls outside gateway.                             | Vendor lock-in and untracked cost   | AI platform                      |
| Phase 9  | AI Evaluation & Learning Assistance            | Writing & Speaking Evaluation   | Implement async evaluation, confidence gates and human review.                              | Submission and grading                 | Benchmark thresholds and fallbacks pass.                              | Incorrect grading                   | Governed AI evaluation           |
| Phase 9  | AI Evaluation & Learning Assistance            | Tutor, Coach & Planner          | Implement authorised-context assistant capabilities with assessment restrictions.           | Learning content, goals and plans      | No hidden-answer or cross-student leakage.                            | Hallucination and integrity         | AI learning support              |
| Phase 10 | Readiness, Recommendations & Student Success   | Academic Evidence & Mastery     | Implement evidence ledger and versioned mastery calculations.                               | All academic activity domains          | Evidence retains provenance and confidence.                           | Untraceable scores                  | Academic intelligence foundation |
| Phase 10 | Readiness, Recommendations & Student Success   | Exam Readiness                  | Implement product-specific prediction and confidence.                                       | Mastery and simulations                | Insufficient evidence is explicit and historical snapshots preserved. | False certainty                     | Readiness capability             |
| Phase 10 | Readiness, Recommendations & Student Success   | Recommendations & Interventions | Implement next-best activity and student-success cases.                                     | Readiness, plans and content           | Recommendations are explainable and outcomes measured.                | Opaque automation                   | Personalised progression         |
| Phase 11 | Migration, Hardening & Launch                  | Legacy Migration                | Inventory, transform, reconcile and cut over V1 data.                                       | All target domains stable              | Record counts, relationships and academic results reconcile.          | Data loss                           | V2 migrated data                 |
| Phase 11 | Migration, Hardening & Launch                  | Production Hardening            | Complete load, security, accessibility, disaster recovery and operations testing.           | All capabilities                       | All critical quality gates pass.                                      | Launch instability                  | Production readiness             |
| Phase 11 | Migration, Hardening & Launch                  | Controlled Cutover              | Pilot academies, feature flags, support readiness and rollback.                             | Hardening                              | Launch can be halted or reversed safely.                              | Irreversible cutover                | Production launch                |

## 18.2 User-story standard

Every user story includes:

- Persona and business outcome.
- owning domain.
- Preparation Journey impact where applicable.
- business-rule IDs.
- permissions.
- commands and events.
- data and migration implications.
- acceptance criteria.
- telemetry.
- accessibility.
- failure cases.
- rollout.

## 18.3 Task decomposition

Tasks should normally cover:

- Domain model.
- application use case.
- persistence.
- API/event contracts.
- authorization.
- UI.
- tests.
- observability.
- documentation.
- migration.
- release configuration.

## 18.4 Phase exit

A phase exits only when:

- Required capabilities work in staging.
- critical quality gates pass.
- runbooks exist.
- owner accepts operations.
- unresolved risks have approved treatment.
- the next phase’s dependencies are stable.

---

# SECTION 19 — ENGINEERING READINESS REVIEW

## 19.1 Remaining risks

1. **Architecture approval status:** Phase 0.5 must be formally approved rather than treated as an informal reference.
2. **Named team capacity:** Single accountable teams are defined logically, but actual staffing and on-call ownership must be assigned.
3. **Launch exam specifications:** Exact SAT, IELTS, TOEFL and CELPIP version contracts must be approved.
4. **Competency Framework V1:** Implementation cannot safely proceed into content and evidence without it.
5. **Readiness validation:** The first readiness model requires academic and statistical approval.
6. **AI benchmark data:** Writing and speaking evaluation require representative expert-scored datasets.
7. **Sponsor/minor policy:** Legal and consent decisions must precede sponsor implementation.
8. **Legacy inventory:** V1 schemas, files, attempts, duplicates and active integrations require a verified inventory.
9. **Operational targets:** Final SLO, RPO, RTO and load targets require accountable approval.
10. **Data retention:** Retention periods by data class remain a governance dependency.
11. **Provider decisions:** Queue, observability and AI provider EDRs require final approval.
12. **Team operating model:** Domain ownership is ineffective without CODEOWNERS, review and on-call enforcement.

## 19.2 Implementation blockers

Phase 1 is blocked until:

- Engineering governance is approved.
- repository and CI EDRs are approved.
- team ownership is assigned.
- environment funding and accounts are available.
- security lead and database review authority are assigned.
- Phase 0.5 critical identifiers are stable.
- the migration inventory begins.

## 19.3 Ambiguous requirements requiring resolution

- Exact student-age and sponsor-consent policy by operating region.
- Whether payments are in V2 core scope or external integration scope.
- Exact initial academy/tenant hierarchy.
- Supported browsers and devices for exam simulation.
- Permitted offline behaviour for each exam product.
- Official-result evidence and verification rules.
- Automatic versus human-reviewed AI release by task type.
- Instructor grade-override approval thresholds.
- Data export formats and institutional reporting obligations.

## 19.4 Potential technical debt

- Reusing legacy table names without semantic mapping.
- allowing direct browser database writes for speed.
- hard-coding IELTS-specific UI inside shared exam components.
- treating JSON imports as the canonical model.
- implementing readiness before evidence and competency foundations.
- shipping AI feedback before evaluation and appeal workflows.
- introducing Redis, microservices or partitioning prematurely.
- using a generic admin role rather than scoped permissions.

## 19.5 Scalability risks

- Autosave write bursts.
- synchronized assessment submission.
- large media uploads.
- AI queue backlog.
- analytics queries against live transactional tables.
- unbounded bulk exports.
- excessive RLS policy complexity.
- database connection exhaustion.
- question-selection query cost.
- event-consumer lag.

## 19.6 Recommendation

Approve Phase 1 only after the Project Governance Charter is accepted, accountable engineering owners are named and all Phase 1 dependencies have assigned decisions.

---

# SECTION 20 — PROJECT GOVERNANCE CHARTER

## 20.1 Governance bodies

### Architecture Governance Board

Accountable for:

- Architecture conformance.
- ADR approval.
- domain changes.
- aggregate-boundary changes.
- service extraction.
- major data and security decisions.
- exception review.

Membership:

- CTO.
- Chief Enterprise Architect.
- Principal Software Architect.
- Principal Database Architect.
- Security Lead.
- AI Governance Lead.
- relevant domain owner.

### Engineering Review Board

Accountable for:

- EDR approval.
- engineering standards.
- technical-debt review.
- cross-team dependencies.
- release engineering.
- recurring quality failures.
- implementation exceptions.

Membership:

- Chief Software Engineer.
- Principal Engineering Manager.
- Backend, Frontend, Database, QA and SRE leads.
- rotating domain tech leads.

### Release Approval Group

Accountable for:

- Production readiness.
- gate evidence.
- migration safety.
- rollback.
- support readiness.
- risk acceptance.

## 20.2 Release approval process

1. Release candidate identified.
2. Automated pipeline evidence collected.
3. domain owners approve changes.
4. database, security and AI specialist reviews completed as applicable.
5. operational readiness review.
6. unresolved risks recorded.
7. release owner and rollback authority named.
8. approval recorded.
9. controlled rollout.
10. post-release verification.
11. incident or success review.

## 20.3 Change management

Changes are classified:

- Standard: low-risk, pre-approved pattern.
- Normal: reviewed through pull request and release process.
- Major: cross-domain, high-impact or migration-heavy; requires governance review.
- Emergency: urgent risk mitigation with accelerated, documented controls.

## 20.4 Risk management

Every significant risk has:

- Description.
- probability.
- impact.
- affected domain.
- owner.
- treatment.
- due date.
- residual risk.
- escalation threshold.

## 20.5 Documentation governance

- Repository documentation is authoritative.
- Every document has owner, status and review date.
- Generated copies identify source revision.
- Changed behaviour and contracts update documentation in the same PR.
- Stale documentation is technical debt.

## 20.6 ADR governance

- Required for architectural change.
- Reviewed by Architecture Governance Board.
- Immutable after approval.
- Superseded, never rewritten.
- Linked to affected code and documentation.

## 20.7 EDR governance

- Required for significant implementation choices.
- Reviewed by Engineering Review Board.
- Must remain within architecture.
- Includes exit strategy.
- Reviewed when assumptions materially change.

## 20.8 Definition of Ready

Work is ready for engineering only when:

- Business outcome is clear.
- owning domain is identified.
- relevant business rules are cited.
- acceptance criteria exist.
- permissions are defined.
- dependencies are available.
- data and migration impact is understood.
- design and content inputs are available.
- test approach is defined.
- no unresolved architecture decision blocks implementation.

## 20.9 Definition of Done

Section 13 is mandatory and release evidence is retained.

## 20.10 Engineering KPIs

Quality:

- Escaped critical defects.
- change failure rate.
- flaky test rate.
- security remediation time.
- accessibility defect rate.
- architecture violation count.

Delivery:

- Lead time.
- deployment frequency.
- review time.
- blocked-work age.
- release predictability.

Reliability:

- Availability.
- latency.
- autosave success.
- submission success.
- recovery time.
- queue age.

AI:

- Evaluation pass rate.
- human-review rate.
- override rate.
- schema rejection.
- cost per evaluated task.
- provider failure rate.

Maintainability:

- Technical debt age.
- dependency freshness.
- documentation freshness.
- module ownership coverage.
- deprecated contract usage.

KPIs must not incentivise unsafe speed or meaningless code volume.

---

# APPENDIX A — GOVERNANCE EVIDENCE MATRIX

| Change                | Minimum evidence                                                    |
| --------------------- | ------------------------------------------------------------------- |
| New domain capability | ADR, domain model update, rule and permission mapping               |
| Database migration    | Migration review, query/lock assessment, rollback, RLS tests        |
| New public API        | OpenAPI contract, auth model, contract tests, version policy        |
| New event             | Event schema, owner, consumers, idempotency and compatibility tests |
| AI model/prompt       | Evaluation report, cost, safety, fallback and rollout               |
| Exam workflow         | State-machine tests, timing/recovery tests, audit and runbook       |
| Sponsor access        | Consent policy, field matrix, RLS and access audit                  |
| Analytics metric      | Metric definition, owner, source and privacy review                 |
| Production release    | Quality gates, rollback, support owner and post-release checks      |

# APPENDIX B — SEVERITY DEFINITIONS

| Severity | Meaning                                                                                                                        | Required response                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| SEV-1    | Security breach, cross-tenant exposure, answer-key exposure, widespread submission loss or platform outage during active exams | Immediate incident command and executive notification |
| SEV-2    | Major function unavailable or material grading/delivery failure with workaround limited                                        | Urgent response and same-day mitigation               |
| SEV-3    | Degraded non-critical function or limited user impact                                                                          | Planned response within support target                |
| SEV-4    | Minor defect or improvement                                                                                                    | Backlog prioritisation                                |

# APPENDIX C — FINAL CONFORMANCE STATEMENT

No implementation is valid merely because it works technically.

It is valid only when it:

- Implements the approved business meaning.
- Respects domain ownership.
- preserves source-of-truth boundaries.
- enforces permissions and security.
- remains reproducible and observable.
- can be tested, operated and rolled back.
- preserves compatibility.
- complies with this engineering constitution.
