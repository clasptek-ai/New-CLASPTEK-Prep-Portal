-- Migration: 00113_curriculum_lessons.sql
-- Description: Create lessons and related sequence/prerequisite tables with compatibility hooks

-- Create lessons table
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY,
    learning_module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    module_id UUID, -- For learning_resources compatibility
    code VARCHAR(100) NOT NULL,
    slug VARCHAR(150),
    title VARCHAR(255),
    name VARCHAR(255), -- For learning_resources compatibility
    summary TEXT,
    description TEXT, -- For learning_resources compatibility
    lesson_type VARCHAR(50) NOT NULL DEFAULT 'concept', -- concept, demonstration, guided_practice, workshop, discussion, project, revision, exam_strategy, reflection, custom
    default_sequence_no INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER, -- For learning_resources compatibility
    estimated_study_minutes INTEGER NOT NULL DEFAULT 0,
    minimum_study_minutes INTEGER NOT NULL DEFAULT 0,
    maximum_study_minutes INTEGER NOT NULL DEFAULT 0,
    instructional_method VARCHAR(100) NOT NULL DEFAULT 'text_audio',
    completion_policy VARCHAR(50) NOT NULL DEFAULT 'all_activities',
    is_required BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
    -- Optimistic Concurrency Columns
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version INTEGER NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    
    -- Soft Delete Columns
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_lesson_code UNIQUE (code),
    CONSTRAINT chk_lesson_estimated_time CHECK (estimated_study_minutes >= 0),
    CONSTRAINT chk_lesson_sequence_no CHECK (default_sequence_no >= 0)
);

-- Trigger function to synchronize compatibility columns for lessons
CREATE OR REPLACE FUNCTION public.sync_lesson_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Synchronize module references
    IF NEW.module_id IS NOT NULL AND NEW.learning_module_id IS NULL THEN
        NEW.learning_module_id := NEW.module_id;
    ELSIF NEW.learning_module_id IS NOT NULL AND NEW.module_id IS NULL THEN
        NEW.module_id := NEW.learning_module_id;
    END IF;

    -- Synchronize titles/names
    IF NEW.name IS NOT NULL AND NEW.title IS NULL THEN
        NEW.title := NEW.name;
    ELSIF NEW.title IS NOT NULL AND NEW.name IS NULL THEN
        NEW.name := NEW.title;
    END IF;

    -- Synchronize descriptions/summaries
    IF NEW.description IS NOT NULL AND NEW.summary IS NULL THEN
        NEW.summary := NEW.description;
    ELSIF NEW.summary IS NOT NULL AND NEW.description IS NULL THEN
        NEW.description := NEW.summary;
    END IF;

    -- Synchronize sequences/orders
    IF NEW.display_order IS NOT NULL AND NEW.default_sequence_no = 1 THEN
        NEW.default_sequence_no := NEW.display_order;
    ELSIF NEW.default_sequence_no <> 1 AND NEW.display_order IS NULL THEN
        NEW.display_order := NEW.default_sequence_no;
    END IF;

    -- Generate slug if not present
    IF NEW.slug IS NULL AND NEW.title IS NOT NULL THEN
        NEW.slug := lower(regexp_replace(NEW.title, '\s+', '-', 'g'));
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_lesson_columns
BEFORE INSERT OR UPDATE ON public.lessons
FOR EACH ROW EXECUTE FUNCTION public.sync_lesson_columns();

-- Alter blueprint item mapping to reference lessons
ALTER TABLE public.curriculum_blueprint_item_map
ADD CONSTRAINT fk_blueprint_item_map_lesson
FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE SET NULL;

-- Create lesson_sequences table
CREATE TABLE public.lesson_sequences (
    id UUID PRIMARY KEY,
    learning_module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    source_lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    target_lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL DEFAULT 'next', -- next, recommended_next, alternative, remediation, advancement, branch
    priority INTEGER NOT NULL DEFAULT 1,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    condition_json JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- Optimistic Concurrency Columns
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version INTEGER NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    
    -- Soft Delete Columns
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_lesson_sequence UNIQUE (learning_module_id, source_lesson_id, target_lesson_id)
);

-- Create lesson_prerequisites table
CREATE TABLE public.lesson_prerequisites (
    id UUID PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    prerequisite_lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    prerequisite_type VARCHAR(50) NOT NULL DEFAULT 'lesson_completion', -- lesson_completion, outcome_mastery, skill_mastery, diagnostic_clearance, custom
    minimum_completion_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    minimum_mastery_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    required_skill_revision_id UUID REFERENCES public.skill_revisions(id) ON DELETE SET NULL,
    required_skill_level_id UUID REFERENCES public.skill_levels(id) ON DELETE SET NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    rationale TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- Optimistic Concurrency Columns
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version INTEGER NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    
    -- Soft Delete Columns
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_lesson_prerequisite UNIQUE (lesson_id, prerequisite_lesson_id),
    CONSTRAINT chk_lesson_prereq_self CHECK (lesson_id <> prerequisite_lesson_id)
);
