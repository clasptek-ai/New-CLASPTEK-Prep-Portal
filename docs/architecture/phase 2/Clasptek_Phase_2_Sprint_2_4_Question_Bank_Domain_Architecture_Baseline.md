# Phase 2 Sprint 2.4 — Question Bank Domain Implementation Plan

**Platform:** Clasptek Prep Portal V2  
**Release:** `v1.4.0-question-bank-domain`  
**Bounded Context:** Question Bank  
**Domain Classification:** Core Assessment Domain  
**Upstream Domains:** Platform Foundation, Exam Product, Curriculum, Learning Resources  
**Migrations:** `00400_question_bank.sql` through `00403_question_bank_indexes.sql`  
**Document Status:** Architecture Baseline Candidate  
**Document Revision:** 1.0

---

# 1. Executive Objective

The Question Bank Domain establishes the enterprise Assessment Content Repository responsible for governing every test item, question, answer option, solution explanation, scoring rubric, and review workflow inside Clasptek Prep Portal V2.

The domain is the canonical source of truth for:
- Question identity & metadata
- Question versions (Draft, Under Review, Approved, Published, Deprecated, Archived)
- Option structures, correct/incorrect responses
- Media asset associations (audio, video, images, transcripts, captions)
- Detailed explanations, hint structures, and reference URLs
- Scoring rubrics (criteria, max points, grading descriptions)
- Question review workflows (validations, comments, history)
- Psychometric statistics (facility index, discrimination index, guess probability)
- Question dependency chains (parent/child relationships)

---

# 2. Architectural Design & Boundaries

```text
Platform Foundation & Core Registry
        │
        ▼
Exam Product & Curriculum Domain
        │
        ▼
Question Bank Domain (Sprint 2.4)
        ├── Question Aggregate (Identity, Code, Lifecycle)
        ├── QuestionVersion (Options, Media, Solutions, Rubrics)
        ├── QuestionReview Aggregate (Approval workflows, audit log)
        └── QuestionImport (Bulk ingest pipelines)
```

The Question Bank Domain holds assessment content ONLY. It does NOT own student attempts, test delivery state, or session markers.

---

# 3. Database Schema

The domain utilizes the following main tables:
1. `questions` - Stores identity, code, parent reference, and state.
2. `question_versions` - Stores version content, title, payload (JSONB), and signature.
3. `answer_options` - Multiple choice option definitions.
4. `question_media` - Media attachments (transcripts, captions).
5. `solutions` - Explanations, incorrect feedback, hints.
6. `rubrics` - Scoring rubrics.
7. `question_reviews` - Review workflows state.
8. `question_workflow_history` - Audit comments.
9. `question_statistics` - Psychometric tracking.
10. `question_ownership` - Copyright/license details.
11. `question_dependencies` - Prerequisite dependency mappings.

---

# 4. Verification & Testing

All verification criteria for Sprint 2.4 have been successfully satisfied:
- **Unit and Integration Tests:** 100% test coverage with Vitest (96 passing tests across monorepo).
- **TypeScript Compilation:** Builds cleanly with zero type errors.
- **ADR Registration:** Registered as `ADR-009` under `docs/architecture/ADR/index.md`.
- **Database Integrity:** Migrations compile and secure columns through Row Level Security (RLS) constraints.
