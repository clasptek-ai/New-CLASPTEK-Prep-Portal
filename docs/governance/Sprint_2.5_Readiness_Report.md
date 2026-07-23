# Sprint 2.5 — Readiness Report

## 1. Objective

Sprint 2.5 introduces the **Student Learning Journey Domain** to track student enrollments, cohort delivery, progress history, learning path allocations, and performance diagnostics.

## 2. Dependency Readiness

- **Core Platform Foundation:** ✅ COMPLETE
- **Exam Product Catalog:** ✅ COMPLETE
- **Curriculum & Programme:** ✅ COMPLETE
- **Learning Resources Domain:** ✅ COMPLETE
- **Question Bank Domain:** ✅ COMPLETE

## 3. Risks & Mitigations

- **State Bloat Risk:** Tracking individual page views or resource time-spent logs directly in relational databases can degrade performance.
  - _Mitigation:_ Define aggregate boundaries for `StudentProgress` summarizing time-spent on the application level rather than saving fine-grained logs to PG.
- **Security & Isolation:** Student attempts and scores must remain strictly isolated through tenant/student-centric RLS policies.
  - _Mitigation:_ Apply scoped policies to enrollment tables ensuring students can only select/update their own records.
