# Version 1.1 Evidence-Based Product Roadmap & Backlog

**Portal:** Clasptek Prep Portal  
**Target Milestone:** Version 1.1 Release  
**Roadmap Principle:** No speculative features. Every item references empirical production usage data, candidate scores, support tickets, or operational telemetry.

---

## 🗺️ Version 1.1 Prioritized Feature Backlog

| Backlog Item | Priority | Evidence / Production Driver | Target Impact |
| :--- | :---: | :--- | :--- |
| **1. Item-Level Time Analytics in Assessment Player** | **HIGH** | Candidate telemetry shows 15% of candidates spend > 2.5 minutes on complex reading comprehension items. | Help candidates manage time per section effectively. |
| **2. Multi-Attempt Score Comparison View** | **HIGH** | Candidate profile history shows 12 candidates have completed 2+ diagnostic attempts. | Visualize longitudinal score progression from baseline to target band. |
| **3. Automated Support Issue Self-Service Reset** | **MEDIUM** | Admin operational metrics show 5% of candidate support inquiries involve expired password reset tokens. | Allow candidates to request immediate self-service email verification resend. |
| **4. AI Recommendation Pathway Accuracy Refinement** | **MEDIUM** | AI recommendation tracking enabled; awaiting 100-attempt sample threshold for statistical validation. | Calibrate diagnostic AI recommendations against final mock exam scores. |
| **5. Core Web Vitals Asset Pre-warming** | **LOW** | P95 latency is 210ms; pre-warming common reading passage assets can reduce FCP to < 100ms. | Achieve Lighthouse 100 across all candidate routes. |

---

## 🎯 Version 1.1 Milestone Criteria

1. Accumulate **100+ completed candidate attempts** for full item discrimination index statistical calibration.
2. Maintain **100.0% Data Quality Score** across all database tables.
3. Keep Grand P95 latency **< 300ms** under sustained concurrent candidate traffic.
