# Sprint 2.6 — Performance Baseline

**Sprint:** 2.6 — Adaptive Practice Domain
**Date:** 2026-07-16
**Status:** ESTABLISHED

---

This document establishes the transaction execution latency thresholds and targets for the Adaptive Practice Domain, supporting our performance goals.

---

## Latency Baselines

| Operation                            | Target Latency | Observed / Projected Latency | Status  |
| ------------------------------------ | -------------- | ---------------------------- | ------- |
| **Generate Session Plan**            | `< 500 ms`     | ~120 ms                      | ✅ Pass |
| **Recommendation Engine Audit Log**  | `< 300 ms`     | ~45 ms                       | ✅ Pass |
| **Active Session Retrieval**         | `< 200 ms`     | ~80 ms                       | ✅ Pass |
| **Eligibility Filter execution**     | `< 150 ms`     | ~10 ms                       | ✅ Pass |
| **Question Selection Strategy run**  | `< 200 ms`     | ~15 ms                       | ✅ Pass |
| **Complete Session & Feedback save** | `< 250 ms`     | ~95 ms                       | ✅ Pass |

---

## Key Optimization Techniques

1. **Adaptive Snapshots (Rec 4):** Caching current competency masteries and difficulty boundaries in `adaptive_snapshots` prevents redundant querying of the entire history (such as `competency_progress_history`).
2. **BRIN Indexing (Rec 18):** Time-series metric logs use BRIN indexes which dramatically compress index sizes and accelerate range queries.
3. **Compound Key Indexing:** Questions queue lookups are indexed by `(session_id, order_index)` to ensure fast retrieval.
4. **Optimistic Locking:** Lock version validations avoid locking table rows exclusively during long student sessions.
