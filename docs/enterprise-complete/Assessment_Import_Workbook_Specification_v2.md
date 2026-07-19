# Clasptek Prep Portal V2

# Assessment Import Workbook Specification

## Enterprise Canonical Workbook Standard

**Version:** 2.0.0  
**Baseline ID:** `assessment-import-workbook-spec-v2`

---

# 1. Purpose

Defines the canonical workbook structure, sheet definitions, data dictionary, validation rules, relationships, versioning, governance and compatibility standards for importing assessment content into Clasptek Prep Portal V2.

---

# 2. Workbook Registry

| Workbook      | Purpose               | Required Sheets                                  |    AI    |  Media   |
| ------------- | --------------------- | ------------------------------------------------ | :------: | :------: |
| Assessment    | Internal assessments  | Metadata, Sections, Questions, AnswerKeys        | Optional | Optional |
| Practice      | Practice exercises    | Metadata, Questions                              | Optional | Optional |
| Mock          | Full mock examination | Metadata, Sections, Questions, Media, AnswerKeys | Optional |    ✓     |
| Reading       | Passage-based exams   | Metadata, Passages, Questions, AnswerKeys        |    No    |    ✓     |
| Writing       | Essay tasks           | Metadata, Questions, Rubrics                     |    ✓     |    No    |
| Grammar       | Grammar exercises     | Metadata, Questions                              |    No    |    No    |
| Listening     | Audio assessments     | Metadata, Audio, Questions, AnswerKeys           |    No    |    ✓     |
| Speaking      | Speaking assessments  | Metadata, Questions, Rubrics, Audio              |    ✓     |    ✓     |
| Question Bank | Reusable repository   | Metadata, Questions                              | Optional | Optional |

---

# 3. Standard Workbook Layout

1. 01_Metadata
2. 02_Sections
3. 03_Passages (Reading only)
4. 04_Audio (Listening/Speaking)
5. 05_Questions
6. 06_Rubrics
7. 07_Scoring
8. 08_AnswerKeys
9. 09_Validation
10. 10_Notes

---

# 4. Cross-Sheet Relationships

```text
Metadata
   │
   ▼
Sections
   │
   ▼
Passages / Audio
   │
   ▼
Questions
   │
   ▼
Scoring
   │
   ▼
Answer Keys
```

Primary Keys:

- assessment_code
- section_id
- passage_id
- audio_id
- question_id
- rubric_id

Foreign Keys:

- questions.section_id → sections.section_id
- questions.passage_id → passages.passage_id
- questions.audio_id → audio.audio_id
- answerkeys.question_id → questions.question_id

---

# 5. Universal Column Dictionary

| Column         | Description                | Type   | Required | Example         |
| -------------- | -------------------------- | ------ | :------: | --------------- |
| question_id    | Unique question identifier | String |    ✓     | IELTS-RD-Q001   |
| question_type  | Supported question type    | Enum   |    ✓     | Multiple Choice |
| topic          | Curriculum topic           | String |    ✓     | Reading         |
| difficulty     | Difficulty level           | Enum   |    ✓     | Medium          |
| marks          | Marks awarded              | Number |    ✓     | 2               |
| question_text  | Display text               | Text   |    ✓     | ...             |
| correct_answer | Canonical answer           | Text   |    ✓     | B               |
| explanation    | Marking explanation        | Text   |    ✓     | ...             |

---

# 6. Enumeration Registry

## Difficulty

- Easy
- Medium
- Hard
- Expert

## Status

- Draft
- Review
- Approved
- Published
- Archived

## Question Types

- Multiple Choice
- Multiple Response
- True / False
- Fill in the Blank
- Matching
- Ordering
- Short Answer
- Essay
- Reading
- Grammar
- Listening
- Speaking

---

# 7. Reading Workbook

Additional sheet:

**03_Passages**

Columns:

- passage_id
- title
- body
- source
- reading_level
- word_count

One passage may relate to multiple questions.

---

# 8. Listening Workbook

Dedicated **04_Audio** sheet.

Columns:

- audio_id
- filename
- transcript
- duration
- playback_limit
- segment_start
- segment_end

One audio asset may support many questions.

---

# 9. Speaking Workbook

Additional metadata:

- prompt_category
- preparation_time
- response_time
- rubric_id
- ai_profile
- human_review_required

---

# 10. Scoring Sheet

| Column           | Description                      |
| ---------------- | -------------------------------- |
| question_type    | Applicable type                  |
| scoring_method   | Automatic / AI / Manual / Hybrid |
| partial_marking  | TRUE/FALSE                       |
| negative_marking | TRUE/FALSE                       |

---

# 11. Question Governance

Each question stores:

- version
- created_by
- reviewed_by
- approved_by
- created_date
- published_date
- review_date

---

# 12. Import State Machine

```text
Uploaded
 ↓
Validated
 ↓
Previewed
 ↓
Imported
 ↓
Reviewed
 ↓
Published
```

---

# 13. Validation Rules

Validate:

- workbook structure
- sheet names
- required columns
- duplicate IDs
- foreign keys
- enums
- media references
- rubric references
- scoring references

---

# 14. Error Code Registry

| Code   | Description            |
| ------ | ---------------------- |
| IMP001 | Missing required field |
| IMP002 | Duplicate identifier   |
| IMP003 | Invalid enum           |
| IMP004 | Missing media          |
| IMP005 | Invalid relationship   |
| IMP006 | Invalid rubric         |
| IMP007 | Invalid scoring rule   |

---

# 15. Localization

Optional columns:

- language
- locale
- translation_group
- default_language

---

# 16. Bulk Operations

Supported:

- Bulk Import
- Bulk Update
- Bulk Archive
- Bulk Publish
- Bulk Replace

All operations are audited.

---

# 17. AI Metadata

Optional columns:

- ai_difficulty
- ai_tags
- ai_competency
- ai_explanation
- ai_feedback_template

---

# 18. Workbook Compatibility Matrix

| Workbook   | Question Bank | Practice | Assessment | Mock | Analytics |
| ---------- | :-----------: | :------: | :--------: | :--: | :-------: |
| Assessment |       ✓       |    ✓     |     ✓      |  ✓   |     ✓     |
| Reading    |       ✓       |    ✓     |     ✓      |  ✓   |     ✓     |
| Writing    |       ✓       |    ✓     |     ✓      |  ✓   |     ✓     |
| Grammar    |       ✓       |    ✓     |     ✓      |  ✓   |     ✓     |
| Listening  |       ✓       |    ✓     |     ✓      |  ✓   |     ✓     |
| Speaking   |       ✓       |    ✓     |     ✓      |  ✓   |     ✓     |

---

# 19. Sample Workbook Guidance

Provide one completed workbook for every supported workbook type, including sample metadata, sections, questions, media references and answer keys.

---

# 20. Success Criteria

Every workbook is deterministic, validated, versioned, auditable, reusable and fully compatible with the Question Bank, Assessment Runtime, Practice Engine, Mock Examination Engine, AI Evaluation, Results, Analytics and Candidate Attempt Review modules.
