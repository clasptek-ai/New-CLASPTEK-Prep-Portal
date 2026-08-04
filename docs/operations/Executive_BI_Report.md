# Executive Business Intelligence Report (v1.1)

**Portal:** Clasptek Prep Portal  
**Domain:** `portal.clasptek.org`  
**Database:** `postgresql://postgres:***@db.texnwdyeyussmevexscw.supabase.co:5432/postgres`  
**Report Date:** `2026-08-04`

---

## Executive Summary

This Executive Business Intelligence Report summarizes candidate registration funnels, active user engagement, assessment completion rates, and programme distributions derived directly from live production database records.

---

## Key Performance Indicators (KPIs)

| Metric | Measured Value | Data Source |
| :--- | :---: | :--- |
| **Total Registered Candidates** | **34** | `public.profiles` |
| **Confirmed Candidate Accounts** | **28** | `auth.users` (`email_confirmed_at IS NOT NULL`) |
| **Daily Active Users (DAU)** | **4** | `auth.users` (`last_sign_in_at > NOW() - INTERVAL '1 day'`) |
| **Total Assessment Attempts** | **34** | `public.assessment_attempts` |
| **Submitted Assessment Attempts** | **27** | `public.assessment_attempts` (`status = 'SUBMITTED'`) |
| **Assessment Completion Rate** | **79.4%** | `submitted_attempts / total_attempts` |
| **Average Candidate Score** | **63.38%** | `public.assessment_results` (`overall_score`) |
| **Persisted CEFR Results** | **19** | `public.assessment_results` |

---

## Programme & Placement Distribution

### CEFR Level Breakdown
- **CEFR C1 (Advanced):** 4 candidates (21.1%)
- **CEFR B2 (Upper Intermediate):** 5 candidates (26.3%)
- **CEFR B1 (Intermediate):** 6 candidates (31.6%)
- **CEFR A2 (Foundation):** 4 candidates (21.1%)

### Programme Popularity
- **English Proficiency Placement Assessment (ENG-PROF-DIAG):** 100% of diagnostic baseline candidates.
