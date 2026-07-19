-- Migration: 00300_learning_resources.sql
-- Core schemas for the Lessons & Learning Resources supporting domain

-- 1. Create Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL,
  code varchar(50) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  description text,
  display_order integer NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'DRAFT',
  lock_version bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- 2. Create Lesson Versions table
CREATE TABLE lesson_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  version_no varchar(50) NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'DRAFT',
  name varchar(255) NOT NULL,
  description text,
  lock_version bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT unique_lesson_version UNIQUE (lesson_id, version_no)
);

-- 3. Create Content Blocks table
CREATE TABLE content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_version_id uuid NOT NULL REFERENCES lesson_versions(id) ON DELETE CASCADE,
  block_type varchar(50) NOT NULL, -- HEADING, PARAGRAPH, IMAGE, VIDEO, CODE, QUOTE, CHECKLIST, TABLE, EMBED
  text_content text NOT NULL,
  display_order integer NOT NULL
);

-- 4. Create Learning Resources table
CREATE TABLE learning_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  code varchar(50) NOT NULL UNIQUE,
  resource_type varchar(50) NOT NULL, -- VIDEO, AUDIO, PDF, ARTICLE, MARKDOWN, PRESENTATION, DOWNLOAD, IMAGE, EXERCISE, ASSIGNMENT, EXTERNAL_LINK
  slug varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  display_order integer NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'DRAFT',
  lock_version bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- 5. Create Learning Resource Versions table
CREATE TABLE learning_resource_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_resource_id uuid NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  version_no varchar(50) NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'DRAFT',
  name varchar(255) NOT NULL,
  description text,
  lock_version bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT unique_resource_version UNIQUE (learning_resource_id, version_no)
);

-- 6. Create Media Assets table
CREATE TABLE media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_version_id uuid NOT NULL REFERENCES learning_resource_versions(id) ON DELETE CASCADE,
  provider varchar(50) NOT NULL, -- SUPABASE_STORAGE, S3
  bucket varchar(255) NOT NULL,
  object_key varchar(1024) NOT NULL,
  region varchar(50),
  checksum varchar(255),
  mime_type varchar(255) NOT NULL,
  size bigint NOT NULL,
  duration integer,
  hash_algorithm varchar(50) DEFAULT 'SHA-256',
  encryption_status varchar(50) DEFAULT 'NONE',
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Create Resource Attachments table
CREATE TABLE resource_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_version_id uuid NOT NULL REFERENCES learning_resource_versions(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  file_size bigint NOT NULL,
  mime_type varchar(255) NOT NULL,
  object_key varchar(1024) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Create Resource Tags table
CREATE TABLE resource_tags (
  resource_version_id uuid NOT NULL REFERENCES learning_resource_versions(id) ON DELETE CASCADE,
  tag varchar(100) NOT NULL,
  PRIMARY KEY (resource_version_id, tag)
);

-- 9. Create Resource Metadata table
CREATE TABLE resource_metadata (
  resource_version_id uuid NOT NULL REFERENCES learning_resource_versions(id) ON DELETE CASCADE,
  metadata_key varchar(100) NOT NULL,
  metadata_value text NOT NULL,
  PRIMARY KEY (resource_version_id, metadata_key)
);

-- 10. Create Resource Transcripts table
CREATE TABLE resource_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_version_id uuid NOT NULL REFERENCES learning_resource_versions(id) ON DELETE CASCADE,
  transcript_text text NOT NULL,
  language varchar(50) NOT NULL
);

-- 11. Create Resource Captions table
CREATE TABLE resource_captions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_version_id uuid NOT NULL REFERENCES learning_resource_versions(id) ON DELETE CASCADE,
  caption_text text NOT NULL,
  language varchar(50) NOT NULL
);

-- 12. Create Resource Downloads table
CREATE TABLE resource_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_version_id uuid NOT NULL REFERENCES learning_resource_versions(id) ON DELETE CASCADE,
  url varchar(2048) NOT NULL,
  title varchar(255) NOT NULL
);

-- 13. Create Resource Links table
CREATE TABLE resource_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_version_id uuid NOT NULL REFERENCES learning_resource_versions(id) ON DELETE CASCADE,
  url varchar(2048) NOT NULL,
  title varchar(255) NOT NULL
);
