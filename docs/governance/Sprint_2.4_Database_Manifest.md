# Sprint 2.4 — Database Manifest

This manifest documents the database tables, relations, and RLS policies introduced in migration batch `00400` through `00403`.

## 1. Schema Tables

### `questions`
- `id` (UUID, PRIMARY KEY)
- `code` (VARCHAR, UNIQUE, NOT NULL)
- `exam_product_id` (UUID, FK to exam_products, NULLABLE)
- `curriculum_module_id` (UUID, FK to curriculum_modules, NULLABLE)
- `status` (VARCHAR, DEFAULT 'DRAFT')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP)
- `lock_version` (INT, DEFAULT 0)

### `question_versions`
- `id` (UUID, PRIMARY KEY)
- `question_id` (UUID, FK to questions, CASCADE)
- `version_no` (VARCHAR, NOT NULL)
- `status` (VARCHAR, DEFAULT 'DRAFT')
- `title` (VARCHAR)
- `payload` (JSONB)
- `digital_signature` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `lock_version` (INT, DEFAULT 0)
- UNIQUE constraint on (`question_id`, `version_no`)

### `answer_options`
- `id` (UUID, PRIMARY KEY)
- `question_version_id` (UUID, FK to question_versions, CASCADE)
- `code` (VARCHAR, NOT NULL)
- `text_content` (TEXT, NOT NULL)
- `is_correct` (BOOLEAN, DEFAULT FALSE)
- `display_order` (INT, NOT NULL)

### `question_media`
- `id` (UUID, PRIMARY KEY)
- `question_version_id` (UUID, FK to question_versions, CASCADE)
- `provider` (VARCHAR, NOT NULL)
- `bucket` (VARCHAR, NOT NULL)
- `object_key` (VARCHAR, NOT NULL)
- `checksum` (VARCHAR)
- `mime_type` (VARCHAR, NOT NULL)
- `file_size` (BIGINT, NOT NULL)
- `duration_seconds` (INT)
- `transcript` (TEXT)
- `caption` (TEXT)
- `thumbnail_key` (VARCHAR)
- `alt_text` (TEXT)

### `solutions`
- `id` (UUID, PRIMARY KEY)
- `question_version_id` (UUID, FK to question_versions, CASCADE, UNIQUE)
- `explanation` (TEXT, NOT NULL)
- `incorrect_explanation` (TEXT)
- `hint` (TEXT)
- `reference_url` (VARCHAR)
- `teaching_note` (TEXT)

### `rubrics`
- `id` (UUID, PRIMARY KEY)
- `question_version_id` (UUID, FK to question_versions, CASCADE, UNIQUE)
- `criteria` (TEXT, NOT NULL)
- `max_points` (INT, NOT NULL)
- `description` (TEXT)

### `question_reviews`
- `id` (UUID, PRIMARY KEY)
- `question_id` (UUID, FK to questions, CASCADE, UNIQUE)
- `reviewer_id` (UUID, NOT NULL)
- `reviewer_role` (VARCHAR, NOT NULL)
- `status` (VARCHAR, DEFAULT 'UNDER_REVIEW')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `question_workflow_history`
- `id` (UUID, PRIMARY KEY)
- `question_id` (UUID, FK to questions, CASCADE)
- `stage` (VARCHAR, NOT NULL)
- `actor_id` (UUID, NOT NULL)
- `comments` (TEXT)
- `timestamp` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### `question_statistics`
- `id` (UUID, PRIMARY KEY)
- `question_id` (UUID, FK to questions, CASCADE, UNIQUE)
- `times_used` (INT, DEFAULT 0)
- `times_answered` (INT, DEFAULT 0)
- `correct_rate` (DECIMAL, DEFAULT 0.0)
- `facility_index` (DECIMAL, DEFAULT 0.0)
- `discrimination_index` (DECIMAL, DEFAULT 0.0)
- `guess_probability` (DECIMAL, DEFAULT 0.0)
- `average_duration_ms` (INT, DEFAULT 0)
- `median_duration_ms` (INT, DEFAULT 0)
- `skip_rate` (DECIMAL, DEFAULT 0.0)
- `last_used` (TIMESTAMP)

### `question_ownership`
- `id` (UUID, PRIMARY KEY)
- `question_id` (UUID, FK to questions, CASCADE, UNIQUE)
- `copyright_holder` (VARCHAR)
- `license` (VARCHAR)
- `source` (VARCHAR)
- `reuse_policy` (VARCHAR)
- `expiration_date` (TIMESTAMP)

### `question_dependencies`
- `id` (UUID, PRIMARY KEY)
- `parent_question_id` (UUID, FK to questions, CASCADE)
- `child_question_id` (UUID, FK to questions, CASCADE)
- `dependency_type` (VARCHAR, NOT NULL)
- UNIQUE constraint on (`parent_question_id`, `child_question_id`)

---

## 2. Row Level Security (RLS) Policies
All tables enforce RLS:
- **Anonymous/Student Users:** Can read published questions and their published version details only.
- **Academic Reviewers & Authors:** Full CRUD operations on draft/review versions.
- **Admin Administrators:** Full privilege access.
