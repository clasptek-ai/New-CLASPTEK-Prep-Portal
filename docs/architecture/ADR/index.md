# Architecture Decision Record (ADR) Registry

This registry tracks all approved architecture decisions for Clasptek Prep Portal V2.

| ADR         | Decision                                  | Domain               | Status   | Link                                          |
| ----------- | ----------------------------------------- | -------------------- | -------- | --------------------------------------------- |
| **ADR-001** | Use a single monorepo                     | Infrastructure       | Accepted | [ADR-001](./001-monorepo.md)                  |
| **ADR-002** | Use Turborepo task orchestration          | Infrastructure       | Accepted | [ADR-002](./002-turborepo.md)                 |
| **ADR-003** | Use Domain-Driven Design (DDD) boundaries | Domain Modeling      | Accepted | [ADR-003](./003-ddd.md)                       |
| **ADR-004** | Preparation Journey Orchestration         | Student Experience   | Accepted | [ADR-004](./004-preparation-journey.md)       |
| **ADR-005** | Unified Assessment Kernel                 | Examination Delivery | Accepted | [ADR-005](./005-unified-assessment-kernel.md) |
| **ADR-006** | Exam Product Domain Boundary Design       | Academic Catalog     | Accepted | [ADR-006](./006-exam-product.md)              |
| **ADR-007** | Curriculum & Programme Domain Boundaries   | Academic Catalog     | Accepted | [ADR-007](./007-curriculum.md)                |
| **ADR-008** | Learning Resources Domain Boundaries      | Academic Catalog     | Accepted | [ADR-008](./008-learning-resources.md)        |
| **ADR-009** | Question Bank Domain Boundaries           | Academic Catalog     | Accepted | [ADR-009](./009-question-bank.md)             |
| **ADR-010** | Student Learning Journey Domain Boundaries | Student Experience   | Accepted | [ADR-010](./010-student-learning-journey.md)  |
| **ADR-011** | Adaptive Practice Domain Boundaries        | Student Experience   | Accepted | [ADR-011](./011-adaptive-practice.md)         |
| **ADR-012** | Assessment Runtime Domain Boundaries        | Examination Delivery | Accepted | [ADR-012](./012-assessment-runtime.md)        |
| **ADR-014** | Readiness & Prediction Engine Domain Boundaries | Student Experience   | Accepted | [ADR-014](./014-readiness-prediction-engine.md) |
| **ADR-015** | AI Learning Coach Domain Boundaries        | Student Experience   | Accepted | [ADR-015](./015-learning-coach-domain.md) |
| **ADR-016** | Learning Analytics & Instructor Intelligence | Student Experience   | Accepted | [ADR-016](./016-learning-analytics.md) |
| **ADR-017** | Presentation Layer Architecture            | Student Experience   | Accepted | [ADR-017](./017-presentation-layer.md) |
| **ADR-018** | Instructor Workspace Architecture          | Student Experience   | Accepted | [ADR-018](./018-instructor-workspace.md) |
| **ADR-019** | Academic Authoring Studio Architecture      | Student Experience   | Accepted | [ADR-019](./019-academic-authoring-studio.md) |
| **ADR-020** | Administration Console Architecture          | Student Experience   | Accepted | [ADR-020](./020-admin-console.md) |
| **ADR-021** | Unified Workspace Framework Architecture    | Student Experience   | Accepted | [ADR-021](./021-unified-workspace.md) |
| **ADR-022** | Integrations & Automation Platform          | Student Experience   | Accepted | [ADR-022](./022-integrations.md) |
| **ADR-023** | Observability & Operational Intelligence Platform | Student Experience | Accepted | [ADR-023](./023-observability.md) |

## Approved Domain Boundaries

Under the DDD boundaries established in [ADR-003](./003-ddd.md), the following domain packages are registered:

- **auth** (authentication methods, credentials flow, Supabase adapters)
- **authorization** (role management, privilege hierarchies, permissions matrix)
- **identity** (user aggregate, profile context, timezone/locale synchronization)
- **security** (account lockout history, security profiles, trusted devices)
- **exam-product** (exam catalog structure, components, versions, variants)
- **curriculum** (curriculum and programme versions, courses, subjects, modules, competencies, objectives, outcomes, and prerequisite dependencies)
- **learning-resources** (lessons, content blocks, deliverable resource versions, media assets, and attachments)
- **question-bank** (questions, version logs, options list, solutions, rubrics, media files, psychometric stats, review requests, and workflow stages)
- **student-learning** (student learning journeys, goals, milestones, streaks, competencies progress/history, study session logging, achievements catalog/earned, bookmarks, plans and versions)
- **adaptive-practice** (practice recommendation logs with audits, practice plan blueprints, selection rules, spacing policy, difficulty progression, feedback, session progress, and strategies)
- **assessment-runtime** (immutable assessment instances with question sequence snapshots, dynamic session lifecycle engine, monotonic checkpointing, offline recovery, security incident detection, and two-stage cryptographic submissions)
- **prediction-engine** (readiness snapshots, prediction history, feature registry, explainability explanations, student risk interventions, and A/B experiments)
- **ai-evaluation** (AI-driven evaluation engine for grading essay components, prompt registry, metrics, A/B evals, human review pipelines, score mapping against rubrics)
- **learning-coach** (personal tutoring context, prompt templates, strategic weekly/monthly study planning, dynamic day study scheduling, goal progress tracking, conversation logs with token counts, habit trackers, streak and consistency analytics, mood journals, and async dashboard projections)
- **learning-analytics** (read-only analytical metrics, cohort aggregations, platform KPIs, dashboard projections, widget configs, export formats, scheduled reporting, data validation rules, and snapshot histories)
