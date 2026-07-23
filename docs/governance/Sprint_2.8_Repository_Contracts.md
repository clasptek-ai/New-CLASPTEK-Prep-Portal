# Sprint 2.8 — Repository Contracts

## AI Evaluation & Scoring Domain

**Sprint:** 2.8
**Status:** FROZEN
**Date:** 2026-07-16

---

## EvaluationRepository

```typescript
interface EvaluationRepository {
  saveJob(job: EvaluationJob): Promise<void>;
  saveSnapshot(snapshot: EvaluationSnapshot): Promise<void>;
  saveResult(result: EvaluationResult): Promise<void>;
  findJobById(id: string): Promise<EvaluationJob | null>;
  findSnapshotById(id: string): Promise<EvaluationSnapshot | null>;
  findResultById(id: string): Promise<EvaluationResult | null>;
  findResultByJobId(jobId: string): Promise<EvaluationResult | null>;
  findResultBySubmission(submissionId: string): Promise<EvaluationResult[]>;
  findPublishedResultsByStudent(studentId: string): Promise<EvaluationResult[]>;
  searchJobs(filters: EvaluationSearchFilters): Promise<EvaluationJob[]>;
  publishResult(resultId: string, publishedAt: Date): Promise<void>;
  archiveJob(jobId: string): Promise<void>;
  nextIdentity(): string;
}
```

## HumanReviewRepository

```typescript
interface HumanReviewRepository {
  save(review: HumanReview): Promise<void>;
  findById(id: string): Promise<HumanReview | null>;
  findByJob(jobId: string): Promise<HumanReview | null>;
  findPending(): Promise<HumanReview[]>;
  findByReviewer(reviewerId: string): Promise<HumanReview[]>;
  assign(reviewId: string, reviewerId: string): Promise<void>;
  nextIdentity(): string;
}
```

## ModelRepository

```typescript
interface ModelRepository {
  findById(id: string): Promise<any | null>;
  findByCode(modelCode: string, provider: string): Promise<any | null>;
  findAll(activeOnly?: boolean): Promise<any[]>;
  findCurrentVersion(modelId: string): Promise<any | null>;
}
```

## PromptRepository

```typescript
interface PromptRepository {
  findByCode(templateCode: string): Promise<any | null>;
  findCurrentVersion(templateCode: string): Promise<PromptVersion | null>;
  saveVersion(version: PromptVersion): Promise<void>;
  saveExecution(execution: PromptExecution): Promise<void>;
  findExecutionsByJob(jobId: string): Promise<PromptExecution[]>;
}
```

## EvaluationProfileRepository

```typescript
interface EvaluationProfileRepository {
  findById(id: string): Promise<EvaluationProfile | null>;
  findByCode(profileCode: string): Promise<EvaluationProfile | null>;
  findAll(activeOnly?: boolean): Promise<EvaluationProfile[]>;
}
```

---

## Search Filters

```typescript
interface EvaluationSearchFilters {
  studentId?: string;
  submissionId?: string;
  status?: EvaluationJobStatus;
  questionType?: QuestionType;
  isPublished?: boolean;
  limit?: number;
  offset?: number;
}
```

---

## Postgres Implementations

| Contract                      | Postgres Implementation                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `EvaluationRepository`        | `PostgresEvaluationRepository` — packages/persistence        |
| `HumanReviewRepository`       | `PostgresHumanReviewRepository` — packages/persistence       |
| `ModelRepository`             | `PostgresModelRepository` — packages/persistence             |
| `PromptRepository`            | `PostgresPromptRepository` — packages/persistence            |
| `EvaluationProfileRepository` | `PostgresEvaluationProfileRepository` — packages/persistence |
