# Sprint 2.7 — Architecture Freeze

**Status:** FROZEN
**Date:** 2026-07-16
**Sprint:** 2.7 — Assessment Runtime Domain
**ADR:** ADR-012

---

> [!IMPORTANT]
> This document is permanently frozen. Any changes to the aggregates, repository interfaces, schemas, or events defined here require a new ADR and a new freeze package.

---

## Bounded Context Boundaries

### `AssessmentInstance` (Aggregate Root)

- Immutable template snapshot containing the assessment definition.
- Holds the snapshotted question sequence, timer policies, navigation policies, autosave policies, and metadata.

### `AssessmentSession` (Aggregate Root)

- Active execution instance containing answer sheets, checkpoint log, navigation visits log, telemetry heartbeats, security incidents, and submission receipt.
- Manages strictly validated state machine lifecycle transitions.

---

## Frozen Repository Contracts

All interfaces reside in `@clasptek/application-assessment-runtime`.

### `AssessmentSessionRepository`

```typescript
save(session: AssessmentSession): Promise<void>;
findById(id: string): Promise<AssessmentSession | null>;
findActive(studentId: string): Promise<AssessmentSession | null>;
archive(id: string): Promise<void>;
restore(id: string): Promise<void>;
search(filters: { studentId?: string; status?: string; limit?: number; offset?: number }): Promise<AssessmentSession[]>;
nextIdentity(): string;
```

### `AnswerSheetRepository`

```typescript
save(sheet: StudentAnswerSheet): Promise<void>;
saveAnswer(sessionId: string, answer: StudentAnswer): Promise<void>;
find(sessionId: string): Promise<StudentAnswerSheet | null>;
submit(sessionId: string, record: SubmissionRecord): Promise<void>;
```

### `CheckpointRepository`

```typescript
save(sessionId: string, checkpoint: RuntimeCheckpoint): Promise<void>;
restore(sessionId: string): Promise<RuntimeCheckpoint | null>;
deleteExpired(expiryDate: Date): Promise<void>;
```

### `RuntimeStatisticsRepository`

```typescript
update(stats: any): Promise<void>;
find(sessionId: string): Promise<any | null>;
aggregate(studentId: string): Promise<any>;
```

---

## Frozen REST API

Base: `/api/v1/runtime/`

| Endpoint      | Method | Command/Query Handler                            |
| ------------- | ------ | ------------------------------------------------ |
| `/`           | `GET`  | `GetAssessmentSessionHandler`                    |
| `/`           | `POST` | `CreateAssessmentSessionHandler`                 |
| `/{id}`       | `GET`  | `GetAssessmentSessionHandler`                    |
| `/start`      | `POST` | `StartAssessmentHandler`                         |
| `/pause`      | `POST` | `PauseAssessmentHandler`                         |
| `/resume`     | `POST` | `ResumeAssessmentHandler`                        |
| `/answer`     | `POST` | `SaveAnswerHandler`                              |
| `/answer`     | `GET`  | `GetAnswerSheetHandler`                          |
| `/checkpoint` | `POST` | `CreateCheckpointHandler`                        |
| `/checkpoint` | `GET`  | `GetCheckpointHandler`                           |
| `/submit`     | `POST` | `SubmitAssessmentHandler`                        |
| `/telemetry`  | `POST` | `HeartbeatRecorded` / `SecurityIncidentDetected` |
| `/telemetry`  | `GET`  | `GetNavigationHistoryHandler`                    |
