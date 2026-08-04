# AI Recommendation Accuracy & Pathway Evaluation Report (v1.1)

**Portal:** Clasptek Prep Portal  
**Audit Date:** `2026-08-04`

---

## 🛡️ Sample Size Threshold Status

> [!IMPORTANT]
> **Recommendation Tracking Enabled**: AI pathway recommendation rules (placing candidates into FOUNDATION, INTERMEDIATE, or ADVANCED study tracks based on diagnostic score) are fully active. Insufficient completed longitudinal candidate journeys exist for multi-stage statistical accuracy analysis (Diagnostic → Pathway → Course → Mock).

---

## Current Pathway Placement Telemetry

- **Total Diagnostic Results Analyzed:** **19**
- **CEFR Placement Breakdown:**
  - **C1 (Advanced):** 4 candidates (21.1%)
  - **B2 (Upper Intermediate):** 5 candidates (26.3%)
  - **B1 (Intermediate):** 6 candidates (31.6%)
  - **A2 (Foundation):** 4 candidates (21.1%)

---

## Accuracy Evaluation Protocol

When candidate count reaches **100+ completed longitudinal journeys**, automated statistical calibration will evaluate:
1. **Diagnostic Placement Accuracy vs Final Mock Score ($\mathbf{R^2}$ Correlation)**
2. **False Positive Placement Rate** (Candidates placed in Advanced who score < B2 on mock)
3. **False Negative Placement Rate** (Candidates placed in Foundation who score > C1 on mock)
