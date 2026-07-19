-- Migration: 00121_curriculum_rls.sql
-- Description: Enable RLS on all 44 write tables and 5 projections, and configure security policies

-- 1. Enable RLS on public tables
ALTER TABLE public.curricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_dependency_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_publish_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_exam_product_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_learning_path_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_learning_path_node_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_skill_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_exam_component_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_blueprint_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_blueprint_item_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_outcome_skill_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_outcome_exam_component_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_outcome_blueprint_item_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activity_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_assignment_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_version_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_module_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_outcome_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activity_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_assignment_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_template_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_template_usage ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on projection tables in curriculum_read schema
ALTER TABLE curriculum_read.curriculum_summary_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_read.curriculum_coverage_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_read.curriculum_publication_readiness_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_read.curriculum_graph_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_read.lesson_tree_projection ENABLE ROW LEVEL SECURITY;

-- 3. Grant general read permissions to anonymous and authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA curriculum_read TO anon, authenticated;

-- 4. Configure select policies for public schemas (allow active/published, non-deleted rows)
CREATE POLICY select_public_curricula ON public.curricula
    FOR SELECT TO anon, authenticated USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY select_public_curriculum_versions ON public.curriculum_versions
    FOR SELECT TO anon, authenticated USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY select_public_learning_modules ON public.learning_modules
    FOR SELECT TO anon, authenticated USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY select_public_curriculum_lessons ON public.lessons
    FOR SELECT TO anon, authenticated USING (status = 'published' AND deleted_at IS NULL);

-- Create wide read policy for authenticated users to view drafts as well
CREATE POLICY select_auth_curricula ON public.curricula
    FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY select_auth_curriculum_versions ON public.curriculum_versions
    FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY select_auth_learning_modules ON public.learning_modules
    FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY select_auth_curriculum_lessons ON public.lessons
    FOR SELECT TO authenticated USING (deleted_at IS NULL);

-- Apply general READ access for all supporting metadata / maps / sequences to authenticated users
CREATE POLICY select_auth_dep_locks ON public.curriculum_dependency_locks FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_pub_hist ON public.curriculum_publish_history FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_metadata ON public.curriculum_metadata FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_ep_map ON public.curriculum_exam_product_map FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_lp_map ON public.curriculum_learning_path_map FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_lpn_map ON public.curriculum_learning_path_node_map FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_sk_map ON public.curriculum_skill_map FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_ec_map ON public.curriculum_exam_component_map FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_bp_map ON public.curriculum_blueprint_map FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_bpi_map ON public.curriculum_blueprint_item_map FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_mod_seq ON public.module_sequences FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_mod_prereq ON public.module_prerequisites FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_mod_outcome ON public.module_learning_outcomes FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_les_seq ON public.lesson_sequences FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_les_prereq ON public.lesson_prerequisites FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_les_outcome ON public.lesson_learning_outcomes FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_outcomes ON public.learning_outcomes FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_out_skill ON public.learning_outcome_skill_map FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_out_exam ON public.learning_outcome_exam_component_map FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_out_bp ON public.learning_outcome_blueprint_item_map FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_act_types ON public.activity_types FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_activities ON public.learning_activities FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_act_outcome ON public.learning_activity_outcomes FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_assignments ON public.learning_assignments FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_asg_outcome ON public.learning_assignment_outcomes FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_resources ON public.resource_references FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_les_res ON public.lesson_resources FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_act_res ON public.activity_resources FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_asg_res ON public.assignment_resources FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_locales ON public.curriculum_locales FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_ver_trans ON public.curriculum_version_translations FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_mod_trans ON public.learning_module_translations FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_les_trans ON public.lesson_translations FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_out_trans ON public.learning_outcome_translations FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_act_trans ON public.learning_activity_translations FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_asg_trans ON public.learning_assignment_translations FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_templates ON public.curriculum_templates FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_temp_vers ON public.curriculum_template_versions FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_temp_trans ON public.curriculum_template_translations FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY select_auth_temp_usage ON public.curriculum_template_usage FOR SELECT TO authenticated USING (deleted_at IS NULL);

-- 5. Enable SELECT policies for the curriculum_read schema projections
CREATE POLICY select_summary ON curriculum_read.curriculum_summary_projection FOR SELECT TO authenticated USING (true);
CREATE POLICY select_coverage ON curriculum_read.curriculum_coverage_projection FOR SELECT TO authenticated USING (true);
CREATE POLICY select_readiness ON curriculum_read.curriculum_publication_readiness_projection FOR SELECT TO authenticated USING (true);
CREATE POLICY select_graph ON curriculum_read.curriculum_graph_projection FOR SELECT TO authenticated USING (true);
CREATE POLICY select_tree ON curriculum_read.lesson_tree_projection FOR SELECT TO authenticated USING (true);

-- 6. Add mutative policies for authorized curriculum administrators
CREATE POLICY write_admin_curricula ON public.curricula FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_versions ON public.curriculum_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_locks ON public.curriculum_dependency_locks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_pub_hist ON public.curriculum_publish_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_metadata ON public.curriculum_metadata FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_ep_map ON public.curriculum_exam_product_map FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_lp_map ON public.curriculum_learning_path_map FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_lpn_map ON public.curriculum_learning_path_node_map FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_sk_map ON public.curriculum_skill_map FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_ec_map ON public.curriculum_exam_component_map FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_bp_map ON public.curriculum_blueprint_map FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_bpi_map ON public.curriculum_blueprint_item_map FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_modules ON public.learning_modules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_mod_seq ON public.module_sequences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_mod_prereq ON public.module_prerequisites FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_mod_outcome ON public.module_learning_outcomes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_curriculum_lessons ON public.lessons FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_les_seq ON public.lesson_sequences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_les_prereq ON public.lesson_prerequisites FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_les_outcome ON public.lesson_learning_outcomes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_outcomes ON public.learning_outcomes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_out_skill ON public.learning_outcome_skill_map FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_out_exam ON public.learning_outcome_exam_component_map FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_out_bp ON public.learning_outcome_blueprint_item_map FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_act_types ON public.activity_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_activities ON public.learning_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_act_outcome ON public.learning_activity_outcomes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_assignments ON public.learning_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_asg_outcome ON public.learning_assignment_outcomes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_resources ON public.resource_references FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_les_res ON public.lesson_resources FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_act_res ON public.activity_resources FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_asg_res ON public.assignment_resources FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_locales ON public.curriculum_locales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_ver_trans ON public.curriculum_version_translations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_mod_trans ON public.learning_module_translations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_les_trans ON public.lesson_translations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_out_trans ON public.learning_outcome_translations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_act_trans ON public.learning_activity_translations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_asg_trans ON public.learning_assignment_translations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_templates ON public.curriculum_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_temp_vers ON public.curriculum_template_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_temp_trans ON public.curriculum_template_translations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_admin_temp_usage ON public.curriculum_template_usage FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow full access to projection tables from authenticated users for building/refreshing projections
CREATE POLICY write_summary ON curriculum_read.curriculum_summary_projection FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_coverage ON curriculum_read.curriculum_coverage_projection FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_readiness ON curriculum_read.curriculum_publication_readiness_projection FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_graph ON curriculum_read.curriculum_graph_projection FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY write_tree ON curriculum_read.lesson_tree_projection FOR ALL TO authenticated USING (true) WITH CHECK (true);
