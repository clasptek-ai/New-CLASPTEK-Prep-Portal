# Sprint 2.8 — Architecture Freeze

## AI Evaluation & Scoring Domain

**Sprint:** 2.8
**Status:** FROZEN — No architectural changes after this document
**Date:** 2026-07-16
**Author:** Engineering Platform Team

---

## 1. Bounded Context Summary

| Property              | Value                                 |
| --------------------- | ------------------------------------- |
| Domain                | AI Evaluation & Scoring               |
| Package (Domain)      | `@clasptek/domain-ai-evaluation`      |
| Package (Application) | `@clasptek/application-ai-evaluation` |
| API Prefix            | `/api/v1/evaluations`                 |
| Database Schema       | `00800_ai_evaluation.sql`             |
| RLS                   | `00802_ai_evaluation_rls.sql`         |
| Indexes               | `00803_ai_evaluation_indexes.sql`     |

---

## 2. Aggregate Roots (5)

| Aggregate            | Lifecycle                                                                              | Immutable After     |
| -------------------- | -------------------------------------------------------------------------------------- | ------------------- |
| `EvaluationJob`      | QUEUED → RUNNING → COMPLETED → HUMAN_REVIEW_REQUIRED → APPROVED → PUBLISHED → ARCHIVED | ARCHIVED            |
| `EvaluationResult`   | Mutable until `publish()`                                                              | `publish()` called  |
| `HumanReview`        | ASSIGNED → IN_REVIEW → ESCALATED → APPROVED / REJECTED → PUBLISHED                     | PUBLISHED           |
| `EvaluationSnapshot` | Immutable from creation                                                                | Creation            |
| `EvaluationProfile`  | Config object, frozen per sprint                                                       | Architecture Freeze |

---

## 3. Architectural Decisions (8 Recommendations Adopted)

| Rec                                | Decision                                                                             | Pattern                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Rec 1 — EvaluationSnapshot         | Immutable JSONB snapshot at evaluation time                                          | Object.freeze + ON CONFLICT DO NOTHING                                |
| Rec 2 — Prompt Management          | PromptTemplate / PromptVersion / PromptExecution domain objects                      | Versioned prompt registry with SHA-256 hashing                        |
| Rec 3 — Calibration Domain Object  | CalibrationResult entity with drift indicator                                        | Separate calibration_results table                                    |
| Rec 4 — Frozen Evaluation Profiles | EvaluationProfile aggregate with moderation policy                                   | 4 moderation modes: AUTO, ALWAYS_HUMAN, THRESHOLD_BASED, SAMPLE_BASED |
| Rec 5 — Prompt Audit               | PromptExecution records every model call with hash, tokens, latency                  | prompt_executions append-only table                                   |
| Rec 6 — Human Review Lifecycle     | 6-state machine: ASSIGNED → IN_REVIEW → ESCALATED → APPROVED / REJECTED → PUBLISHED  | HumanReview aggregate                                                 |
| Rec 7 — Evaluation Metrics         | EvaluationMetricsRecord entity with AI latency, token usage, confidence distribution | evaluation_metrics table                                              |
| Rec 8 — Extended Governance        | AI Provider Registry, Prompt Catalogue, Rubric Catalogue, Performance Report         | See governance docs Sprint_2.8_*                                      |

---

## 4. AI Provider Abstraction

```typescript
interface AIProvider {
  id: string;
  name: string;
  provider: string;
  evaluate(prompt: EvaluationPrompt): Promise<ProviderResponse>;
  isAvailable(): Promise<boolean>;
}
```

Registered providers: `OPENAI`, `ANTHROPIC`, `GEMINI`, `AZURE_OPENAI`, `MOCK` (CI only)

---

## 5. Repository Contracts (5 Frozen)

| Contract                      | Implementation                        |
| ----------------------------- | ------------------------------------- |
| `EvaluationRepository`        | `PostgresEvaluationRepository`        |
| `HumanReviewRepository`       | `PostgresHumanReviewRepository`       |
| `ModelRepository`             | `PostgresModelRepository`             |
| `PromptRepository`            | `PostgresPromptRepository`            |
| `EvaluationProfileRepository` | `PostgresEvaluationProfileRepository` |

---

## 6. Command Handlers (6 Frozen)

| Handler                     | Responsibility                                        |
| --------------------------- | ----------------------------------------------------- |
| `QueueEvaluationHandler`    | Create snapshot + enqueue job                         |
| `RunEvaluationHandler`      | AI provider dispatch + result creation + prompt audit |
| `RequestHumanReviewHandler` | Escalate to human reviewer                            |
| `ApproveEvaluationHandler`  | Reviewer/admin approval workflow                      |
| `PublishEvaluationHandler`  | Publish result to student view                        |
| `OverrideScoreHandler`      | Record human score override                           |

---

## 7. Query Handlers (4 Frozen)

| Handler                    | Responsibility                             |
| -------------------------- | ------------------------------------------ |
| `GetEvaluationHandler`     | Fetch result by job or result ID           |
| `GetFeedbackHandler`       | Fetch published feedback + recommendations |
| `GetConfidenceHandler`     | Fetch confidence breakdown                 |
| `SearchEvaluationsHandler` | Paginated search with filters              |

---

## 8. REST API Endpoints (5 Frozen)

| Method  | Path                                | Auth           | Description                      |
| ------- | ----------------------------------- | -------------- | -------------------------------- |
| `GET`   | `/api/v1/evaluations`               | Student        | Search evaluations               |
| `POST`  | `/api/v1/evaluations`               | Student        | Queue evaluation                 |
| `GET`   | `/api/v1/evaluations/[id]`          | Student        | Fetch evaluation result          |
| `GET`   | `/api/v1/evaluations/[id]/feedback` | Student        | Fetch feedback + recommendations |
| `POST`  | `/api/v1/evaluations/[id]/approve`  | Admin/Reviewer | Approve or publish evaluation    |
| `POST`  | `/api/v1/evaluations/[id]/review`   | Admin/Reviewer | Request human review             |
| `PATCH` | `/api/v1/evaluations/[id]/review`   | Admin/Reviewer | Override score                   |

---

## 9. Security Model

- **Student:** RLS enforces `student_id = auth.jwt()->> 'sub'` on all result reads. Published-only access.
- **Reviewer:** Read access to assigned reviews and underlying results. Write access to `human_reviews` and `review_comments`.
- **Admin:** Full access to all tables.
- **Service:** Evaluation jobs queued and executed server-side only. Students never trigger execution directly.

---

## 10. Not In Scope (Sprint 2.8)

| Deferred To | Item                                                         |
| ----------- | ------------------------------------------------------------ |
| Sprint 2.9  | Evaluation worker / queue processor implementation           |
| Sprint 2.9  | Automated reviewer assignment routing                        |
| Sprint 2.9  | Real AI provider implementations (OpenAI, Anthropic, Gemini) |
| Sprint 3.0  | Prediction Engine integration                                |
| Sprint 3.0  | Cross-sprint calibration analytics                           |
