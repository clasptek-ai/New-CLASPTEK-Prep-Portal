-- Migration: 00301_learning_resources_seed.sql
-- Seed initial Lessons, Content Blocks, Learning Resources, and Media Assets for IELTS

-- 1. Seed Lesson
INSERT INTO lessons (id, module_id, code, name, description, display_order, status) VALUES
('10000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'IELTS-LIS-L1', 'IELTS Listening Part 1 Intro', 'Introduction to IELTS Listening section 1 skills', 1, 'PUBLISHED')
ON CONFLICT (code) DO NOTHING;

-- 2. Seed Lesson Version
INSERT INTO lesson_versions (id, lesson_id, version_no, status, name, description) VALUES
('1f000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '1.0.0', 'PUBLISHED', 'Initial Lesson Version', 'Baseline lesson version details')
ON CONFLICT (lesson_id, version_no) DO NOTHING;

-- Update lesson default current version pointer
UPDATE lessons SET lock_version = lock_version + 1 WHERE id = '10000000-0000-0000-0000-000000000001';

-- 3. Seed Content Blocks
INSERT INTO content_blocks (id, lesson_version_id, block_type, text_content, display_order) VALUES
('cb000000-0000-0000-0000-000000000001', '1f000000-0000-0000-0000-000000000001', 'HEADING', '## Welcome to IELTS Listening', 1),
('cb000000-0000-0000-0000-000000000002', '1f000000-0000-0000-0000-000000000001', 'PARAGRAPH', 'This lesson covers the fundamentals of form filling and matching numbers/dates.', 2)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Learning Resource
INSERT INTO learning_resources (id, lesson_id, code, resource_type, slug, name, description, display_order, status) VALUES
('1a000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'IELTS-LIS-R1', 'VIDEO', 'ielts-listening-part-1-video', 'Listening Strategy Video Tutorial', 'Learn how to avoid distractor trap answers in listening', 1, 'PUBLISHED')
ON CONFLICT (code) DO NOTHING;

-- 5. Seed Learning Resource Version
INSERT INTO learning_resource_versions (id, learning_resource_id, version_no, status, name, description) VALUES
('1b000000-0000-0000-0000-000000000001', '1a000000-0000-0000-0000-000000000001', '1.0.0', 'PUBLISHED', 'Initial Video Version', 'Baseline strategy video version')
ON CONFLICT (learning_resource_id, version_no) DO NOTHING;

-- Update learning resource default current version pointer
UPDATE learning_resources SET lock_version = lock_version + 1 WHERE id = '1a000000-0000-0000-0000-000000000001';

-- 6. Seed Media Asset (Accessibility & Cloud Portability metadata included)
INSERT INTO media_assets (id, resource_version_id, provider, bucket, object_key, region, checksum, mime_type, size, duration, hash_algorithm, encryption_status) VALUES
('e0000000-0000-0000-0000-000000000001', '1b000000-0000-0000-0000-000000000001', 'SUPABASE_STORAGE', 'resource-private', 'videos/ielts_listening_intro.mp4', 'us-east-1', 'sha256checksumvalue12345', 'video/mp4', 104857600, 600, 'SHA-256', 'AES-256')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Transcript
INSERT INTO resource_transcripts (id, resource_version_id, transcript_text, language) VALUES
('f0000000-0000-0000-0000-000000000001', '1b000000-0000-0000-0000-000000000001', 'Welcome to IELTS Listening strategy series. Today we review part 1 spelling rules.', 'en')
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Captions
INSERT INTO resource_captions (id, resource_version_id, caption_text, language) VALUES
('f1000000-0000-0000-0000-000000000001', '1b000000-0000-0000-0000-000000000001', '1\n00:00:01,000 --> 00:00:05,000\nWelcome to IELTS Listening strategy series.', 'en')
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Resource Metadata (difficulty, tags, embedding & AI statuses)
INSERT INTO resource_metadata (resource_version_id, metadata_key, metadata_value) VALUES
('1b000000-0000-0000-0000-000000000001', 'difficulty', 'BEGINNER'),
('1b000000-0000-0000-0000-000000000001', 'language', 'en'),
('1b000000-0000-0000-0000-000000000001', 'tags', 'ielts,listening,basics'),
('1b000000-0000-0000-0000-000000000001', 'embedding_status', 'PENDING'),
('1b000000-0000-0000-0000-000000000001', 'ai_summary_status', 'NOT_STARTED')
ON CONFLICT DO NOTHING;
