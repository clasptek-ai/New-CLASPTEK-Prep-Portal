# Assessment Intelligence & Item Calibration Report (v1.1)

**Portal:** Clasptek Prep Portal  
**Sample Threshold:** Minimum 100 completed attempts required for item discrimination index & distractor effectiveness calibration.  
**Current Production Sample:** **34 completed attempts (27 submitted attempts)**

---

## 🛡️ Sample Calibration Notification

> [!IMPORTANT]
> **Awaiting Sufficient Production Data**: Full item discrimination index ($\rho$) and distractor effectiveness statistics require a minimum sample of 100 completed candidate attempts. Rather than fabricating un-calibrated conclusions, item difficulty statistics remain sample-gated until 100 submitted attempts accumulate.

---

## Preliminary Content Bank Stratification

| Stratification Metric            | Inventory Count | Calibration Target |      Status       |
| :------------------------------- | :-------------: | :----------------: | :---------------: |
| **Total Published Questions**    |     **650**     |        ≥ 30        |  **VERIFIED ✅**  |
| **FOUNDATION Level Questions**   |     **217**     | Equal 33.3% Split  | **STRATIFIED ✅** |
| **INTERMEDIATE Level Questions** |     **217**     | Equal 33.3% Split  | **STRATIFIED ✅** |
| **ADVANCED Level Questions**     |     **216**     | Equal 33.3% Split  | **STRATIFIED ✅** |
| **Reading Passages**             |      **6**      |        ≥ 6         |  **VERIFIED ✅**  |
| **Writing Tasks**                |      **2**      |        ≥ 2         |  **VERIFIED ✅**  |

---

## Item Exposure & Paper Snapshot Architecture

- **Paper Snapshot Generation:** 100% of attempts created since August 3, 2026 read from an immutable JSONB `paper_snapshot` containing 30 level-balanced grammar questions, 1 reading passage with comprehension items, and 1 writing task prompt.
- **Corrupted Snapshots Count:** **0** (`created_at >= '2026-08-03'`).
