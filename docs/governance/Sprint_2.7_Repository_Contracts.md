# Sprint 2.7 — Repository Contracts

**Sprint:** 2.7 — Assessment Runtime Domain
**Date:** 2026-07-16
**Status:** FROZEN

---

This document freezes the repository contract definitions implemented in the `@clasptek/application-assessment-runtime` package.

---

## 1. AssessmentSessionRepository

```typescript
export interface AssessmentSessionRepository {
  save(session: AssessmentSession): Promise<void>;
  findById(id: string): Promise<AssessmentSession | null>;
  findActive(studentId: string): Promise<AssessmentSession | null>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  search(filters: {
    studentId?: string | undefined;
    status?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
  }): Promise<AssessmentSession[]>;
  nextIdentity(): string;
}
```

---

## 2. AnswerSheetRepository

```typescript
export interface AnswerSheetRepository {
  save(sheet: StudentAnswerSheet): Promise<void>;
  saveAnswer(sessionId: string, answer: StudentAnswer): Promise<void>;
  find(sessionId: string): Promise<StudentAnswerSheet | null>;
  submit(sessionId: string, record: SubmissionRecord): Promise<void>;
}
```

---

## 3. CheckpointRepository

```typescript
export interface CheckpointRepository {
  save(sessionId: string, checkpoint: RuntimeCheckpoint): Promise<void>;
  restore(sessionId: string): Promise<RuntimeCheckpoint | null>;
  deleteExpired(expiryDate: Date): Promise<void>;
}
```

---

## 4. RuntimeStatisticsRepository

```typescript
export interface RuntimeStatisticsRepository {
  update(stats: any): Promise<void>;
  find(sessionId: string): Promise<any | null>;
  aggregate(studentId: string): Promise<any>;
}
```
