# Grammar Question Bank Sequence Note

**Document ID:** NOTE-DATA-GRM-001  
**Domain:** Pre-Assessment & Diagnostic Question Bank  
**Effective Date:** 2026-08-20  
**Status:** Approved Architectural Baseline

---

## 1. Executive Summary

`INT-GRM-501` was never generated or inserted into the database due to a historical off-by-one numbering issue during the generation of Tranche 3 questions.

The Pre-Assessment Grammar Question Bank contains **exactly 600 valid, fully configured questions**:

$$\text{Total Valid Grammar Questions} = 600$$

- **Tranche 1 & 2 + First Half of Tranche 3:** `INT-GRM-001` $\rightarrow$ `INT-GRM-500` (500 questions)
- **Second Half of Tranche 3:** `INT-GRM-502` $\rightarrow$ `INT-GRM-601` (100 questions)

---

## 2. Forensic Audit Findings

| Audit Dimension                       |             Value              | Observations                                                                 |
| ------------------------------------- | :----------------------------: | ---------------------------------------------------------------------------- |
| **Total Questions in Database**       |             `600`              | Exactly 200 Foundation, 200 Intermediate, 200 Advanced                       |
| **Code Sequence Range**               | `INT-GRM-001` to `INT-GRM-601` | Numbering gap at `INT-GRM-501` only                                          |
| **`INT-GRM-501` Historical Presence** |             `None`             | Verified across all historical backups and snapshots                         |
| **`INT-GRM-601` Status**              |            `Active`            | Advanced Error Correction question; actively referenced in student attempts  |
| **Option & Key Health**               |          `100% Valid`          | All 600 questions possess 4 options (A–D) and 1 verified correct key         |
| **Student Attempt Impact**            |           `Zero (0)`           | All 135 student-dependent questions & 330 attempt answers remain 100% intact |

---

## 3. Runtime Engine Architecture

The examination engine (`QuestionSelectionService`) selects grammar questions by proficiency level (`FOUNDATION`, `INTERMEDIATE`, `ADVANCED`) and random distribution using internal database UUIDs (`questions.id`, `question_versions.id`):

```sql
SELECT q.id as question_id, q.code, qv.id as version_id, qv.prompt, qv.proficiency_level, qv.payload
FROM public.questions q
JOIN public.question_versions qv ON qv.question_id = q.id
WHERE q.deleted_at IS NULL
  AND (qv.status = 'published' OR qv.status = 'PUBLISHED' OR qv.status IS NOT NULL)
  AND (qv.proficiency_level ILIKE $2 OR qv.proficiency_level ILIKE $3 OR qv.proficiency_level ILIKE $4)
ORDER BY random();
```

- The system does **not** rely on sequential integer math on string codes (`INT-GRM-*`).
- The numbering gap at `INT-GRM-501` has **zero functional impact** on diagnostic tests, question selection, scoring, placement algorithms, or student analytics.

---

## 4. Governance & Decision Record

- **Decision:** Preserve the 600-question inventory as-is (`INT-GRM-001`..`500`, `INT-GRM-502`..`601`).
- **Renumbering Policy:** Renumbering `INT-GRM-601` or shifting question codes is strictly prohibited to preserve historical analytical audit logs and student attempt foreign keys.
- **Database Modification:** **No database modification required.**
