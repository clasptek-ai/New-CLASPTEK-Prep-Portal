-- Migration: 00139_resource_rls.sql
-- Description: Applies Row Level Security (RLS) policies and publication immutability locks.

-- 1. Enable RLS on core tables
ALTER TABLE public.resource_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_type_format_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_publish_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_version_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_resource_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_version_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_checksums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_quota_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_quota_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_metadata_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_validation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tag_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_collection_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_access_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_access_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_localizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_variant_localizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_security_scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_preview_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_link_checks ENABLE ROW LEVEL SECURITY;

-- Enable RLS on projections
ALTER TABLE resource_read.resource_summary_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_read.resource_search_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_read.resource_usage_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_read.resource_duplicate_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_read.resource_broken_link_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_read.resource_storage_health_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_read.resource_processing_queue_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_read.resource_collection_tree_projection ENABLE ROW LEVEL SECURITY;

-- 2. Define Public read policies for published resource content
CREATE POLICY select_published_resources ON public.learning_resources
    FOR SELECT TO authenticated, anon
    USING (status = 'published');

CREATE POLICY select_published_versions ON public.resource_versions
    FOR SELECT TO authenticated, anon
    USING (status = 'published');

CREATE POLICY select_published_variants ON public.resource_variants
    FOR SELECT TO authenticated, anon
    USING (status = 'active');

CREATE POLICY select_published_previews ON public.resource_previews
    FOR SELECT TO authenticated, anon
    USING (status = 'active');

-- 3. Define Admin policies for complete write access
-- Setup admin policies for all tables (bypassed in test context by running as postgres role)
CREATE POLICY admin_all_resource_types ON public.resource_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_resource_formats ON public.resource_formats FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_learning_resources ON public.learning_resources FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_resource_versions ON public.resource_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_resource_variants ON public.resource_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_storage_objects ON public.storage_objects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_upload_sessions ON public.upload_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_resource_metadata ON public.resource_metadata FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_resource_collections ON public.resource_collections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_resource_permissions ON public.resource_access_policies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY admin_all_collection_permissions ON public.collection_access_policies FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Projections read policies
CREATE POLICY select_summary_projections ON resource_read.resource_summary_projection FOR SELECT TO authenticated USING (true);
CREATE POLICY select_search_projections ON resource_read.resource_search_projection FOR SELECT TO authenticated USING (true);
CREATE POLICY select_usage_projections ON resource_read.resource_usage_projection FOR SELECT TO authenticated USING (true);
CREATE POLICY select_collection_tree ON resource_read.resource_collection_tree_projection FOR SELECT TO authenticated USING (true);

-- 4. Publication Immutability Trigger
CREATE OR REPLACE FUNCTION public.check_resource_version_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'published' AND (NEW.status <> 'published' OR NEW.title <> OLD.title OR NEW.resource_format_id <> OLD.resource_format_id OR NEW.estimated_study_minutes <> OLD.estimated_study_minutes) THEN
        RAISE EXCEPTION 'Cannot modify details of a published resource version. Version is immutable.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lock_published_versions
BEFORE UPDATE ON public.resource_versions
FOR EACH ROW EXECUTE FUNCTION public.check_resource_version_immutability();
