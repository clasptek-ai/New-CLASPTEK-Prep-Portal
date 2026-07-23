# Sprint 2.6 — Architecture Freeze

**Status:** FROZEN
**Date:** 2026-07-16
**Sprint:** 2.6 — Adaptive Practice Domain
**ADR:** ADR-011

---

> [!IMPORTANT]
> This document is permanently frozen. Any changes to the aggregates, repository interfaces, schemas, or events defined here require a new ADR and a new freeze package.

---

## Bounded Context Boundaries

### `PracticeRecommendation` (Aggregate Root)

- Owns AI-generated or instructor-assigned practice recommendations.
- Stores transparency audits: Input Snapshot, Algorithm Version, Decision Trace, and Output Payload.

### `PracticePlan` (Aggregate Root)

- Owns the planning details: Question selection blueprints, target competency boundaries, and Spacing Policies.
- Separated from active practice execution.

### `PracticeSession` (Aggregate Root)

- Owns the active session progress, active question queue (order index, skips, accuracy), session checkpoints, and feedback survey data.

---

## Frozen Repository Contracts

All interfaces reside in `@clasptek/application-adaptive-practice`.

### `PracticeSessionRepository`

```typescript
save(session: PracticeSession): Promise<void>;
findById(id: string): Promise<PracticeSession | null>;
findActive(studentId: string): Promise<PracticeSession | null>;
search(filters: { studentId?: string; status?: string; limit?: number; offset?: number }): Promise<PracticeSession[]>;
archive(id: string): Promise<void>;
restore(id: string): Promise<void>;
nextIdentity(): string;
```

### `PracticePlanRepository`

```typescript
save(plan: PracticePlan): Promise<void>;
findById(id: string): Promise<PracticePlan | null>;
findByStudent(studentId: string): Promise<PracticePlan[]>;
nextIdentity(): string;
```

### `RecommendationRepository`

```typescript
save(recommendation: PracticeRecommendation): Promise<void>;
findById(id: string): Promise<PracticeRecommendation | null>;
findPending(studentId: string): Promise<PracticeRecommendation[]>;
accept(id: string, planId: string): Promise<void>;
reject(id: string): Promise<void>;
expire(id: string): Promise<void>;
nextIdentity(): string;
```

### `StrategyRepository`

```typescript
findByCode(code: string): Promise<PracticeStrategy | null>;
findAll(): Promise<PracticeStrategy[]>;
save(strategy: PracticeStrategy): Promise<void>;
```

---

## Frozen REST API

Base: `/api/v1/practice/`

| Endpoint                       | Method | Handler                                      |
| ------------------------------ | ------ | -------------------------------------------- |
| `/`                            | `GET`  | `GetPracticeHistoryHandler`                  |
| `/`                            | `POST` | `CreatePracticePlanHandler` (generates plan) |
| `/{id}`                        | `GET`  | `GetPracticeSessionHandler`                  |
| `/recommendations`             | `GET`  | `SearchRecommendationsHandler`               |
| `/recommendations`             | `POST` | `GenerateRecommendationsHandler`             |
| `/recommendations/{id}/accept` | `POST` | `AcceptRecommendationHandler`                |
| `/recommendations/{id}/reject` | `POST` | `RejectRecommendationHandler`                |
| `/start`                       | `POST` | `StartPracticeSessionHandler`                |
| `/pause`                       | `POST` | `PausePracticeSessionHandler`                |
| `/resume`                      | `POST` | `ResumePracticeSessionHandler`               |
| `/complete`                    | `POST` | `CompletePracticeSessionHandler`             |
