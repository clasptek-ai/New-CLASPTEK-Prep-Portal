# Sprint 2.7 — Technical Debt Register

**Sprint:** 2.7 — Assessment Runtime Domain
**Date:** 2026-07-16
**Status:** ACTIVE

---

## Active Technical Debt

| Debt Item                          | Complexity / Impact | Priority | Target Sprint | Description                                                                                                                                                   |
| ---------------------------------- | ------------------- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Downstream Scoring Integration** | High                | HIGH     | 2.8           | Submissions are stored locally in the database, but processing queue integration with the AI Scoring Engine is scheduled for Sprint 2.8.                      |
| **Token Secret Rotation**          | Medium              | MEDIUM   | 2.8           | Reconnection tokens are signed using a static environment secret. A rotation policy for the signing keys needs to be implemented.                             |
| **Heartbeat Partition Pruning**    | Low                 | LOW      | 2.9           | Periodic heartbeats (every 30s) generate high database write volumes. Table partitioning and cron pruning jobs are required to prevent unbounded disk growth. |
