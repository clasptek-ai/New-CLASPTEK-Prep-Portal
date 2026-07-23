# Sprint 2.4 — Repository Contracts

This document registers the repository interfaces of the Question Bank Domain as stable, versioned contracts.

## 1. QuestionRepository Contract

```typescript
export interface QuestionRepository {
  /**
   * Generates a new unique identity.
   */
  nextIdentity(): string;

  /**
   * Persists a Question aggregate root, inserting or updating state.
   * Throws OptimisticLockException if lock_version doesn't match.
   */
  save(question: Question): Promise<void>;

  /**
   * Retrieves a Question by its ID.
   */
  findById(id: string): Promise<Question | null>;

  /**
   * Retrieves a Question by its unique Code.
   */
  findByCode(code: string): Promise<Question | null>;

  /**
   * Retrieves a Question only if it is in Published status.
   */
  findPublished(id: string): Promise<Question | null>;

  /**
   * Finds a specific QuestionVersion by Question ID and Version Number.
   */
  findVersion(questionId: string, versionNo: string): Promise<QuestionVersion | null>;

  /**
   * Transition question and version status to published.
   */
  publish(id: string, versionNo: string): Promise<void>;

  /**
   * Transition status to archived.
   */
  archive(id: string): Promise<void>;

  /**
   * Transition status back to draft.
   */
  restore(id: string): Promise<void>;

  /**
   * Clone question as a new entity.
   */
  duplicate(id: string): Promise<string>;

  /**
   * Search query index.
   */
  search(filters: QuestionSearchFilters): Promise<Question[]>;
}
```

---

## 2. QuestionReviewRepository Contract

```typescript
export interface QuestionReviewRepository {
  /**
   * Generates review identity.
   */
  nextIdentity(): string;

  /**
   * Persist a ReviewRequest aggregate.
   */
  save(review: ReviewRequest): Promise<void>;

  /**
   * Look up review request by ID.
   */
  findById(id: string): Promise<ReviewRequest | null>;

  /**
   * Look up review request by associated Question ID.
   */
  findByQuestionId(questionId: string): Promise<ReviewRequest | null>;
}
```

---

## 3. QuestionImportRepository Contract

```typescript
export interface QuestionImportRepository {
  preview(importId: string): Promise<any>;
  validate(payloads: any[]): Promise<ValidationResult>;
  approve(importId: string): Promise<void>;
  import(payloads: any[]): Promise<string[]>;
  rollback(importId: string): Promise<void>;
  history(): Promise<ImportHistory[]>;
}
```

---

## 4. Stability Rules

- **Backwards Compatibility:** Breaking updates to these interface parameters or return types require approval from the Technical Governance Board.
- **Implementation Adherence:** Adapters (e.g. Postgres pool or memory mocks) must adhere to all constraints (such as raising concurrency lock exceptions).
