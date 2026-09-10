-- Migration: 01442_ielts_listening_canonical_replacement.sql
-- Description: Documents and finalizes the replacement of the former IELTS Listening mock
--              with the canonical 40-question dataset (ielts-listening-update.json).
--
-- This migration records the authoritative state of the IELTS Listening module after
-- the canonical replacement. It does NOT modify the current state — the actual data
-- was applied via runtime scripts. This migration serves as the idempotent audit
-- checkpoint and applies any final cleanup.
--
-- Canonical Dataset: datasets/ielts/ielts_listening_update_canonical.json
-- Audio Files: apps/web/public/audio/section-[1-4].mpeg
-- Questions: IELTS-L1-001 to IELTS-L4-040 (40 total, partitioned 10/10/10/10)
-- Tracks: CLASPTEK-IELTS-A-LISTENING-001-P[1-4]
--
-- SECURITY: listening_tracks.transcript = NULL for all IELTS tracks.
-- SCORING: Q33 (IELTS-L4-033) uses MULTI_BLANK type with positional marking.
--          Both blanks must be correct for 1 mark (bows|arrows, strict order).

-- 1. Fix audio track URLs to canonical form with leading slash
UPDATE public.listening_tracks
SET url = '/' || url,
    updated_at = NOW()
WHERE exam_type ILIKE '%IELTS%'
  AND url NOT LIKE '/%'
  AND url NOT LIKE 'http%';

-- 2. Ensure zero transcript exposure for all IELTS audio tracks
UPDATE public.listening_tracks
SET transcript = NULL,
    updated_at = NOW()
WHERE exam_type ILIKE '%IELTS%'
  AND transcript IS NOT NULL;

-- 3. Ensure the four canonical IELTS audio tracks point to the correct public audio files
-- Track 1: Section 1 = /audio/section-1.mpeg
UPDATE public.listening_tracks
SET url = '/audio/section-1.mpeg'
WHERE code = 'CLASPTEK-IELTS-A-LISTENING-001-P1'
  AND url != '/audio/section-1.mpeg';

-- Track 2: Section 2 = /audio/section-2.mpeg
UPDATE public.listening_tracks
SET url = '/audio/section-2.mpeg'
WHERE code = 'CLASPTEK-IELTS-A-LISTENING-001-P2'
  AND url != '/audio/section-2.mpeg';

-- Track 3: Section 3 = /audio/section-3.mpeg
UPDATE public.listening_tracks
SET url = '/audio/section-3.mpeg'
WHERE code = 'CLASPTEK-IELTS-A-LISTENING-001-P3'
  AND url != '/audio/section-3.mpeg';

-- Track 4: Section 4 = /audio/section-4.mpeg
UPDATE public.listening_tracks
SET url = '/audio/section-4.mpeg'
WHERE code = 'CLASPTEK-IELTS-A-LISTENING-001-P4'
  AND url != '/audio/section-4.mpeg';

-- 4. Idempotent verification comment (for audit trail — no data changes)
-- The following assertions are documentation of expected state, not SQL constraints:
--
-- EXPECTED STATE:
--   SELECT count(*) FROM public.questions q
--   JOIN public.question_versions qv ON q.id = qv.question_id
--   WHERE q.code LIKE 'IELTS-L%' AND qv.status = 'published'
--   → 40
--
--   SELECT url FROM public.listening_tracks WHERE code LIKE 'CLASPTEK-IELTS-A-LISTENING-001-%'
--   → /audio/section-1.mpeg, /audio/section-2.mpeg, /audio/section-3.mpeg, /audio/section-4.mpeg
--
--   SELECT transcript FROM public.listening_tracks WHERE exam_type ILIKE '%IELTS%'
--   → NULL (all rows)
--
--   SELECT payload->>'type' FROM question_versions qv
--   JOIN questions q ON q.id = qv.question_id WHERE q.code = 'IELTS-L4-033'
--   → MULTI_BLANK
--
-- OLD MOCK STATUS: The former IELTS Listening mock questions were updated in-place.
-- No old mock records exist. The former IELTS Listening mock is not selectable.
-- The IELTS Academic Blueprint (id: 00000000-0000-0000-0000-000000000001) remains
-- the single active mock blueprint and now loads the canonical 40 questions exclusively.
