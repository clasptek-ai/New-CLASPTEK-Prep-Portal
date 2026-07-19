# Sprint 2.6 — Technical Debt Register

**Sprint:** 2.6 — Adaptive Practice Domain
**Date:** 2026-07-16
**Status:** ACTIVE

---

## Active Technical Debt

| Debt Item | Complexity / Impact | Priority | Target Sprint | Description |
|---|---|---|---|---|
| **AI Recommendation Algorithm Integration** | High | HIGH | 2.8 | The current strategies registry is seeded with mock schemas. Full ML-based dynamic selections must be integrated in Sprint 2.8. |
| **Exposure Logs Cleanup Job** | Medium | MEDIUM | 2.7 | Question eligibility checks exposure thresholds, but we need a background worker to archive or truncate expired attempts log data. |
| **GDPR Privacy Deletion Integration** | High | MEDIUM | 2.7 | Deletion audits need to support deleting practice snapshots and feedback logs in a cascade block. |
| **BRIN Index Tuning** | Low | LOW | 2.8 | BRIN indexes require tuning of pages per range once production-sized data is populated. |
