# Sprint 2.6 — Repository Contracts

**Sprint:** 2.6 — Adaptive Practice Domain
**Date:** 2026-07-16
**Status:** FROZEN

---

This document freezes the repository contract definitions implemented in the `@clasptek/application-adaptive-practice` package.

---

## 1. PracticeSessionRepository

```typescript
export interface PracticeSessionRepository {
  save(session: PracticeSession): Promise<void>;
  findById(id: string): Promise<PracticeSession | null>;
  findActive(studentId: string): Promise<PracticeSession | null>;
  search(filters: {
    studentId?: string | undefined;
    status?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
  }): Promise<PracticeSession[]>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  nextIdentity(): string;
}
```

---

## 2. PracticePlanRepository

```typescript
export interface PracticePlanRepository {
  save(plan: PracticePlan): Promise<void>;
  findById(id: string): Promise<PracticePlan | null>;
  findByStudent(studentId: string): Promise<PracticePlan[]>;
  nextIdentity(): string;
}
```

---

## 3. RecommendationRepository

```typescript
export interface RecommendationRepository {
  save(recommendation: PracticeRecommendation): Promise<void>;
  findById(id: string): Promise<PracticeRecommendation | null>;
  findPending(studentId: string): Promise<PracticeRecommendation[]>;
  accept(id: string, planId: string): Promise<void>;
  reject(id: string): Promise<void>;
  expire(id: string): Promise<void>;
  nextIdentity(): string;
}
```

---

## 4. StrategyRepository

```typescript
export interface StrategyRepository {
  findByCode(code: string): Promise<PracticeStrategy | null>;
  findAll(): Promise<PracticeStrategy[]>;
  save(strategy: PracticeStrategy): Promise<void>;
}
```
