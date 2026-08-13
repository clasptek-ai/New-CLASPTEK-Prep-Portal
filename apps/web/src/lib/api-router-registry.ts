import { apiRouter } from './api-router';
import { GET as get_admin_ai_dashboard } from '@/legacy-api-handlers/v1/admin/ai-dashboard/route';

async function wrapper_get_admin_ai_dashboard(req: any, params: Record<string, string>) {
  return (get_admin_ai_dashboard as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/ai-dashboard', wrapper_get_admin_ai_dashboard);
import { GET as get_admin_analytics } from '@/legacy-api-handlers/v1/admin/analytics/route';

async function wrapper_get_admin_analytics(req: any, params: Record<string, string>) {
  return (get_admin_analytics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/analytics', wrapper_get_admin_analytics);
import { POST as post_admin_assessment_publish } from '@/legacy-api-handlers/v1/admin/assessment/publish/route';

async function wrapper_post_admin_assessment_publish(req: any, params: Record<string, string>) {
  return (post_admin_assessment_publish as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/assessment/publish', wrapper_post_admin_assessment_publish);
import { GET as get_admin_assessment_sessions } from '@/legacy-api-handlers/v1/admin/assessment/sessions/route';

async function wrapper_get_admin_assessment_sessions(req: any, params: Record<string, string>) {
  return (get_admin_assessment_sessions as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/assessment/sessions', wrapper_get_admin_assessment_sessions);
import { GET as get_admin_assessment_statistics } from '@/legacy-api-handlers/v1/admin/assessment/statistics/route';

async function wrapper_get_admin_assessment_statistics(req: any, params: Record<string, string>) {
  return (get_admin_assessment_statistics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/assessment/statistics', wrapper_get_admin_assessment_statistics);
import { POST as post_admin_assessment_unlock_practice } from '@/legacy-api-handlers/v1/admin/assessment/unlock-practice/route';

async function wrapper_post_admin_assessment_unlock_practice(req: any, params: Record<string, string>) {
  return (post_admin_assessment_unlock_practice as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/assessment/unlock-practice', wrapper_post_admin_assessment_unlock_practice);
import { GET as get_admin_assessment_attempts } from '@/legacy-api-handlers/v1/admin/assessment-attempts/route';

async function wrapper_get_admin_assessment_attempts(req: any, params: Record<string, string>) {
  return (get_admin_assessment_attempts as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/assessment-attempts', wrapper_get_admin_assessment_attempts);
import { GET as get_admin_assessment_attempts_id } from '@/legacy-api-handlers/v1/admin/assessment-attempts/[id]/route';

async function wrapper_get_admin_assessment_attempts_id(req: any, params: Record<string, string>) {
  return (get_admin_assessment_attempts_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/assessment-attempts/:id', wrapper_get_admin_assessment_attempts_id);
import { GET as get_admin_assessments } from '@/legacy-api-handlers/v1/admin/assessments/route';

async function wrapper_get_admin_assessments(req: any, params: Record<string, string>) {
  return (get_admin_assessments as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/assessments', wrapper_get_admin_assessments);
import { GET as get_admin_audit } from '@/legacy-api-handlers/v1/admin/audit/route';

async function wrapper_get_admin_audit(req: any, params: Record<string, string>) {
  return (get_admin_audit as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/audit', wrapper_get_admin_audit);
import { POST as post_admin_curricula } from '@/legacy-api-handlers/v1/admin/curricula/route';

async function wrapper_post_admin_curricula(req: any, params: Record<string, string>) {
  return (post_admin_curricula as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/curricula', wrapper_post_admin_curricula);
import { POST as post_admin_curricula_id_approve } from '@/legacy-api-handlers/v1/admin/curricula/[id]/approve/route';

async function wrapper_post_admin_curricula_id_approve(req: any, params: Record<string, string>) {
  return (post_admin_curricula_id_approve as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/curricula/:id/approve', wrapper_post_admin_curricula_id_approve);
import { POST as post_admin_curricula_id_archive } from '@/legacy-api-handlers/v1/admin/curricula/[id]/archive/route';

async function wrapper_post_admin_curricula_id_archive(req: any, params: Record<string, string>) {
  return (post_admin_curricula_id_archive as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/curricula/:id/archive', wrapper_post_admin_curricula_id_archive);
import { POST as post_admin_curricula_id_publish } from '@/legacy-api-handlers/v1/admin/curricula/[id]/publish/route';

async function wrapper_post_admin_curricula_id_publish(req: any, params: Record<string, string>) {
  return (post_admin_curricula_id_publish as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/curricula/:id/publish', wrapper_post_admin_curricula_id_publish);
import { POST as post_admin_curricula_id_restore } from '@/legacy-api-handlers/v1/admin/curricula/[id]/restore/route';

async function wrapper_post_admin_curricula_id_restore(req: any, params: Record<string, string>) {
  return (post_admin_curricula_id_restore as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/curricula/:id/restore', wrapper_post_admin_curricula_id_restore);
import { POST as post_admin_curricula_id_review } from '@/legacy-api-handlers/v1/admin/curricula/[id]/review/route';

async function wrapper_post_admin_curricula_id_review(req: any, params: Record<string, string>) {
  return (post_admin_curricula_id_review as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/curricula/:id/review', wrapper_post_admin_curricula_id_review);
import { PATCH as patch_admin_curricula_id } from '@/legacy-api-handlers/v1/admin/curricula/[id]/route';

async function wrapper_patch_admin_curricula_id(req: any, params: Record<string, string>) {
  return (patch_admin_curricula_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/admin/curricula/:id', wrapper_patch_admin_curricula_id);
import { GET as get_admin_dashboard } from '@/legacy-api-handlers/v1/admin/dashboard/route';

async function wrapper_get_admin_dashboard(req: any, params: Record<string, string>) {
  return (get_admin_dashboard as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/dashboard', wrapper_get_admin_dashboard);
import { GET as get_admin_diagnostic_attempts } from '@/legacy-api-handlers/v1/admin/diagnostic/attempts/route';

async function wrapper_get_admin_diagnostic_attempts(req: any, params: Record<string, string>) {
  return (get_admin_diagnostic_attempts as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/diagnostic/attempts', wrapper_get_admin_diagnostic_attempts);
import { GET as get_admin_diagnostics } from '@/legacy-api-handlers/v1/admin/diagnostics/route';

async function wrapper_get_admin_diagnostics(req: any, params: Record<string, string>) {
  return (get_admin_diagnostics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/diagnostics', wrapper_get_admin_diagnostics);
import { POST as post_admin_diagnostics } from '@/legacy-api-handlers/v1/admin/diagnostics/route';

async function wrapper_post_admin_diagnostics(req: any, params: Record<string, string>) {
  return (post_admin_diagnostics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/diagnostics', wrapper_post_admin_diagnostics);
import { GET as get_admin_diagnostics_id_inventory_check } from '@/legacy-api-handlers/v1/admin/diagnostics/[id]/inventory-check/route';

async function wrapper_get_admin_diagnostics_id_inventory_check(req: any, params: Record<string, string>) {
  return (get_admin_diagnostics_id_inventory_check as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/diagnostics/:id/inventory-check', wrapper_get_admin_diagnostics_id_inventory_check);
import { GET as get_admin_diagnostics_id } from '@/legacy-api-handlers/v1/admin/diagnostics/[id]/route';

async function wrapper_get_admin_diagnostics_id(req: any, params: Record<string, string>) {
  return (get_admin_diagnostics_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/diagnostics/:id', wrapper_get_admin_diagnostics_id);
import { PUT as put_admin_diagnostics_id } from '@/legacy-api-handlers/v1/admin/diagnostics/[id]/route';

async function wrapper_put_admin_diagnostics_id(req: any, params: Record<string, string>) {
  return (put_admin_diagnostics_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.put('/admin/diagnostics/:id', wrapper_put_admin_diagnostics_id);
import { DELETE as delete_admin_diagnostics_id } from '@/legacy-api-handlers/v1/admin/diagnostics/[id]/route';

async function wrapper_delete_admin_diagnostics_id(req: any, params: Record<string, string>) {
  return (delete_admin_diagnostics_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.delete('/admin/diagnostics/:id', wrapper_delete_admin_diagnostics_id);
import { GET as get_admin_evaluations_cost } from '@/legacy-api-handlers/v1/admin/evaluations/cost/route';

async function wrapper_get_admin_evaluations_cost(req: any, params: Record<string, string>) {
  return (get_admin_evaluations_cost as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/evaluations/cost', wrapper_get_admin_evaluations_cost);
import { GET as get_admin_evaluations_dashboard } from '@/legacy-api-handlers/v1/admin/evaluations/dashboard/route';

async function wrapper_get_admin_evaluations_dashboard(req: any, params: Record<string, string>) {
  return (get_admin_evaluations_dashboard as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/evaluations/dashboard', wrapper_get_admin_evaluations_dashboard);
import { POST as post_admin_evaluations_retry } from '@/legacy-api-handlers/v1/admin/evaluations/retry/route';

async function wrapper_post_admin_evaluations_retry(req: any, params: Record<string, string>) {
  return (post_admin_evaluations_retry as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/evaluations/retry', wrapper_post_admin_evaluations_retry);
import { GET as get_admin_evaluations } from '@/legacy-api-handlers/v1/admin/evaluations/route';

async function wrapper_get_admin_evaluations(req: any, params: Record<string, string>) {
  return (get_admin_evaluations as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/evaluations', wrapper_get_admin_evaluations);
import { POST as post_admin_evaluations_id_review } from '@/legacy-api-handlers/v1/admin/evaluations/[id]/review/route';

async function wrapper_post_admin_evaluations_id_review(req: any, params: Record<string, string>) {
  return (post_admin_evaluations_id_review as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/evaluations/:id/review', wrapper_post_admin_evaluations_id_review);
import { POST as post_admin_lessons } from '@/legacy-api-handlers/v1/admin/lessons/route';

async function wrapper_post_admin_lessons(req: any, params: Record<string, string>) {
  return (post_admin_lessons as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/lessons', wrapper_post_admin_lessons);
import { PATCH as patch_admin_lessons_id } from '@/legacy-api-handlers/v1/admin/lessons/[id]/route';

async function wrapper_patch_admin_lessons_id(req: any, params: Record<string, string>) {
  return (patch_admin_lessons_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/admin/lessons/:id', wrapper_patch_admin_lessons_id);
import { GET as get_admin_media } from '@/legacy-api-handlers/v1/admin/media/route';

async function wrapper_get_admin_media(req: any, params: Record<string, string>) {
  return (get_admin_media as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/media', wrapper_get_admin_media);
import { GET as get_admin_mock_active_sessions } from '@/legacy-api-handlers/v1/admin/mock/active-sessions/route';

async function wrapper_get_admin_mock_active_sessions(req: any, params: Record<string, string>) {
  return (get_admin_mock_active_sessions as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/mock/active-sessions', wrapper_get_admin_mock_active_sessions);
import { GET as get_admin_mock_blueprints } from '@/legacy-api-handlers/v1/admin/mock/blueprints/route';

async function wrapper_get_admin_mock_blueprints(req: any, params: Record<string, string>) {
  return (get_admin_mock_blueprints as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/mock/blueprints', wrapper_get_admin_mock_blueprints);
import { POST as post_admin_mock_blueprints } from '@/legacy-api-handlers/v1/admin/mock/blueprints/route';

async function wrapper_post_admin_mock_blueprints(req: any, params: Record<string, string>) {
  return (post_admin_mock_blueprints as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/mock/blueprints', wrapper_post_admin_mock_blueprints);
import { POST as post_admin_mock_generate } from '@/legacy-api-handlers/v1/admin/mock/generate/route';

async function wrapper_post_admin_mock_generate(req: any, params: Record<string, string>) {
  return (post_admin_mock_generate as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/mock/generate', wrapper_post_admin_mock_generate);
import { GET as get_admin_mock_integrity_logs } from '@/legacy-api-handlers/v1/admin/mock/integrity-logs/route';

async function wrapper_get_admin_mock_integrity_logs(req: any, params: Record<string, string>) {
  return (get_admin_mock_integrity_logs as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/mock/integrity-logs', wrapper_get_admin_mock_integrity_logs);
import { GET as get_admin_mock_sessions } from '@/legacy-api-handlers/v1/admin/mock/sessions/route';

async function wrapper_get_admin_mock_sessions(req: any, params: Record<string, string>) {
  return (get_admin_mock_sessions as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/mock/sessions', wrapper_get_admin_mock_sessions);
import { GET as get_admin_mock_templates } from '@/legacy-api-handlers/v1/admin/mock/templates/route';

async function wrapper_get_admin_mock_templates(req: any, params: Record<string, string>) {
  return (get_admin_mock_templates as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/mock/templates', wrapper_get_admin_mock_templates);
import { POST as post_admin_mock_unlock } from '@/legacy-api-handlers/v1/admin/mock/unlock/route';

async function wrapper_post_admin_mock_unlock(req: any, params: Record<string, string>) {
  return (post_admin_mock_unlock as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/mock/unlock', wrapper_post_admin_mock_unlock);
import { POST as post_admin_mock_unlock_attempt } from '@/legacy-api-handlers/v1/admin/mock/unlock-attempt/route';

async function wrapper_post_admin_mock_unlock_attempt(req: any, params: Record<string, string>) {
  return (post_admin_mock_unlock_attempt as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/mock/unlock-attempt', wrapper_post_admin_mock_unlock_attempt);
import { GET as get_admin_observability_analytics } from '@/legacy-api-handlers/v1/admin/observability/analytics/route';

async function wrapper_get_admin_observability_analytics(req: any, params: Record<string, string>) {
  return (get_admin_observability_analytics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/observability/analytics', wrapper_get_admin_observability_analytics);
import { GET as get_admin_observability_metrics } from '@/legacy-api-handlers/v1/admin/observability/metrics/route';

async function wrapper_get_admin_observability_metrics(req: any, params: Record<string, string>) {
  return (get_admin_observability_metrics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/observability/metrics', wrapper_get_admin_observability_metrics);
import { GET as get_admin_passages } from '@/legacy-api-handlers/v1/admin/passages/route';

async function wrapper_get_admin_passages(req: any, params: Record<string, string>) {
  return (get_admin_passages as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/passages', wrapper_get_admin_passages);
import { GET as get_admin_practice_attempts } from '@/legacy-api-handlers/v1/admin/practice/attempts/route';

async function wrapper_get_admin_practice_attempts(req: any, params: Record<string, string>) {
  return (get_admin_practice_attempts as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/practice/attempts', wrapper_get_admin_practice_attempts);
import { POST as post_admin_practice_bulk_unlock } from '@/legacy-api-handlers/v1/admin/practice/bulk-unlock/route';

async function wrapper_post_admin_practice_bulk_unlock(req: any, params: Record<string, string>) {
  return (post_admin_practice_bulk_unlock as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/practice/bulk-unlock', wrapper_post_admin_practice_bulk_unlock);
import { POST as post_admin_practice_reset } from '@/legacy-api-handlers/v1/admin/practice/reset/route';

async function wrapper_post_admin_practice_reset(req: any, params: Record<string, string>) {
  return (post_admin_practice_reset as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/practice/reset', wrapper_post_admin_practice_reset);
import { GET as get_admin_practice_sessions } from '@/legacy-api-handlers/v1/admin/practice/sessions/route';

async function wrapper_get_admin_practice_sessions(req: any, params: Record<string, string>) {
  return (get_admin_practice_sessions as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/practice/sessions', wrapper_get_admin_practice_sessions);
import { GET as get_admin_practice_statistics } from '@/legacy-api-handlers/v1/admin/practice/statistics/route';

async function wrapper_get_admin_practice_statistics(req: any, params: Record<string, string>) {
  return (get_admin_practice_statistics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/practice/statistics', wrapper_get_admin_practice_statistics);
import { GET as get_admin_practice_students } from '@/legacy-api-handlers/v1/admin/practice/students/route';

async function wrapper_get_admin_practice_students(req: any, params: Record<string, string>) {
  return (get_admin_practice_students as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/practice/students', wrapper_get_admin_practice_students);
import { POST as post_admin_practice_unlock } from '@/legacy-api-handlers/v1/admin/practice/unlock/route';

async function wrapper_post_admin_practice_unlock(req: any, params: Record<string, string>) {
  return (post_admin_practice_unlock as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/practice/unlock', wrapper_post_admin_practice_unlock);
import { GET as get_admin_programmes } from '@/legacy-api-handlers/v1/admin/programmes/route';

async function wrapper_get_admin_programmes(req: any, params: Record<string, string>) {
  return (get_admin_programmes as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/programmes', wrapper_get_admin_programmes);
import { GET as get_admin_programmes_programmeId_modules } from '@/legacy-api-handlers/v1/admin/programmes/[programmeId]/modules/route';

async function wrapper_get_admin_programmes_programmeId_modules(req: any, params: Record<string, string>) {
  return (get_admin_programmes_programmeId_modules as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/programmes/:programmeId/modules', wrapper_get_admin_programmes_programmeId_modules);
import { GET as get_admin_prompts } from '@/legacy-api-handlers/v1/admin/prompts/route';

async function wrapper_get_admin_prompts(req: any, params: Record<string, string>) {
  return (get_admin_prompts as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/prompts', wrapper_get_admin_prompts);
import { POST as post_admin_prompts } from '@/legacy-api-handlers/v1/admin/prompts/route';

async function wrapper_post_admin_prompts(req: any, params: Record<string, string>) {
  return (post_admin_prompts as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/prompts', wrapper_post_admin_prompts);
import { POST as post_admin_question_bank_import } from '@/legacy-api-handlers/v1/admin/question-bank/import/route';

async function wrapper_post_admin_question_bank_import(req: any, params: Record<string, string>) {
  return (post_admin_question_bank_import as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/question-bank/import', wrapper_post_admin_question_bank_import);
import { POST as post_admin_questions_bulk } from '@/legacy-api-handlers/v1/admin/questions/bulk/route';

async function wrapper_post_admin_questions_bulk(req: any, params: Record<string, string>) {
  return (post_admin_questions_bulk as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/questions/bulk', wrapper_post_admin_questions_bulk);
import { POST as post_admin_questions_bulk_import } from '@/legacy-api-handlers/v1/admin/questions/bulk-import/route';

async function wrapper_post_admin_questions_bulk_import(req: any, params: Record<string, string>) {
  return (post_admin_questions_bulk_import as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/questions/bulk-import', wrapper_post_admin_questions_bulk_import);
import { GET as get_admin_questions_export } from '@/legacy-api-handlers/v1/admin/questions/export/route';

async function wrapper_get_admin_questions_export(req: any, params: Record<string, string>) {
  return (get_admin_questions_export as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/questions/export', wrapper_get_admin_questions_export);
import { POST as post_admin_questions_import_commit } from '@/legacy-api-handlers/v1/admin/questions/import/commit/route';

async function wrapper_post_admin_questions_import_commit(req: any, params: Record<string, string>) {
  return (post_admin_questions_import_commit as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/questions/import/commit', wrapper_post_admin_questions_import_commit);
import { GET as get_admin_questions_import_history } from '@/legacy-api-handlers/v1/admin/questions/import/history/route';

async function wrapper_get_admin_questions_import_history(req: any, params: Record<string, string>) {
  return (get_admin_questions_import_history as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/questions/import/history', wrapper_get_admin_questions_import_history);
import { POST as post_admin_questions_import_rollback } from '@/legacy-api-handlers/v1/admin/questions/import/rollback/route';

async function wrapper_post_admin_questions_import_rollback(req: any, params: Record<string, string>) {
  return (post_admin_questions_import_rollback as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/questions/import/rollback', wrapper_post_admin_questions_import_rollback);
import { POST as post_admin_questions_import } from '@/legacy-api-handlers/v1/admin/questions/import/route';

async function wrapper_post_admin_questions_import(req: any, params: Record<string, string>) {
  return (post_admin_questions_import as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/questions/import', wrapper_post_admin_questions_import);
import { POST as post_admin_questions_import_validate } from '@/legacy-api-handlers/v1/admin/questions/import/validate/route';

async function wrapper_post_admin_questions_import_validate(req: any, params: Record<string, string>) {
  return (post_admin_questions_import_validate as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/questions/import/validate', wrapper_post_admin_questions_import_validate);
import { GET as get_admin_questions } from '@/legacy-api-handlers/v1/admin/questions/route';

async function wrapper_get_admin_questions(req: any, params: Record<string, string>) {
  return (get_admin_questions as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/questions', wrapper_get_admin_questions);
import { POST as post_admin_questions } from '@/legacy-api-handlers/v1/admin/questions/route';

async function wrapper_post_admin_questions(req: any, params: Record<string, string>) {
  return (post_admin_questions as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/questions', wrapper_post_admin_questions);
import { POST as post_admin_questions_id_archive } from '@/legacy-api-handlers/v1/admin/questions/[id]/archive/route';

async function wrapper_post_admin_questions_id_archive(req: any, params: Record<string, string>) {
  return (post_admin_questions_id_archive as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/questions/:id/archive', wrapper_post_admin_questions_id_archive);
import { POST as post_admin_questions_id_create_version } from '@/legacy-api-handlers/v1/admin/questions/[id]/create-version/route';

async function wrapper_post_admin_questions_id_create_version(req: any, params: Record<string, string>) {
  return (post_admin_questions_id_create_version as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/questions/:id/create-version', wrapper_post_admin_questions_id_create_version);
import { POST as post_admin_questions_id_publish } from '@/legacy-api-handlers/v1/admin/questions/[id]/publish/route';

async function wrapper_post_admin_questions_id_publish(req: any, params: Record<string, string>) {
  return (post_admin_questions_id_publish as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/questions/:id/publish', wrapper_post_admin_questions_id_publish);
import { POST as post_admin_questions_id_restore } from '@/legacy-api-handlers/v1/admin/questions/[id]/restore/route';

async function wrapper_post_admin_questions_id_restore(req: any, params: Record<string, string>) {
  return (post_admin_questions_id_restore as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/questions/:id/restore', wrapper_post_admin_questions_id_restore);
import { PATCH as patch_admin_questions_id } from '@/legacy-api-handlers/v1/admin/questions/[id]/route';

async function wrapper_patch_admin_questions_id(req: any, params: Record<string, string>) {
  return (patch_admin_questions_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/admin/questions/:id', wrapper_patch_admin_questions_id);
import { POST as post_admin_questions_id_upload_media } from '@/legacy-api-handlers/v1/admin/questions/[id]/upload-media/route';

async function wrapper_post_admin_questions_id_upload_media(req: any, params: Record<string, string>) {
  return (post_admin_questions_id_upload_media as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/questions/:id/upload-media', wrapper_post_admin_questions_id_upload_media);
import { GET as get_admin_reports } from '@/legacy-api-handlers/v1/admin/reports/route';

async function wrapper_get_admin_reports(req: any, params: Record<string, string>) {
  return (get_admin_reports as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/reports', wrapper_get_admin_reports);
import { GET as get_admin_resources } from '@/legacy-api-handlers/v1/admin/resources/route';

async function wrapper_get_admin_resources(req: any, params: Record<string, string>) {
  return (get_admin_resources as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/resources', wrapper_get_admin_resources);
import { POST as post_admin_resources } from '@/legacy-api-handlers/v1/admin/resources/route';

async function wrapper_post_admin_resources(req: any, params: Record<string, string>) {
  return (post_admin_resources as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/resources', wrapper_post_admin_resources);
import { POST as post_admin_resources_id_archive } from '@/legacy-api-handlers/v1/admin/resources/[id]/archive/route';

async function wrapper_post_admin_resources_id_archive(req: any, params: Record<string, string>) {
  return (post_admin_resources_id_archive as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/resources/:id/archive', wrapper_post_admin_resources_id_archive);
import { POST as post_admin_resources_id_publish } from '@/legacy-api-handlers/v1/admin/resources/[id]/publish/route';

async function wrapper_post_admin_resources_id_publish(req: any, params: Record<string, string>) {
  return (post_admin_resources_id_publish as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/resources/:id/publish', wrapper_post_admin_resources_id_publish);
import { POST as post_admin_resources_id_restore } from '@/legacy-api-handlers/v1/admin/resources/[id]/restore/route';

async function wrapper_post_admin_resources_id_restore(req: any, params: Record<string, string>) {
  return (post_admin_resources_id_restore as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/resources/:id/restore', wrapper_post_admin_resources_id_restore);
import { PATCH as patch_admin_resources_id } from '@/legacy-api-handlers/v1/admin/resources/[id]/route';

async function wrapper_patch_admin_resources_id(req: any, params: Record<string, string>) {
  return (patch_admin_resources_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/admin/resources/:id', wrapper_patch_admin_resources_id);
import { POST as post_admin_resources_id_upload } from '@/legacy-api-handlers/v1/admin/resources/[id]/upload/route';

async function wrapper_post_admin_resources_id_upload(req: any, params: Record<string, string>) {
  return (post_admin_resources_id_upload as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/resources/:id/upload', wrapper_post_admin_resources_id_upload);
import { GET as get_admin_rubrics } from '@/legacy-api-handlers/v1/admin/rubrics/route';

async function wrapper_get_admin_rubrics(req: any, params: Record<string, string>) {
  return (get_admin_rubrics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/rubrics', wrapper_get_admin_rubrics);
import { POST as post_admin_rubrics } from '@/legacy-api-handlers/v1/admin/rubrics/route';

async function wrapper_post_admin_rubrics(req: any, params: Record<string, string>) {
  return (post_admin_rubrics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/rubrics', wrapper_post_admin_rubrics);
import { GET as get_admin_settings } from '@/legacy-api-handlers/v1/admin/settings/route';

async function wrapper_get_admin_settings(req: any, params: Record<string, string>) {
  return (get_admin_settings as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/settings', wrapper_get_admin_settings);
import { PATCH as patch_admin_settings } from '@/legacy-api-handlers/v1/admin/settings/route';

async function wrapper_patch_admin_settings(req: any, params: Record<string, string>) {
  return (patch_admin_settings as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/admin/settings', wrapper_patch_admin_settings);
import { GET as get_admin_students_studentId_assessment_history } from '@/legacy-api-handlers/v1/admin/students/[studentId]/assessment-history/route';

async function wrapper_get_admin_students_studentId_assessment_history(req: any, params: Record<string, string>) {
  return (get_admin_students_studentId_assessment_history as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/students/:studentId/assessment-history', wrapper_get_admin_students_studentId_assessment_history);
import { GET as get_admin_users } from '@/legacy-api-handlers/v1/admin/users/route';

async function wrapper_get_admin_users(req: any, params: Record<string, string>) {
  return (get_admin_users as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/admin/users', wrapper_get_admin_users);
import { POST as post_admin_users } from '@/legacy-api-handlers/v1/admin/users/route';

async function wrapper_post_admin_users(req: any, params: Record<string, string>) {
  return (post_admin_users as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/users', wrapper_post_admin_users);
import { PATCH as patch_admin_users } from '@/legacy-api-handlers/v1/admin/users/route';

async function wrapper_patch_admin_users(req: any, params: Record<string, string>) {
  return (patch_admin_users as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/admin/users', wrapper_patch_admin_users);
import { POST as post_admin_users_id_logout } from '@/legacy-api-handlers/v1/admin/users/[id]/logout/route';

async function wrapper_post_admin_users_id_logout(req: any, params: Record<string, string>) {
  return (post_admin_users_id_logout as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/users/:id/logout', wrapper_post_admin_users_id_logout);
import { PATCH as patch_admin_users_id_mock_gate } from '@/legacy-api-handlers/v1/admin/users/[id]/mock-gate/route';

async function wrapper_patch_admin_users_id_mock_gate(req: any, params: Record<string, string>) {
  return (patch_admin_users_id_mock_gate as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/admin/users/:id/mock-gate', wrapper_patch_admin_users_id_mock_gate);
import { PATCH as patch_admin_users_id_practice_gate } from '@/legacy-api-handlers/v1/admin/users/[id]/practice-gate/route';

async function wrapper_patch_admin_users_id_practice_gate(req: any, params: Record<string, string>) {
  return (patch_admin_users_id_practice_gate as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/admin/users/:id/practice-gate', wrapper_patch_admin_users_id_practice_gate);
import { POST as post_admin_users_id_resend_verification } from '@/legacy-api-handlers/v1/admin/users/[id]/resend-verification/route';

async function wrapper_post_admin_users_id_resend_verification(req: any, params: Record<string, string>) {
  return (post_admin_users_id_resend_verification as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/users/:id/resend-verification', wrapper_post_admin_users_id_resend_verification);
import { POST as post_admin_users_id_reset_password } from '@/legacy-api-handlers/v1/admin/users/[id]/reset-password/route';

async function wrapper_post_admin_users_id_reset_password(req: any, params: Record<string, string>) {
  return (post_admin_users_id_reset_password as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/users/:id/reset-password', wrapper_post_admin_users_id_reset_password);
import { POST as post_admin_users_id_restore } from '@/legacy-api-handlers/v1/admin/users/[id]/restore/route';

async function wrapper_post_admin_users_id_restore(req: any, params: Record<string, string>) {
  return (post_admin_users_id_restore as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/users/:id/restore', wrapper_post_admin_users_id_restore);
import { DELETE as delete_admin_users_id } from '@/legacy-api-handlers/v1/admin/users/[id]/route';

async function wrapper_delete_admin_users_id(req: any, params: Record<string, string>) {
  return (delete_admin_users_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.delete('/admin/users/:id', wrapper_delete_admin_users_id);
import { PATCH as patch_admin_users_id_status } from '@/legacy-api-handlers/v1/admin/users/[id]/status/route';

async function wrapper_patch_admin_users_id_status(req: any, params: Record<string, string>) {
  return (patch_admin_users_id_status as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/admin/users/:id/status', wrapper_patch_admin_users_id_status);
import { POST as post_admin_users_id_unlock_account } from '@/legacy-api-handlers/v1/admin/users/[id]/unlock-account/route';

async function wrapper_post_admin_users_id_unlock_account(req: any, params: Record<string, string>) {
  return (post_admin_users_id_unlock_account as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/admin/users/:id/unlock-account', wrapper_post_admin_users_id_unlock_account);
import { GET as get_ai_benchmark_history } from '@/legacy-api-handlers/v1/ai/benchmark/history/route';

async function wrapper_get_ai_benchmark_history(req: any, params: Record<string, string>) {
  return (get_ai_benchmark_history as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/ai/benchmark/history', wrapper_get_ai_benchmark_history);
import { GET as get_ai_benchmark_regressions } from '@/legacy-api-handlers/v1/ai/benchmark/regressions/route';

async function wrapper_get_ai_benchmark_regressions(req: any, params: Record<string, string>) {
  return (get_ai_benchmark_regressions as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/ai/benchmark/regressions', wrapper_get_ai_benchmark_regressions);
import { GET as get_ai_benchmark_results } from '@/legacy-api-handlers/v1/ai/benchmark/results/route';

async function wrapper_get_ai_benchmark_results(req: any, params: Record<string, string>) {
  return (get_ai_benchmark_results as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/ai/benchmark/results', wrapper_get_ai_benchmark_results);
import { POST as post_ai_benchmark_run } from '@/legacy-api-handlers/v1/ai/benchmark/run/route';

async function wrapper_post_ai_benchmark_run(req: any, params: Record<string, string>) {
  return (post_ai_benchmark_run as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/ai/benchmark/run', wrapper_post_ai_benchmark_run);
import { POST as post_ai_chat } from '@/legacy-api-handlers/v1/ai/chat/route';

async function wrapper_post_ai_chat(req: any, params: Record<string, string>) {
  return (post_ai_chat as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/ai/chat', wrapper_post_ai_chat);
import { GET as get_ai_deployment_decision } from '@/legacy-api-handlers/v1/ai/deployment/decision/route';

async function wrapper_get_ai_deployment_decision(req: any, params: Record<string, string>) {
  return (get_ai_deployment_decision as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/ai/deployment/decision', wrapper_get_ai_deployment_decision);
import { GET as get_ai_evaluations } from '@/legacy-api-handlers/v1/ai/evaluations/route';

async function wrapper_get_ai_evaluations(req: any, params: Record<string, string>) {
  return (get_ai_evaluations as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/ai/evaluations', wrapper_get_ai_evaluations);
import { PATCH as patch_ai_evaluations_id_approve } from '@/legacy-api-handlers/v1/ai/evaluations/[id]/approve/route';

async function wrapper_patch_ai_evaluations_id_approve(req: any, params: Record<string, string>) {
  return (patch_ai_evaluations_id_approve as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/ai/evaluations/:id/approve', wrapper_patch_ai_evaluations_id_approve);
import { PATCH as patch_ai_evaluations_id_override } from '@/legacy-api-handlers/v1/ai/evaluations/[id]/override/route';

async function wrapper_patch_ai_evaluations_id_override(req: any, params: Record<string, string>) {
  return (patch_ai_evaluations_id_override as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/ai/evaluations/:id/override', wrapper_patch_ai_evaluations_id_override);
import { GET as get_ai_evaluations_id } from '@/legacy-api-handlers/v1/ai/evaluations/[id]/route';

async function wrapper_get_ai_evaluations_id(req: any, params: Record<string, string>) {
  return (get_ai_evaluations_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/ai/evaluations/:id', wrapper_get_ai_evaluations_id);
import { POST as post_ai_feedback } from '@/legacy-api-handlers/v1/ai/feedback/route';

async function wrapper_post_ai_feedback(req: any, params: Record<string, string>) {
  return (post_ai_feedback as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/ai/feedback', wrapper_post_ai_feedback);
import { GET as get_ai_history } from '@/legacy-api-handlers/v1/ai/history/route';

async function wrapper_get_ai_history(req: any, params: Record<string, string>) {
  return (get_ai_history as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/ai/history', wrapper_get_ai_history);
import { POST as post_ai_prompt_compare } from '@/legacy-api-handlers/v1/ai/prompt/compare/route';

async function wrapper_post_ai_prompt_compare(req: any, params: Record<string, string>) {
  return (post_ai_prompt_compare as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/ai/prompt/compare', wrapper_post_ai_prompt_compare);
import { GET as get_ai_prompt_history } from '@/legacy-api-handlers/v1/ai/prompt/history/route';

async function wrapper_get_ai_prompt_history(req: any, params: Record<string, string>) {
  return (get_ai_prompt_history as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/ai/prompt/history', wrapper_get_ai_prompt_history);
import { GET as get_ai_prompt_performance } from '@/legacy-api-handlers/v1/ai/prompt/performance/route';

async function wrapper_get_ai_prompt_performance(req: any, params: Record<string, string>) {
  return (get_ai_prompt_performance as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/ai/prompt/performance', wrapper_get_ai_prompt_performance);
import { POST as post_ai_prompt_register } from '@/legacy-api-handlers/v1/ai/prompt/register/route';

async function wrapper_post_ai_prompt_register(req: any, params: Record<string, string>) {
  return (post_ai_prompt_register as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/ai/prompt/register', wrapper_post_ai_prompt_register);
import { POST as post_ai_speaking_evaluate } from '@/legacy-api-handlers/v1/ai/speaking/evaluate/route';

async function wrapper_post_ai_speaking_evaluate(req: any, params: Record<string, string>) {
  return (post_ai_speaking_evaluate as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/ai/speaking/evaluate', wrapper_post_ai_speaking_evaluate);
import { POST as post_ai_writing_evaluate } from '@/legacy-api-handlers/v1/ai/writing/evaluate/route';

async function wrapper_post_ai_writing_evaluate(req: any, params: Record<string, string>) {
  return (post_ai_writing_evaluate as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/ai/writing/evaluate', wrapper_post_ai_writing_evaluate);
import { GET as get_analytics_admin } from '@/legacy-api-handlers/v1/analytics/admin/route';

async function wrapper_get_analytics_admin(req: any, params: Record<string, string>) {
  return (get_analytics_admin as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/admin', wrapper_get_analytics_admin);
import { GET as get_analytics_benchmarks } from '@/legacy-api-handlers/v1/analytics/benchmarks/route';

async function wrapper_get_analytics_benchmarks(req: any, params: Record<string, string>) {
  return (get_analytics_benchmarks as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/benchmarks', wrapper_get_analytics_benchmarks);
import { GET as get_analytics_catalog } from '@/legacy-api-handlers/v1/analytics/catalog/route';

async function wrapper_get_analytics_catalog(req: any, params: Record<string, string>) {
  return (get_analytics_catalog as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/catalog', wrapper_get_analytics_catalog);
import { GET as get_analytics_coach } from '@/legacy-api-handlers/v1/analytics/coach/route';

async function wrapper_get_analytics_coach(req: any, params: Record<string, string>) {
  return (get_analytics_coach as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/coach', wrapper_get_analytics_coach);
import { GET as get_analytics_cohorts } from '@/legacy-api-handlers/v1/analytics/cohorts/route';

async function wrapper_get_analytics_cohorts(req: any, params: Record<string, string>) {
  return (get_analytics_cohorts as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/cohorts', wrapper_get_analytics_cohorts);
import { GET as get_analytics_competencies } from '@/legacy-api-handlers/v1/analytics/competencies/route';

async function wrapper_get_analytics_competencies(req: any, params: Record<string, string>) {
  return (get_analytics_competencies as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/competencies', wrapper_get_analytics_competencies);
import { GET as get_analytics_dashboard } from '@/legacy-api-handlers/v1/analytics/dashboard/route';

async function wrapper_get_analytics_dashboard(req: any, params: Record<string, string>) {
  return (get_analytics_dashboard as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/dashboard', wrapper_get_analytics_dashboard);
import { GET as get_analytics_data_quality } from '@/legacy-api-handlers/v1/analytics/data-quality/route';

async function wrapper_get_analytics_data_quality(req: any, params: Record<string, string>) {
  return (get_analytics_data_quality as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/data-quality', wrapper_get_analytics_data_quality);
import { GET as get_analytics_evaluations } from '@/legacy-api-handlers/v1/analytics/evaluations/route';

async function wrapper_get_analytics_evaluations(req: any, params: Record<string, string>) {
  return (get_analytics_evaluations as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/evaluations', wrapper_get_analytics_evaluations);
import { GET as get_analytics_executive } from '@/legacy-api-handlers/v1/analytics/executive/route';

async function wrapper_get_analytics_executive(req: any, params: Record<string, string>) {
  return (get_analytics_executive as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/executive', wrapper_get_analytics_executive);
import { GET as get_analytics_export_jobs } from '@/legacy-api-handlers/v1/analytics/export/jobs/route';

async function wrapper_get_analytics_export_jobs(req: any, params: Record<string, string>) {
  return (get_analytics_export_jobs as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/export/jobs', wrapper_get_analytics_export_jobs);
import { POST as post_analytics_export_research } from '@/legacy-api-handlers/v1/analytics/export/research/route';

async function wrapper_post_analytics_export_research(req: any, params: Record<string, string>) {
  return (post_analytics_export_research as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/analytics/export/research', wrapper_post_analytics_export_research);
import { GET as get_analytics_exports } from '@/legacy-api-handlers/v1/analytics/exports/route';

async function wrapper_get_analytics_exports(req: any, params: Record<string, string>) {
  return (get_analytics_exports as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/exports', wrapper_get_analytics_exports);
import { POST as post_analytics_exports } from '@/legacy-api-handlers/v1/analytics/exports/route';

async function wrapper_post_analytics_exports(req: any, params: Record<string, string>) {
  return (post_analytics_exports as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/analytics/exports', wrapper_post_analytics_exports);
import { GET as get_analytics_instructor } from '@/legacy-api-handlers/v1/analytics/instructor/route';

async function wrapper_get_analytics_instructor(req: any, params: Record<string, string>) {
  return (get_analytics_instructor as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/instructor', wrapper_get_analytics_instructor);
import { GET as get_analytics_metrics } from '@/legacy-api-handlers/v1/analytics/metrics/route';

async function wrapper_get_analytics_metrics(req: any, params: Record<string, string>) {
  return (get_analytics_metrics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/metrics', wrapper_get_analytics_metrics);
import { GET as get_analytics_platform } from '@/legacy-api-handlers/v1/analytics/platform/route';

async function wrapper_get_analytics_platform(req: any, params: Record<string, string>) {
  return (get_analytics_platform as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/platform', wrapper_get_analytics_platform);
import { GET as get_analytics_practice } from '@/legacy-api-handlers/v1/analytics/practice/route';

async function wrapper_get_analytics_practice(req: any, params: Record<string, string>) {
  return (get_analytics_practice as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/practice', wrapper_get_analytics_practice);
import { GET as get_analytics_predictions } from '@/legacy-api-handlers/v1/analytics/predictions/route';

async function wrapper_get_analytics_predictions(req: any, params: Record<string, string>) {
  return (get_analytics_predictions as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/predictions', wrapper_get_analytics_predictions);
import { POST as post_analytics_refresh } from '@/legacy-api-handlers/v1/analytics/refresh/route';

async function wrapper_post_analytics_refresh(req: any, params: Record<string, string>) {
  return (post_analytics_refresh as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/analytics/refresh', wrapper_post_analytics_refresh);
import { GET as get_analytics_reports } from '@/legacy-api-handlers/v1/analytics/reports/route';

async function wrapper_get_analytics_reports(req: any, params: Record<string, string>) {
  return (get_analytics_reports as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/reports', wrapper_get_analytics_reports);
import { POST as post_analytics_reports } from '@/legacy-api-handlers/v1/analytics/reports/route';

async function wrapper_post_analytics_reports(req: any, params: Record<string, string>) {
  return (post_analytics_reports as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/analytics/reports', wrapper_post_analytics_reports);
import { GET as get_analytics_student } from '@/legacy-api-handlers/v1/analytics/student/route';

async function wrapper_get_analytics_student(req: any, params: Record<string, string>) {
  return (get_analytics_student as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/student', wrapper_get_analytics_student);
import { GET as get_analytics_trends } from '@/legacy-api-handlers/v1/analytics/trends/route';

async function wrapper_get_analytics_trends(req: any, params: Record<string, string>) {
  return (get_analytics_trends as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/trends', wrapper_get_analytics_trends);
import { GET as get_analytics_warehouse } from '@/legacy-api-handlers/v1/analytics/warehouse/route';

async function wrapper_get_analytics_warehouse(req: any, params: Record<string, string>) {
  return (get_analytics_warehouse as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/analytics/warehouse', wrapper_get_analytics_warehouse);
import { POST as post_analytics_warehouse } from '@/legacy-api-handlers/v1/analytics/warehouse/route';

async function wrapper_post_analytics_warehouse(req: any, params: Record<string, string>) {
  return (post_analytics_warehouse as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/analytics/warehouse', wrapper_post_analytics_warehouse);
import { GET as get_announcements } from '@/legacy-api-handlers/v1/announcements/route';

async function wrapper_get_announcements(req: any, params: Record<string, string>) {
  return (get_announcements as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/announcements', wrapper_get_announcements);
import { POST as post_assessment_answer } from '@/legacy-api-handlers/v1/assessment/answer/route';

async function wrapper_post_assessment_answer(req: any, params: Record<string, string>) {
  return (post_assessment_answer as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/assessment/answer', wrapper_post_assessment_answer);
import { GET as get_assessment_current } from '@/legacy-api-handlers/v1/assessment/current/route';

async function wrapper_get_assessment_current(req: any, params: Record<string, string>) {
  return (get_assessment_current as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/assessment/current', wrapper_get_assessment_current);
import { GET as get_assessment_history } from '@/legacy-api-handlers/v1/assessment/history/route';

async function wrapper_get_assessment_history(req: any, params: Record<string, string>) {
  return (get_assessment_history as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/assessment/history', wrapper_get_assessment_history);
import { GET as get_assessment_result } from '@/legacy-api-handlers/v1/assessment/result/route';

async function wrapper_get_assessment_result(req: any, params: Record<string, string>) {
  return (get_assessment_result as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/assessment/result', wrapper_get_assessment_result);
import { POST as post_assessment_resume } from '@/legacy-api-handlers/v1/assessment/resume/route';

async function wrapper_post_assessment_resume(req: any, params: Record<string, string>) {
  return (post_assessment_resume as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/assessment/resume', wrapper_post_assessment_resume);
import { POST as post_assessment_save } from '@/legacy-api-handlers/v1/assessment/save/route';

async function wrapper_post_assessment_save(req: any, params: Record<string, string>) {
  return (post_assessment_save as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/assessment/save', wrapper_post_assessment_save);
import { POST as post_assessment_start } from '@/legacy-api-handlers/v1/assessment/start/route';

async function wrapper_post_assessment_start(req: any, params: Record<string, string>) {
  return (post_assessment_start as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/assessment/start', wrapper_post_assessment_start);
import { GET as get_assessment_status } from '@/legacy-api-handlers/v1/assessment/status/route';

async function wrapper_get_assessment_status(req: any, params: Record<string, string>) {
  return (get_assessment_status as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/assessment/status', wrapper_get_assessment_status);
import { POST as post_assessment_submit } from '@/legacy-api-handlers/v1/assessment/submit/route';

async function wrapper_post_assessment_submit(req: any, params: Record<string, string>) {
  return (post_assessment_submit as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/assessment/submit', wrapper_post_assessment_submit);
import { GET as get_assessment_attempts } from '@/legacy-api-handlers/v1/assessment-attempts/route';

async function wrapper_get_assessment_attempts(req: any, params: Record<string, string>) {
  return (get_assessment_attempts as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/assessment-attempts', wrapper_get_assessment_attempts);
import { POST as post_assessment_attempts } from '@/legacy-api-handlers/v1/assessment-attempts/route';

async function wrapper_post_assessment_attempts(req: any, params: Record<string, string>) {
  return (post_assessment_attempts as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/assessment-attempts', wrapper_post_assessment_attempts);
import { PATCH as patch_assessment_attempts_id_answers } from '@/legacy-api-handlers/v1/assessment-attempts/[id]/answers/route';

async function wrapper_patch_assessment_attempts_id_answers(req: any, params: Record<string, string>) {
  return (patch_assessment_attempts_id_answers as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/assessment-attempts/:id/answers', wrapper_patch_assessment_attempts_id_answers);
import { GET as get_assessment_attempts_id_questions } from '@/legacy-api-handlers/v1/assessment-attempts/[id]/questions/route';

async function wrapper_get_assessment_attempts_id_questions(req: any, params: Record<string, string>) {
  return (get_assessment_attempts_id_questions as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/assessment-attempts/:id/questions', wrapper_get_assessment_attempts_id_questions);
import { GET as get_assessment_attempts_id_result } from '@/legacy-api-handlers/v1/assessment-attempts/[id]/result/route';

async function wrapper_get_assessment_attempts_id_result(req: any, params: Record<string, string>) {
  return (get_assessment_attempts_id_result as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/assessment-attempts/:id/result', wrapper_get_assessment_attempts_id_result);
import { GET as get_assessment_attempts_id } from '@/legacy-api-handlers/v1/assessment-attempts/[id]/route';

async function wrapper_get_assessment_attempts_id(req: any, params: Record<string, string>) {
  return (get_assessment_attempts_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/assessment-attempts/:id', wrapper_get_assessment_attempts_id);
import { POST as post_assessment_attempts_id_submit } from '@/legacy-api-handlers/v1/assessment-attempts/[id]/submit/route';

async function wrapper_post_assessment_attempts_id_submit(req: any, params: Record<string, string>) {
  return (post_assessment_attempts_id_submit as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/assessment-attempts/:id/submit', wrapper_post_assessment_attempts_id_submit);
import { POST as post_assessments_archive } from '@/legacy-api-handlers/v1/assessments/archive/route';

async function wrapper_post_assessments_archive(req: any, params: Record<string, string>) {
  return (post_assessments_archive as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/assessments/archive', wrapper_post_assessments_archive);
import { GET as get_assessments_preview } from '@/legacy-api-handlers/v1/assessments/preview/route';

async function wrapper_get_assessments_preview(req: any, params: Record<string, string>) {
  return (get_assessments_preview as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/assessments/preview', wrapper_get_assessments_preview);
import { POST as post_assessments_publish } from '@/legacy-api-handlers/v1/assessments/publish/route';

async function wrapper_post_assessments_publish(req: any, params: Record<string, string>) {
  return (post_assessments_publish as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/assessments/publish', wrapper_post_assessments_publish);
import { POST as post_assessments } from '@/legacy-api-handlers/v1/assessments/route';

async function wrapper_post_assessments(req: any, params: Record<string, string>) {
  return (post_assessments as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/assessments', wrapper_post_assessments);
import { POST as post_auth_forgot_password } from '@/legacy-api-handlers/v1/auth/forgot-password/route';

async function wrapper_post_auth_forgot_password(req: any, params: Record<string, string>) {
  return (post_auth_forgot_password as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/auth/forgot-password', wrapper_post_auth_forgot_password);
import { POST as post_auth_login } from '@/legacy-api-handlers/v1/auth/login/route';

async function wrapper_post_auth_login(req: any, params: Record<string, string>) {
  return (post_auth_login as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/auth/login', wrapper_post_auth_login);
import { POST as post_auth_logout } from '@/legacy-api-handlers/v1/auth/logout/route';

async function wrapper_post_auth_logout(req: any, params: Record<string, string>) {
  return (post_auth_logout as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/auth/logout', wrapper_post_auth_logout);
import { POST as post_auth_mfa_enable } from '@/legacy-api-handlers/v1/auth/mfa/enable/route';

async function wrapper_post_auth_mfa_enable(req: any, params: Record<string, string>) {
  return (post_auth_mfa_enable as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/auth/mfa/enable', wrapper_post_auth_mfa_enable);
import { POST as post_auth_mfa_verify } from '@/legacy-api-handlers/v1/auth/mfa/verify/route';

async function wrapper_post_auth_mfa_verify(req: any, params: Record<string, string>) {
  return (post_auth_mfa_verify as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/auth/mfa/verify', wrapper_post_auth_mfa_verify);
import { POST as post_auth_refresh } from '@/legacy-api-handlers/v1/auth/refresh/route';

async function wrapper_post_auth_refresh(req: any, params: Record<string, string>) {
  return (post_auth_refresh as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/auth/refresh', wrapper_post_auth_refresh);
import { POST as post_auth_register } from '@/legacy-api-handlers/v1/auth/register/route';

async function wrapper_post_auth_register(req: any, params: Record<string, string>) {
  return (post_auth_register as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/auth/register', wrapper_post_auth_register);
import { POST as post_auth_reset_password } from '@/legacy-api-handlers/v1/auth/reset-password/route';

async function wrapper_post_auth_reset_password(req: any, params: Record<string, string>) {
  return (post_auth_reset_password as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/auth/reset-password', wrapper_post_auth_reset_password);
import { GET as get_auth_session } from '@/legacy-api-handlers/v1/auth/session/route';

async function wrapper_get_auth_session(req: any, params: Record<string, string>) {
  return (get_auth_session as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/auth/session', wrapper_get_auth_session);
import { POST as post_auth_verify_email } from '@/legacy-api-handlers/v1/auth/verify-email/route';

async function wrapper_post_auth_verify_email(req: any, params: Record<string, string>) {
  return (post_auth_verify_email as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/auth/verify-email', wrapper_post_auth_verify_email);
import { POST as post_blueprints_id } from '@/legacy-api-handlers/v1/blueprints/[id]/route';

async function wrapper_post_blueprints_id(req: any, params: Record<string, string>) {
  return (post_blueprints_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/blueprints/:id', wrapper_post_blueprints_id);
import { POST as post_bookmarks } from '@/legacy-api-handlers/v1/bookmarks/route';

async function wrapper_post_bookmarks(req: any, params: Record<string, string>) {
  return (post_bookmarks as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/bookmarks', wrapper_post_bookmarks);
import { DELETE as delete_bookmarks_id } from '@/legacy-api-handlers/v1/bookmarks/[id]/route';

async function wrapper_delete_bookmarks_id(req: any, params: Record<string, string>) {
  return (delete_bookmarks_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.delete('/bookmarks/:id', wrapper_delete_bookmarks_id);
import { POST as post_broadcasts } from '@/legacy-api-handlers/v1/broadcasts/route';

async function wrapper_post_broadcasts(req: any, params: Record<string, string>) {
  return (post_broadcasts as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/broadcasts', wrapper_post_broadcasts);
import { GET as get_curricula } from '@/legacy-api-handlers/v1/curricula/route';

async function wrapper_get_curricula(req: any, params: Record<string, string>) {
  return (get_curricula as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/curricula', wrapper_get_curricula);
import { GET as get_curricula_id } from '@/legacy-api-handlers/v1/curricula/[id]/route';

async function wrapper_get_curricula_id(req: any, params: Record<string, string>) {
  return (get_curricula_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/curricula/:id', wrapper_get_curricula_id);
import { GET as get_dashboard_achievements } from '@/legacy-api-handlers/v1/dashboard/achievements/route';

async function wrapper_get_dashboard_achievements(req: any, params: Record<string, string>) {
  return (get_dashboard_achievements as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/dashboard/achievements', wrapper_get_dashboard_achievements);
import { GET as get_dashboard_activity } from '@/legacy-api-handlers/v1/dashboard/activity/route';

async function wrapper_get_dashboard_activity(req: any, params: Record<string, string>) {
  return (get_dashboard_activity as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/dashboard/activity', wrapper_get_dashboard_activity);
import { GET as get_dashboard_calendar } from '@/legacy-api-handlers/v1/dashboard/calendar/route';

async function wrapper_get_dashboard_calendar(req: any, params: Record<string, string>) {
  return (get_dashboard_calendar as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/dashboard/calendar', wrapper_get_dashboard_calendar);
import { GET as get_dashboard_notifications } from '@/legacy-api-handlers/v1/dashboard/notifications/route';

async function wrapper_get_dashboard_notifications(req: any, params: Record<string, string>) {
  return (get_dashboard_notifications as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/dashboard/notifications', wrapper_get_dashboard_notifications);
import { PATCH as patch_dashboard_notifications } from '@/legacy-api-handlers/v1/dashboard/notifications/route';

async function wrapper_patch_dashboard_notifications(req: any, params: Record<string, string>) {
  return (patch_dashboard_notifications as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/dashboard/notifications', wrapper_patch_dashboard_notifications);
import { GET as get_dashboard } from '@/legacy-api-handlers/v1/dashboard/route';

async function wrapper_get_dashboard(req: any, params: Record<string, string>) {
  return (get_dashboard as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/dashboard', wrapper_get_dashboard);
import { GET as get_dev_reset_demo_data } from '@/legacy-api-handlers/v1/dev/reset-demo-data/route';

async function wrapper_get_dev_reset_demo_data(req: any, params: Record<string, string>) {
  return (get_dev_reset_demo_data as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/dev/reset-demo-data', wrapper_get_dev_reset_demo_data);
import { POST as post_dev_reset_demo_data } from '@/legacy-api-handlers/v1/dev/reset-demo-data/route';

async function wrapper_post_dev_reset_demo_data(req: any, params: Record<string, string>) {
  return (post_dev_reset_demo_data as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/dev/reset-demo-data', wrapper_post_dev_reset_demo_data);
import { GET as get_diagnostic_attempts } from '@/legacy-api-handlers/v1/diagnostic/attempts/route';

async function wrapper_get_diagnostic_attempts(req: any, params: Record<string, string>) {
  return (get_diagnostic_attempts as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/diagnostic/attempts', wrapper_get_diagnostic_attempts);
import { POST as post_diagnostic_attempts } from '@/legacy-api-handlers/v1/diagnostic/attempts/route';

async function wrapper_post_diagnostic_attempts(req: any, params: Record<string, string>) {
  return (post_diagnostic_attempts as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/diagnostic/attempts', wrapper_post_diagnostic_attempts);
import { POST as post_diagnostic_attempts_id_placement } from '@/legacy-api-handlers/v1/diagnostic/attempts/[id]/placement/route';

async function wrapper_post_diagnostic_attempts_id_placement(req: any, params: Record<string, string>) {
  return (post_diagnostic_attempts_id_placement as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/diagnostic/attempts/:id/placement', wrapper_post_diagnostic_attempts_id_placement);
import { POST as post_diagnostic_attempts_id_response } from '@/legacy-api-handlers/v1/diagnostic/attempts/[id]/response/route';

async function wrapper_post_diagnostic_attempts_id_response(req: any, params: Record<string, string>) {
  return (post_diagnostic_attempts_id_response as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/diagnostic/attempts/:id/response', wrapper_post_diagnostic_attempts_id_response);
import { PUT as put_diagnostic_attempts_id_response } from '@/legacy-api-handlers/v1/diagnostic/attempts/[id]/response/route';

async function wrapper_put_diagnostic_attempts_id_response(req: any, params: Record<string, string>) {
  return (put_diagnostic_attempts_id_response as any)(req, { params: Promise.resolve(params) });
}
apiRouter.put('/diagnostic/attempts/:id/response', wrapper_put_diagnostic_attempts_id_response);
import { GET as get_diagnostic_attempts_id } from '@/legacy-api-handlers/v1/diagnostic/attempts/[id]/route';

async function wrapper_get_diagnostic_attempts_id(req: any, params: Record<string, string>) {
  return (get_diagnostic_attempts_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/diagnostic/attempts/:id', wrapper_get_diagnostic_attempts_id);
import { POST as post_diagnostic_attempts_id_submit } from '@/legacy-api-handlers/v1/diagnostic/attempts/[id]/submit/route';

async function wrapper_post_diagnostic_attempts_id_submit(req: any, params: Record<string, string>) {
  return (post_diagnostic_attempts_id_submit as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/diagnostic/attempts/:id/submit', wrapper_post_diagnostic_attempts_id_submit);
import { GET as get_diagnostic_config_examType } from '@/legacy-api-handlers/v1/diagnostic/config/[examType]/route';

async function wrapper_get_diagnostic_config_examType(req: any, params: Record<string, string>) {
  return (get_diagnostic_config_examType as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/diagnostic/config/:examType', wrapper_get_diagnostic_config_examType);
import { POST as post_evaluations_enqueue } from '@/legacy-api-handlers/v1/evaluations/enqueue/route';

async function wrapper_post_evaluations_enqueue(req: any, params: Record<string, string>) {
  return (post_evaluations_enqueue as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/evaluations/enqueue', wrapper_post_evaluations_enqueue);
import { GET as get_evaluations_results } from '@/legacy-api-handlers/v1/evaluations/results/route';

async function wrapper_get_evaluations_results(req: any, params: Record<string, string>) {
  return (get_evaluations_results as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/evaluations/results', wrapper_get_evaluations_results);
import { GET as get_evaluations } from '@/legacy-api-handlers/v1/evaluations/route';

async function wrapper_get_evaluations(req: any, params: Record<string, string>) {
  return (get_evaluations as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/evaluations', wrapper_get_evaluations);
import { POST as post_evaluations } from '@/legacy-api-handlers/v1/evaluations/route';

async function wrapper_post_evaluations(req: any, params: Record<string, string>) {
  return (post_evaluations as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/evaluations', wrapper_post_evaluations);
import { GET as get_evaluations_status } from '@/legacy-api-handlers/v1/evaluations/status/route';

async function wrapper_get_evaluations_status(req: any, params: Record<string, string>) {
  return (get_evaluations_status as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/evaluations/status', wrapper_get_evaluations_status);
import { POST as post_evaluations_id_approve } from '@/legacy-api-handlers/v1/evaluations/[id]/approve/route';

async function wrapper_post_evaluations_id_approve(req: any, params: Record<string, string>) {
  return (post_evaluations_id_approve as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/evaluations/:id/approve', wrapper_post_evaluations_id_approve);
import { GET as get_evaluations_id_feedback } from '@/legacy-api-handlers/v1/evaluations/[id]/feedback/route';

async function wrapper_get_evaluations_id_feedback(req: any, params: Record<string, string>) {
  return (get_evaluations_id_feedback as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/evaluations/:id/feedback', wrapper_get_evaluations_id_feedback);
import { POST as post_evaluations_id_review } from '@/legacy-api-handlers/v1/evaluations/[id]/review/route';

async function wrapper_post_evaluations_id_review(req: any, params: Record<string, string>) {
  return (post_evaluations_id_review as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/evaluations/:id/review', wrapper_post_evaluations_id_review);
import { PATCH as patch_evaluations_id_review } from '@/legacy-api-handlers/v1/evaluations/[id]/review/route';

async function wrapper_patch_evaluations_id_review(req: any, params: Record<string, string>) {
  return (patch_evaluations_id_review as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/evaluations/:id/review', wrapper_patch_evaluations_id_review);
import { GET as get_evaluations_id } from '@/legacy-api-handlers/v1/evaluations/[id]/route';

async function wrapper_get_evaluations_id(req: any, params: Record<string, string>) {
  return (get_evaluations_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/evaluations/:id', wrapper_get_evaluations_id);
import { GET as get_health } from '@/legacy-api-handlers/v1/health/route';

async function wrapper_get_health(req: any, params: Record<string, string>) {
  return (get_health as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/health', wrapper_get_health);
import { GET as get_identity_profiles_id } from '@/legacy-api-handlers/v1/identity/profiles/[id]/route';

async function wrapper_get_identity_profiles_id(req: any, params: Record<string, string>) {
  return (get_identity_profiles_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/identity/profiles/:id', wrapper_get_identity_profiles_id);
import { PATCH as patch_identity_profiles_id } from '@/legacy-api-handlers/v1/identity/profiles/[id]/route';

async function wrapper_patch_identity_profiles_id(req: any, params: Record<string, string>) {
  return (patch_identity_profiles_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/identity/profiles/:id', wrapper_patch_identity_profiles_id);
import { GET as get_identity_users } from '@/legacy-api-handlers/v1/identity/users/route';

async function wrapper_get_identity_users(req: any, params: Record<string, string>) {
  return (get_identity_users as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/identity/users', wrapper_get_identity_users);
import { POST as post_identity_users } from '@/legacy-api-handlers/v1/identity/users/route';

async function wrapper_post_identity_users(req: any, params: Record<string, string>) {
  return (post_identity_users as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/identity/users', wrapper_post_identity_users);
import { POST as post_identity_users_id_archive } from '@/legacy-api-handlers/v1/identity/users/[id]/archive/route';

async function wrapper_post_identity_users_id_archive(req: any, params: Record<string, string>) {
  return (post_identity_users_id_archive as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/identity/users/:id/archive', wrapper_post_identity_users_id_archive);
import { POST as post_identity_users_id_restore } from '@/legacy-api-handlers/v1/identity/users/[id]/restore/route';

async function wrapper_post_identity_users_id_restore(req: any, params: Record<string, string>) {
  return (post_identity_users_id_restore as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/identity/users/:id/restore', wrapper_post_identity_users_id_restore);
import { GET as get_identity_users_id } from '@/legacy-api-handlers/v1/identity/users/[id]/route';

async function wrapper_get_identity_users_id(req: any, params: Record<string, string>) {
  return (get_identity_users_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/identity/users/:id', wrapper_get_identity_users_id);
import { POST as post_intelligence_analyze_mock } from '@/legacy-api-handlers/v1/intelligence/analyze-mock/route';

async function wrapper_post_intelligence_analyze_mock(req: any, params: Record<string, string>) {
  return (post_intelligence_analyze_mock as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/intelligence/analyze-mock', wrapper_post_intelligence_analyze_mock);
import { POST as post_intelligence_analyze_session } from '@/legacy-api-handlers/v1/intelligence/analyze-session/route';

async function wrapper_post_intelligence_analyze_session(req: any, params: Record<string, string>) {
  return (post_intelligence_analyze_session as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/intelligence/analyze-session', wrapper_post_intelligence_analyze_session);
import { GET as get_intelligence_profile } from '@/legacy-api-handlers/v1/intelligence/profile/route';

async function wrapper_get_intelligence_profile(req: any, params: Record<string, string>) {
  return (get_intelligence_profile as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/intelligence/profile', wrapper_get_intelligence_profile);
import { GET as get_intelligence_readiness } from '@/legacy-api-handlers/v1/intelligence/readiness/route';

async function wrapper_get_intelligence_readiness(req: any, params: Record<string, string>) {
  return (get_intelligence_readiness as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/intelligence/readiness', wrapper_get_intelligence_readiness);
import { GET as get_intelligence_recommendations } from '@/legacy-api-handlers/v1/intelligence/recommendations/route';

async function wrapper_get_intelligence_recommendations(req: any, params: Record<string, string>) {
  return (get_intelligence_recommendations as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/intelligence/recommendations', wrapper_get_intelligence_recommendations);
import { GET as get_intelligence_study_plan } from '@/legacy-api-handlers/v1/intelligence/study-plan/route';

async function wrapper_get_intelligence_study_plan(req: any, params: Record<string, string>) {
  return (get_intelligence_study_plan as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/intelligence/study-plan', wrapper_get_intelligence_study_plan);
import { POST as post_internal_ai_health } from '@/legacy-api-handlers/v1/internal/ai/health/route';

async function wrapper_post_internal_ai_health(req: any, params: Record<string, string>) {
  return (post_internal_ai_health as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/internal/ai/health', wrapper_post_internal_ai_health);
import { GET as get_lessons } from '@/legacy-api-handlers/v1/lessons/route';

async function wrapper_get_lessons(req: any, params: Record<string, string>) {
  return (get_lessons as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/lessons', wrapper_get_lessons);
import { GET as get_lessons_id } from '@/legacy-api-handlers/v1/lessons/[id]/route';

async function wrapper_get_lessons_id(req: any, params: Record<string, string>) {
  return (get_lessons_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/lessons/:id', wrapper_get_lessons_id);
import { GET as get_me } from '@/legacy-api-handlers/v1/me/route';

async function wrapper_get_me(req: any, params: Record<string, string>) {
  return (get_me as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/me', wrapper_get_me);
import { POST as post_media_upload } from '@/legacy-api-handlers/v1/media/upload/route';

async function wrapper_post_media_upload(req: any, params: Record<string, string>) {
  return (post_media_upload as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/media/upload', wrapper_post_media_upload);
import { POST as post_mock_answer } from '@/legacy-api-handlers/v1/mock/answer/route';

async function wrapper_post_mock_answer(req: any, params: Record<string, string>) {
  return (post_mock_answer as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/mock/answer', wrapper_post_mock_answer);
import { GET as get_mock_blueprints } from '@/legacy-api-handlers/v1/mock/blueprints/route';

async function wrapper_get_mock_blueprints(req: any, params: Record<string, string>) {
  return (get_mock_blueprints as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/mock/blueprints', wrapper_get_mock_blueprints);
import { POST as post_mock_complete_section } from '@/legacy-api-handlers/v1/mock/complete-section/route';

async function wrapper_post_mock_complete_section(req: any, params: Record<string, string>) {
  return (post_mock_complete_section as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/mock/complete-section', wrapper_post_mock_complete_section);
import { GET as get_mock_history } from '@/legacy-api-handlers/v1/mock/history/route';

async function wrapper_get_mock_history(req: any, params: Record<string, string>) {
  return (get_mock_history as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/mock/history', wrapper_get_mock_history);
import { POST as post_mock_integrity_event } from '@/legacy-api-handlers/v1/mock/integrity-event/route';

async function wrapper_post_mock_integrity_event(req: any, params: Record<string, string>) {
  return (post_mock_integrity_event as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/mock/integrity-event', wrapper_post_mock_integrity_event);
import { GET as get_mock_readiness } from '@/legacy-api-handlers/v1/mock/readiness/route';

async function wrapper_get_mock_readiness(req: any, params: Record<string, string>) {
  return (get_mock_readiness as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/mock/readiness', wrapper_get_mock_readiness);
import { GET as get_mock_result_id } from '@/legacy-api-handlers/v1/mock/result/[id]/route';

async function wrapper_get_mock_result_id(req: any, params: Record<string, string>) {
  return (get_mock_result_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/mock/result/:id', wrapper_get_mock_result_id);
import { GET as get_mock_results_attemptId } from '@/legacy-api-handlers/v1/mock/results/[attemptId]/route';

async function wrapper_get_mock_results_attemptId(req: any, params: Record<string, string>) {
  return (get_mock_results_attemptId as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/mock/results/:attemptId', wrapper_get_mock_results_attemptId);
import { POST as post_mock_resume } from '@/legacy-api-handlers/v1/mock/resume/route';

async function wrapper_post_mock_resume(req: any, params: Record<string, string>) {
  return (post_mock_resume as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/mock/resume', wrapper_post_mock_resume);
import { POST as post_mock_review } from '@/legacy-api-handlers/v1/mock/review/route';

async function wrapper_post_mock_review(req: any, params: Record<string, string>) {
  return (post_mock_review as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/mock/review', wrapper_post_mock_review);
import { GET as get_mock_review_id } from '@/legacy-api-handlers/v1/mock/review/[id]/route';

async function wrapper_get_mock_review_id(req: any, params: Record<string, string>) {
  return (get_mock_review_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/mock/review/:id', wrapper_get_mock_review_id);
import { POST as post_mock_save } from '@/legacy-api-handlers/v1/mock/save/route';

async function wrapper_post_mock_save(req: any, params: Record<string, string>) {
  return (post_mock_save as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/mock/save', wrapper_post_mock_save);
import { GET as get_mock_session_id } from '@/legacy-api-handlers/v1/mock/session/[id]/route';

async function wrapper_get_mock_session_id(req: any, params: Record<string, string>) {
  return (get_mock_session_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/mock/session/:id', wrapper_get_mock_session_id);
import { POST as post_mock_sessions_id_submit } from '@/legacy-api-handlers/v1/mock/sessions/[id]/submit/route';

async function wrapper_post_mock_sessions_id_submit(req: any, params: Record<string, string>) {
  return (post_mock_sessions_id_submit as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/mock/sessions/:id/submit', wrapper_post_mock_sessions_id_submit);
import { POST as post_mock_start } from '@/legacy-api-handlers/v1/mock/start/route';

async function wrapper_post_mock_start(req: any, params: Record<string, string>) {
  return (post_mock_start as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/mock/start', wrapper_post_mock_start);
import { GET as get_mock_statistics } from '@/legacy-api-handlers/v1/mock/statistics/route';

async function wrapper_get_mock_statistics(req: any, params: Record<string, string>) {
  return (get_mock_statistics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/mock/statistics', wrapper_get_mock_statistics);
import { POST as post_mock_submit } from '@/legacy-api-handlers/v1/mock/submit/route';

async function wrapper_post_mock_submit(req: any, params: Record<string, string>) {
  return (post_mock_submit as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/mock/submit', wrapper_post_mock_submit);
import { POST as post_mock_submit_section } from '@/legacy-api-handlers/v1/mock/submit-section/route';

async function wrapper_post_mock_submit_section(req: any, params: Record<string, string>) {
  return (post_mock_submit_section as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/mock/submit-section', wrapper_post_mock_submit_section);
import { GET as get_mock_templates } from '@/legacy-api-handlers/v1/mock/templates/route';

async function wrapper_get_mock_templates(req: any, params: Record<string, string>) {
  return (get_mock_templates as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/mock/templates', wrapper_get_mock_templates);
import { GET as get_modules_id } from '@/legacy-api-handlers/v1/modules/[id]/route';

async function wrapper_get_modules_id(req: any, params: Record<string, string>) {
  return (get_modules_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/modules/:id', wrapper_get_modules_id);
import { GET as get_notifications_admin_dashboard } from '@/legacy-api-handlers/v1/notifications/admin-dashboard/route';

async function wrapper_get_notifications_admin_dashboard(req: any, params: Record<string, string>) {
  return (get_notifications_admin_dashboard as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/notifications/admin-dashboard', wrapper_get_notifications_admin_dashboard);
import { GET as get_notifications_analytics } from '@/legacy-api-handlers/v1/notifications/analytics/route';

async function wrapper_get_notifications_analytics(req: any, params: Record<string, string>) {
  return (get_notifications_analytics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/notifications/analytics', wrapper_get_notifications_analytics);
import { GET as get_notifications } from '@/legacy-api-handlers/v1/notifications/route';

async function wrapper_get_notifications(req: any, params: Record<string, string>) {
  return (get_notifications as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/notifications', wrapper_get_notifications);
import { PATCH as patch_notifications_id_read } from '@/legacy-api-handlers/v1/notifications/[id]/read/route';

async function wrapper_patch_notifications_id_read(req: any, params: Record<string, string>) {
  return (patch_notifications_id_read as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/notifications/:id/read', wrapper_patch_notifications_id_read);
import { GET as get_practice_analytics } from '@/legacy-api-handlers/v1/practice/analytics/route';

async function wrapper_get_practice_analytics(req: any, params: Record<string, string>) {
  return (get_practice_analytics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice/analytics', wrapper_get_practice_analytics);
import { POST as post_practice_complete } from '@/legacy-api-handlers/v1/practice/complete/route';

async function wrapper_post_practice_complete(req: any, params: Record<string, string>) {
  return (post_practice_complete as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/practice/complete', wrapper_post_practice_complete);
import { POST as post_practice_confidence } from '@/legacy-api-handlers/v1/practice/confidence/route';

async function wrapper_post_practice_confidence(req: any, params: Record<string, string>) {
  return (post_practice_confidence as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/practice/confidence', wrapper_post_practice_confidence);
import { GET as get_practice_current } from '@/legacy-api-handlers/v1/practice/current/route';

async function wrapper_get_practice_current(req: any, params: Record<string, string>) {
  return (get_practice_current as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice/current', wrapper_get_practice_current);
import { GET as get_practice_daily_goals } from '@/legacy-api-handlers/v1/practice/daily-goals/route';

async function wrapper_get_practice_daily_goals(req: any, params: Record<string, string>) {
  return (get_practice_daily_goals as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice/daily-goals', wrapper_get_practice_daily_goals);
import { POST as post_practice_daily_goals } from '@/legacy-api-handlers/v1/practice/daily-goals/route';

async function wrapper_post_practice_daily_goals(req: any, params: Record<string, string>) {
  return (post_practice_daily_goals as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/practice/daily-goals', wrapper_post_practice_daily_goals);
import { GET as get_practice_focus_areas } from '@/legacy-api-handlers/v1/practice/focus-areas/route';

async function wrapper_get_practice_focus_areas(req: any, params: Record<string, string>) {
  return (get_practice_focus_areas as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice/focus-areas', wrapper_get_practice_focus_areas);
import { GET as get_practice_goals } from '@/legacy-api-handlers/v1/practice/goals/route';

async function wrapper_get_practice_goals(req: any, params: Record<string, string>) {
  return (get_practice_goals as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice/goals', wrapper_get_practice_goals);
import { PATCH as patch_practice_goals } from '@/legacy-api-handlers/v1/practice/goals/route';

async function wrapper_patch_practice_goals(req: any, params: Record<string, string>) {
  return (patch_practice_goals as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/practice/goals', wrapper_patch_practice_goals);
import { GET as get_practice_history } from '@/legacy-api-handlers/v1/practice/history/route';

async function wrapper_get_practice_history(req: any, params: Record<string, string>) {
  return (get_practice_history as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice/history', wrapper_get_practice_history);
import { GET as get_practice_motivation } from '@/legacy-api-handlers/v1/practice/motivation/route';

async function wrapper_get_practice_motivation(req: any, params: Record<string, string>) {
  return (get_practice_motivation as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice/motivation', wrapper_get_practice_motivation);
import { POST as post_practice_pause } from '@/legacy-api-handlers/v1/practice/pause/route';

async function wrapper_post_practice_pause(req: any, params: Record<string, string>) {
  return (post_practice_pause as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/practice/pause', wrapper_post_practice_pause);
import { GET as get_practice_recommendations } from '@/legacy-api-handlers/v1/practice/recommendations/route';

async function wrapper_get_practice_recommendations(req: any, params: Record<string, string>) {
  return (get_practice_recommendations as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice/recommendations', wrapper_get_practice_recommendations);
import { POST as post_practice_recommendations_id_accept } from '@/legacy-api-handlers/v1/practice/recommendations/[id]/accept/route';

async function wrapper_post_practice_recommendations_id_accept(req: any, params: Record<string, string>) {
  return (post_practice_recommendations_id_accept as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/practice/recommendations/:id/accept', wrapper_post_practice_recommendations_id_accept);
import { POST as post_practice_recommendations_id_reject } from '@/legacy-api-handlers/v1/practice/recommendations/[id]/reject/route';

async function wrapper_post_practice_recommendations_id_reject(req: any, params: Record<string, string>) {
  return (post_practice_recommendations_id_reject as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/practice/recommendations/:id/reject', wrapper_post_practice_recommendations_id_reject);
import { GET as get_practice_results } from '@/legacy-api-handlers/v1/practice/results/route';

async function wrapper_get_practice_results(req: any, params: Record<string, string>) {
  return (get_practice_results as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice/results', wrapper_get_practice_results);
import { POST as post_practice_resume } from '@/legacy-api-handlers/v1/practice/resume/route';

async function wrapper_post_practice_resume(req: any, params: Record<string, string>) {
  return (post_practice_resume as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/practice/resume', wrapper_post_practice_resume);
import { POST as post_practice_retention_recalculate } from '@/legacy-api-handlers/v1/practice/retention/recalculate/route';

async function wrapper_post_practice_retention_recalculate(req: any, params: Record<string, string>) {
  return (post_practice_retention_recalculate as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/practice/retention/recalculate', wrapper_post_practice_retention_recalculate);
import { GET as get_practice_retention } from '@/legacy-api-handlers/v1/practice/retention/route';

async function wrapper_get_practice_retention(req: any, params: Record<string, string>) {
  return (get_practice_retention as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice/retention', wrapper_get_practice_retention);
import { POST as post_practice_retry } from '@/legacy-api-handlers/v1/practice/retry/route';

async function wrapper_post_practice_retry(req: any, params: Record<string, string>) {
  return (post_practice_retry as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/practice/retry', wrapper_post_practice_retry);
import { GET as get_practice_review_id } from '@/legacy-api-handlers/v1/practice/review/[id]/route';

async function wrapper_get_practice_review_id(req: any, params: Record<string, string>) {
  return (get_practice_review_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice/review/:id', wrapper_get_practice_review_id);
import { GET as get_practice_review_queue } from '@/legacy-api-handlers/v1/practice/review-queue/route';

async function wrapper_get_practice_review_queue(req: any, params: Record<string, string>) {
  return (get_practice_review_queue as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice/review-queue', wrapper_get_practice_review_queue);
import { GET as get_practice } from '@/legacy-api-handlers/v1/practice/route';

async function wrapper_get_practice(req: any, params: Record<string, string>) {
  return (get_practice as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice', wrapper_get_practice);
import { POST as post_practice } from '@/legacy-api-handlers/v1/practice/route';

async function wrapper_post_practice(req: any, params: Record<string, string>) {
  return (post_practice as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/practice', wrapper_post_practice);
import { POST as post_practice_start } from '@/legacy-api-handlers/v1/practice/start/route';

async function wrapper_post_practice_start(req: any, params: Record<string, string>) {
  return (post_practice_start as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/practice/start', wrapper_post_practice_start);
import { GET as get_practice_id } from '@/legacy-api-handlers/v1/practice/[id]/route';

async function wrapper_get_practice_id(req: any, params: Record<string, string>) {
  return (get_practice_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/practice/:id', wrapper_get_practice_id);
import { POST as post_practice_id_submit } from '@/legacy-api-handlers/v1/practice/[id]/submit/route';

async function wrapper_post_practice_id_submit(req: any, params: Record<string, string>) {
  return (post_practice_id_submit as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/practice/:id/submit', wrapper_post_practice_id_submit);
import { GET as get_preferences } from '@/legacy-api-handlers/v1/preferences/route';

async function wrapper_get_preferences(req: any, params: Record<string, string>) {
  return (get_preferences as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/preferences', wrapper_get_preferences);
import { PATCH as patch_preferences } from '@/legacy-api-handlers/v1/preferences/route';

async function wrapper_patch_preferences(req: any, params: Record<string, string>) {
  return (patch_preferences as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/preferences', wrapper_patch_preferences);
import { GET as get_progress_history } from '@/legacy-api-handlers/v1/progress/history/route';

async function wrapper_get_progress_history(req: any, params: Record<string, string>) {
  return (get_progress_history as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/progress/history', wrapper_get_progress_history);
import { GET as get_progress } from '@/legacy-api-handlers/v1/progress/route';

async function wrapper_get_progress(req: any, params: Record<string, string>) {
  return (get_progress as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/progress', wrapper_get_progress);
import { GET as get_questions_export } from '@/legacy-api-handlers/v1/questions/export/route';

async function wrapper_get_questions_export(req: any, params: Record<string, string>) {
  return (get_questions_export as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/questions/export', wrapper_get_questions_export);
import { GET as get_questions } from '@/legacy-api-handlers/v1/questions/route';

async function wrapper_get_questions(req: any, params: Record<string, string>) {
  return (get_questions as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/questions', wrapper_get_questions);
import { POST as post_questions } from '@/legacy-api-handlers/v1/questions/route';

async function wrapper_post_questions(req: any, params: Record<string, string>) {
  return (post_questions as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/questions', wrapper_post_questions);
import { GET as get_questions_search } from '@/legacy-api-handlers/v1/questions/search/route';

async function wrapper_get_questions_search(req: any, params: Record<string, string>) {
  return (get_questions_search as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/questions/search', wrapper_get_questions_search);
import { POST as post_questions_id_archive } from '@/legacy-api-handlers/v1/questions/[id]/archive/route';

async function wrapper_post_questions_id_archive(req: any, params: Record<string, string>) {
  return (post_questions_id_archive as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/questions/:id/archive', wrapper_post_questions_id_archive);
import { POST as post_questions_id_retire } from '@/legacy-api-handlers/v1/questions/[id]/retire/route';

async function wrapper_post_questions_id_retire(req: any, params: Record<string, string>) {
  return (post_questions_id_retire as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/questions/:id/retire', wrapper_post_questions_id_retire);
import { GET as get_questions_id } from '@/legacy-api-handlers/v1/questions/[id]/route';

async function wrapper_get_questions_id(req: any, params: Record<string, string>) {
  return (get_questions_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/questions/:id', wrapper_get_questions_id);
import { GET as get_readiness_benchmark } from '@/legacy-api-handlers/v1/readiness/benchmark/route';

async function wrapper_get_readiness_benchmark(req: any, params: Record<string, string>) {
  return (get_readiness_benchmark as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/benchmark', wrapper_get_readiness_benchmark);
import { GET as get_readiness_cohort } from '@/legacy-api-handlers/v1/readiness/cohort/route';

async function wrapper_get_readiness_cohort(req: any, params: Record<string, string>) {
  return (get_readiness_cohort as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/cohort', wrapper_get_readiness_cohort);
import { GET as get_readiness_confidence } from '@/legacy-api-handlers/v1/readiness/confidence/route';

async function wrapper_get_readiness_confidence(req: any, params: Record<string, string>) {
  return (get_readiness_confidence as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/confidence', wrapper_get_readiness_confidence);
import { GET as get_readiness_contribution } from '@/legacy-api-handlers/v1/readiness/contribution/route';

async function wrapper_get_readiness_contribution(req: any, params: Record<string, string>) {
  return (get_readiness_contribution as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/contribution', wrapper_get_readiness_contribution);
import { GET as get_readiness_experiments } from '@/legacy-api-handlers/v1/readiness/experiments/route';

async function wrapper_get_readiness_experiments(req: any, params: Record<string, string>) {
  return (get_readiness_experiments as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/experiments', wrapper_get_readiness_experiments);
import { POST as post_readiness_experiments } from '@/legacy-api-handlers/v1/readiness/experiments/route';

async function wrapper_post_readiness_experiments(req: any, params: Record<string, string>) {
  return (post_readiness_experiments as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness/experiments', wrapper_post_readiness_experiments);
import { POST as post_readiness_experiments_id_complete } from '@/legacy-api-handlers/v1/readiness/experiments/[id]/complete/route';

async function wrapper_post_readiness_experiments_id_complete(req: any, params: Record<string, string>) {
  return (post_readiness_experiments_id_complete as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness/experiments/:id/complete', wrapper_post_readiness_experiments_id_complete);
import { POST as post_readiness_experiments_id_start } from '@/legacy-api-handlers/v1/readiness/experiments/[id]/start/route';

async function wrapper_post_readiness_experiments_id_start(req: any, params: Record<string, string>) {
  return (post_readiness_experiments_id_start as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness/experiments/:id/start', wrapper_post_readiness_experiments_id_start);
import { GET as get_readiness_features } from '@/legacy-api-handlers/v1/readiness/features/route';

async function wrapper_get_readiness_features(req: any, params: Record<string, string>) {
  return (get_readiness_features as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/features', wrapper_get_readiness_features);
import { POST as post_readiness_features } from '@/legacy-api-handlers/v1/readiness/features/route';

async function wrapper_post_readiness_features(req: any, params: Record<string, string>) {
  return (post_readiness_features as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness/features', wrapper_post_readiness_features);
import { GET as get_readiness_history } from '@/legacy-api-handlers/v1/readiness/history/route';

async function wrapper_get_readiness_history(req: any, params: Record<string, string>) {
  return (get_readiness_history as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/history', wrapper_get_readiness_history);
import { GET as get_readiness_instructor } from '@/legacy-api-handlers/v1/readiness/instructor/route';

async function wrapper_get_readiness_instructor(req: any, params: Record<string, string>) {
  return (get_readiness_instructor as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/instructor', wrapper_get_readiness_instructor);
import { GET as get_readiness_interventions_catalogue } from '@/legacy-api-handlers/v1/readiness/interventions/catalogue/route';

async function wrapper_get_readiness_interventions_catalogue(req: any, params: Record<string, string>) {
  return (get_readiness_interventions_catalogue as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/interventions/catalogue', wrapper_get_readiness_interventions_catalogue);
import { GET as get_readiness_latest } from '@/legacy-api-handlers/v1/readiness/latest/route';

async function wrapper_get_readiness_latest(req: any, params: Record<string, string>) {
  return (get_readiness_latest as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/latest', wrapper_get_readiness_latest);
import { GET as get_readiness_metrics } from '@/legacy-api-handlers/v1/readiness/metrics/route';

async function wrapper_get_readiness_metrics(req: any, params: Record<string, string>) {
  return (get_readiness_metrics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/metrics', wrapper_get_readiness_metrics);
import { POST as post_readiness_metrics } from '@/legacy-api-handlers/v1/readiness/metrics/route';

async function wrapper_post_readiness_metrics(req: any, params: Record<string, string>) {
  return (post_readiness_metrics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness/metrics', wrapper_post_readiness_metrics);
import { POST as post_readiness_outcomes } from '@/legacy-api-handlers/v1/readiness/outcomes/route';

async function wrapper_post_readiness_outcomes(req: any, params: Record<string, string>) {
  return (post_readiness_outcomes as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness/outcomes', wrapper_post_readiness_outcomes);
import { GET as get_readiness_pathway } from '@/legacy-api-handlers/v1/readiness/pathway/route';

async function wrapper_get_readiness_pathway(req: any, params: Record<string, string>) {
  return (get_readiness_pathway as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/pathway', wrapper_get_readiness_pathway);
import { POST as post_readiness_predictions_id_interventions_intId_activate } from '@/legacy-api-handlers/v1/readiness/predictions/[id]/interventions/[intId]/activate/route';

async function wrapper_post_readiness_predictions_id_interventions_intId_activate(req: any, params: Record<string, string>) {
  return (post_readiness_predictions_id_interventions_intId_activate as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness/predictions/:id/interventions/:intId/activate', wrapper_post_readiness_predictions_id_interventions_intId_activate);
import { POST as post_readiness_predictions_id_interventions_intId_complete } from '@/legacy-api-handlers/v1/readiness/predictions/[id]/interventions/[intId]/complete/route';

async function wrapper_post_readiness_predictions_id_interventions_intId_complete(req: any, params: Record<string, string>) {
  return (post_readiness_predictions_id_interventions_intId_complete as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness/predictions/:id/interventions/:intId/complete', wrapper_post_readiness_predictions_id_interventions_intId_complete);
import { POST as post_readiness_predictions_id_interventions_intId_discard } from '@/legacy-api-handlers/v1/readiness/predictions/[id]/interventions/[intId]/discard/route';

async function wrapper_post_readiness_predictions_id_interventions_intId_discard(req: any, params: Record<string, string>) {
  return (post_readiness_predictions_id_interventions_intId_discard as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness/predictions/:id/interventions/:intId/discard', wrapper_post_readiness_predictions_id_interventions_intId_discard);
import { POST as post_readiness_predictions_id_outcome } from '@/legacy-api-handlers/v1/readiness/predictions/[id]/outcome/route';

async function wrapper_post_readiness_predictions_id_outcome(req: any, params: Record<string, string>) {
  return (post_readiness_predictions_id_outcome as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness/predictions/:id/outcome', wrapper_post_readiness_predictions_id_outcome);
import { POST as post_readiness_predictions_id_publish } from '@/legacy-api-handlers/v1/readiness/predictions/[id]/publish/route';

async function wrapper_post_readiness_predictions_id_publish(req: any, params: Record<string, string>) {
  return (post_readiness_predictions_id_publish as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness/predictions/:id/publish', wrapper_post_readiness_predictions_id_publish);
import { GET as get_readiness } from '@/legacy-api-handlers/v1/readiness/route';

async function wrapper_get_readiness(req: any, params: Record<string, string>) {
  return (get_readiness as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness', wrapper_get_readiness);
import { POST as post_readiness } from '@/legacy-api-handlers/v1/readiness/route';

async function wrapper_post_readiness(req: any, params: Record<string, string>) {
  return (post_readiness as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness', wrapper_post_readiness);
import { GET as get_readiness_scenario } from '@/legacy-api-handlers/v1/readiness/scenario/route';

async function wrapper_get_readiness_scenario(req: any, params: Record<string, string>) {
  return (get_readiness_scenario as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/scenario', wrapper_get_readiness_scenario);
import { POST as post_readiness_scenario } from '@/legacy-api-handlers/v1/readiness/scenario/route';

async function wrapper_post_readiness_scenario(req: any, params: Record<string, string>) {
  return (post_readiness_scenario as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness/scenario', wrapper_post_readiness_scenario);
import { GET as get_readiness_stability } from '@/legacy-api-handlers/v1/readiness/stability/route';

async function wrapper_get_readiness_stability(req: any, params: Record<string, string>) {
  return (get_readiness_stability as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/stability', wrapper_get_readiness_stability);
import { GET as get_readiness_student } from '@/legacy-api-handlers/v1/readiness/student/route';

async function wrapper_get_readiness_student(req: any, params: Record<string, string>) {
  return (get_readiness_student as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/student', wrapper_get_readiness_student);
import { GET as get_readiness_timeline } from '@/legacy-api-handlers/v1/readiness/timeline/route';

async function wrapper_get_readiness_timeline(req: any, params: Record<string, string>) {
  return (get_readiness_timeline as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/timeline', wrapper_get_readiness_timeline);
import { POST as post_readiness_timeline } from '@/legacy-api-handlers/v1/readiness/timeline/route';

async function wrapper_post_readiness_timeline(req: any, params: Record<string, string>) {
  return (post_readiness_timeline as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/readiness/timeline', wrapper_post_readiness_timeline);
import { GET as get_readiness_velocity } from '@/legacy-api-handlers/v1/readiness/velocity/route';

async function wrapper_get_readiness_velocity(req: any, params: Record<string, string>) {
  return (get_readiness_velocity as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/readiness/velocity', wrapper_get_readiness_velocity);
import { POST as post_reports_generate } from '@/legacy-api-handlers/v1/reports/generate/route';

async function wrapper_post_reports_generate(req: any, params: Record<string, string>) {
  return (post_reports_generate as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/reports/generate', wrapper_post_reports_generate);
import { GET as get_reports } from '@/legacy-api-handlers/v1/reports/route';

async function wrapper_get_reports(req: any, params: Record<string, string>) {
  return (get_reports as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/reports', wrapper_get_reports);
import { GET as get_resources_search } from '@/legacy-api-handlers/v1/resources/search/route';

async function wrapper_get_resources_search(req: any, params: Record<string, string>) {
  return (get_resources_search as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/resources/search', wrapper_get_resources_search);
import { GET as get_resources_id } from '@/legacy-api-handlers/v1/resources/[id]/route';

async function wrapper_get_resources_id(req: any, params: Record<string, string>) {
  return (get_resources_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/resources/:id', wrapper_get_resources_id);
import { GET as get_results } from '@/legacy-api-handlers/v1/results/route';

async function wrapper_get_results(req: any, params: Record<string, string>) {
  return (get_results as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/results', wrapper_get_results);
import { GET as get_results_studentId } from '@/legacy-api-handlers/v1/results/[studentId]/route';

async function wrapper_get_results_studentId(req: any, params: Record<string, string>) {
  return (get_results_studentId as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/results/:studentId', wrapper_get_results_studentId);
import { GET as get_runtime_answer } from '@/legacy-api-handlers/v1/runtime/answer/route';

async function wrapper_get_runtime_answer(req: any, params: Record<string, string>) {
  return (get_runtime_answer as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/runtime/answer', wrapper_get_runtime_answer);
import { POST as post_runtime_answer } from '@/legacy-api-handlers/v1/runtime/answer/route';

async function wrapper_post_runtime_answer(req: any, params: Record<string, string>) {
  return (post_runtime_answer as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/runtime/answer', wrapper_post_runtime_answer);
import { GET as get_runtime_checkpoint } from '@/legacy-api-handlers/v1/runtime/checkpoint/route';

async function wrapper_get_runtime_checkpoint(req: any, params: Record<string, string>) {
  return (get_runtime_checkpoint as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/runtime/checkpoint', wrapper_get_runtime_checkpoint);
import { POST as post_runtime_checkpoint } from '@/legacy-api-handlers/v1/runtime/checkpoint/route';

async function wrapper_post_runtime_checkpoint(req: any, params: Record<string, string>) {
  return (post_runtime_checkpoint as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/runtime/checkpoint', wrapper_post_runtime_checkpoint);
import { POST as post_runtime_pause } from '@/legacy-api-handlers/v1/runtime/pause/route';

async function wrapper_post_runtime_pause(req: any, params: Record<string, string>) {
  return (post_runtime_pause as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/runtime/pause', wrapper_post_runtime_pause);
import { POST as post_runtime_resume } from '@/legacy-api-handlers/v1/runtime/resume/route';

async function wrapper_post_runtime_resume(req: any, params: Record<string, string>) {
  return (post_runtime_resume as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/runtime/resume', wrapper_post_runtime_resume);
import { GET as get_runtime } from '@/legacy-api-handlers/v1/runtime/route';

async function wrapper_get_runtime(req: any, params: Record<string, string>) {
  return (get_runtime as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/runtime', wrapper_get_runtime);
import { POST as post_runtime } from '@/legacy-api-handlers/v1/runtime/route';

async function wrapper_post_runtime(req: any, params: Record<string, string>) {
  return (post_runtime as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/runtime', wrapper_post_runtime);
import { POST as post_runtime_start } from '@/legacy-api-handlers/v1/runtime/start/route';

async function wrapper_post_runtime_start(req: any, params: Record<string, string>) {
  return (post_runtime_start as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/runtime/start', wrapper_post_runtime_start);
import { POST as post_runtime_submit } from '@/legacy-api-handlers/v1/runtime/submit/route';

async function wrapper_post_runtime_submit(req: any, params: Record<string, string>) {
  return (post_runtime_submit as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/runtime/submit', wrapper_post_runtime_submit);
import { GET as get_runtime_telemetry } from '@/legacy-api-handlers/v1/runtime/telemetry/route';

async function wrapper_get_runtime_telemetry(req: any, params: Record<string, string>) {
  return (get_runtime_telemetry as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/runtime/telemetry', wrapper_get_runtime_telemetry);
import { POST as post_runtime_telemetry } from '@/legacy-api-handlers/v1/runtime/telemetry/route';

async function wrapper_post_runtime_telemetry(req: any, params: Record<string, string>) {
  return (post_runtime_telemetry as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/runtime/telemetry', wrapper_post_runtime_telemetry);
import { GET as get_runtime_id } from '@/legacy-api-handlers/v1/runtime/[id]/route';

async function wrapper_get_runtime_id(req: any, params: Record<string, string>) {
  return (get_runtime_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/runtime/:id', wrapper_get_runtime_id);
import { GET as get_student_achievements } from '@/legacy-api-handlers/v1/student/achievements/route';

async function wrapper_get_student_achievements(req: any, params: Record<string, string>) {
  return (get_student_achievements as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/achievements', wrapper_get_student_achievements);
import { GET as get_student_active_programme } from '@/legacy-api-handlers/v1/student/active-programme/route';

async function wrapper_get_student_active_programme(req: any, params: Record<string, string>) {
  return (get_student_active_programme as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/active-programme', wrapper_get_student_active_programme);
import { POST as post_student_archive } from '@/legacy-api-handlers/v1/student/archive/route';

async function wrapper_post_student_archive(req: any, params: Record<string, string>) {
  return (post_student_archive as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/student/archive', wrapper_post_student_archive);
import { GET as get_student_assignments } from '@/legacy-api-handlers/v1/student/assignments/route';

async function wrapper_get_student_assignments(req: any, params: Record<string, string>) {
  return (get_student_assignments as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/assignments', wrapper_get_student_assignments);
import { GET as get_student_bookmarks } from '@/legacy-api-handlers/v1/student/bookmarks/route';

async function wrapper_get_student_bookmarks(req: any, params: Record<string, string>) {
  return (get_student_bookmarks as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/bookmarks', wrapper_get_student_bookmarks);
import { POST as post_student_bookmarks } from '@/legacy-api-handlers/v1/student/bookmarks/route';

async function wrapper_post_student_bookmarks(req: any, params: Record<string, string>) {
  return (post_student_bookmarks as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/student/bookmarks', wrapper_post_student_bookmarks);
import { DELETE as delete_student_bookmarks_id } from '@/legacy-api-handlers/v1/student/bookmarks/[id]/route';

async function wrapper_delete_student_bookmarks_id(req: any, params: Record<string, string>) {
  return (delete_student_bookmarks_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.delete('/student/bookmarks/:id', wrapper_delete_student_bookmarks_id);
import { GET as get_student_current_assessment } from '@/legacy-api-handlers/v1/student/current-assessment/route';

async function wrapper_get_student_current_assessment(req: any, params: Record<string, string>) {
  return (get_student_current_assessment as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/current-assessment', wrapper_get_student_current_assessment);
import { GET as get_student_dashboard } from '@/legacy-api-handlers/v1/student/dashboard/route';

async function wrapper_get_student_dashboard(req: any, params: Record<string, string>) {
  return (get_student_dashboard as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/dashboard', wrapper_get_student_dashboard);
import { GET as get_student_diagnostic_attempt_id } from '@/legacy-api-handlers/v1/student/diagnostic/attempt/[id]/route';

async function wrapper_get_student_diagnostic_attempt_id(req: any, params: Record<string, string>) {
  return (get_student_diagnostic_attempt_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/diagnostic/attempt/:id', wrapper_get_student_diagnostic_attempt_id);
import { GET as get_student_diagnostic } from '@/legacy-api-handlers/v1/student/diagnostic/route';

async function wrapper_get_student_diagnostic(req: any, params: Record<string, string>) {
  return (get_student_diagnostic as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/diagnostic', wrapper_get_student_diagnostic);
import { POST as post_student_diagnostic_start } from '@/legacy-api-handlers/v1/student/diagnostic/start/route';

async function wrapper_post_student_diagnostic_start(req: any, params: Record<string, string>) {
  return (post_student_diagnostic_start as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/student/diagnostic/start', wrapper_post_student_diagnostic_start);
import { POST as post_student_enroll } from '@/legacy-api-handlers/v1/student/enroll/route';

async function wrapper_post_student_enroll(req: any, params: Record<string, string>) {
  return (post_student_enroll as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/student/enroll', wrapper_post_student_enroll);
import { GET as get_student_exam_target } from '@/legacy-api-handlers/v1/student/exam-target/route';

async function wrapper_get_student_exam_target(req: any, params: Record<string, string>) {
  return (get_student_exam_target as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/exam-target', wrapper_get_student_exam_target);
import { PATCH as patch_student_exam_target } from '@/legacy-api-handlers/v1/student/exam-target/route';

async function wrapper_patch_student_exam_target(req: any, params: Record<string, string>) {
  return (patch_student_exam_target as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/student/exam-target', wrapper_patch_student_exam_target);
import { GET as get_student_goals } from '@/legacy-api-handlers/v1/student/goals/route';

async function wrapper_get_student_goals(req: any, params: Record<string, string>) {
  return (get_student_goals as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/goals', wrapper_get_student_goals);
import { POST as post_student_goals } from '@/legacy-api-handlers/v1/student/goals/route';

async function wrapper_post_student_goals(req: any, params: Record<string, string>) {
  return (post_student_goals as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/student/goals', wrapper_post_student_goals);
import { PATCH as patch_student_goals_id } from '@/legacy-api-handlers/v1/student/goals/[id]/route';

async function wrapper_patch_student_goals_id(req: any, params: Record<string, string>) {
  return (patch_student_goals_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/student/goals/:id', wrapper_patch_student_goals_id);
import { GET as get_student_interventions } from '@/legacy-api-handlers/v1/student/interventions/route';

async function wrapper_get_student_interventions(req: any, params: Record<string, string>) {
  return (get_student_interventions as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/interventions', wrapper_get_student_interventions);
import { POST as post_student_interventions } from '@/legacy-api-handlers/v1/student/interventions/route';

async function wrapper_post_student_interventions(req: any, params: Record<string, string>) {
  return (post_student_interventions as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/student/interventions', wrapper_post_student_interventions);
import { PATCH as patch_student_interventions_id } from '@/legacy-api-handlers/v1/student/interventions/[id]/route';

async function wrapper_patch_student_interventions_id(req: any, params: Record<string, string>) {
  return (patch_student_interventions_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/student/interventions/:id', wrapper_patch_student_interventions_id);
import { GET as get_student_journey } from '@/legacy-api-handlers/v1/student/journey/route';

async function wrapper_get_student_journey(req: any, params: Record<string, string>) {
  return (get_student_journey as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/journey', wrapper_get_student_journey);
import { POST as post_student_journey } from '@/legacy-api-handlers/v1/student/journey/route';

async function wrapper_post_student_journey(req: any, params: Record<string, string>) {
  return (post_student_journey as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/student/journey', wrapper_post_student_journey);
import { GET as get_student_learning_plan } from '@/legacy-api-handlers/v1/student/learning-plan/route';

async function wrapper_get_student_learning_plan(req: any, params: Record<string, string>) {
  return (get_student_learning_plan as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/learning-plan', wrapper_get_student_learning_plan);
import { POST as post_student_learning_plan } from '@/legacy-api-handlers/v1/student/learning-plan/route';

async function wrapper_post_student_learning_plan(req: any, params: Record<string, string>) {
  return (post_student_learning_plan as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/student/learning-plan', wrapper_post_student_learning_plan);
import { GET as get_student_learning_profile } from '@/legacy-api-handlers/v1/student/learning-profile/route';

async function wrapper_get_student_learning_profile(req: any, params: Record<string, string>) {
  return (get_student_learning_profile as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/learning-profile', wrapper_get_student_learning_profile);
import { PATCH as patch_student_learning_profile } from '@/legacy-api-handlers/v1/student/learning-profile/route';

async function wrapper_patch_student_learning_profile(req: any, params: Record<string, string>) {
  return (patch_student_learning_profile as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/student/learning-profile', wrapper_patch_student_learning_profile);
import { GET as get_student_notifications_preferences } from '@/legacy-api-handlers/v1/student/notifications/preferences/route';

async function wrapper_get_student_notifications_preferences(req: any, params: Record<string, string>) {
  return (get_student_notifications_preferences as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/notifications/preferences', wrapper_get_student_notifications_preferences);
import { PATCH as patch_student_notifications_preferences } from '@/legacy-api-handlers/v1/student/notifications/preferences/route';

async function wrapper_patch_student_notifications_preferences(req: any, params: Record<string, string>) {
  return (patch_student_notifications_preferences as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/student/notifications/preferences', wrapper_patch_student_notifications_preferences);
import { GET as get_student_notifications } from '@/legacy-api-handlers/v1/student/notifications/route';

async function wrapper_get_student_notifications(req: any, params: Record<string, string>) {
  return (get_student_notifications as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/notifications', wrapper_get_student_notifications);
import { POST as post_student_notifications_id_read } from '@/legacy-api-handlers/v1/student/notifications/[id]/read/route';

async function wrapper_post_student_notifications_id_read(req: any, params: Record<string, string>) {
  return (post_student_notifications_id_read as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/student/notifications/:id/read', wrapper_post_student_notifications_id_read);
import { PATCH as patch_student_profile_avatar } from '@/legacy-api-handlers/v1/student/profile/avatar/route';

async function wrapper_patch_student_profile_avatar(req: any, params: Record<string, string>) {
  return (patch_student_profile_avatar as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/student/profile/avatar', wrapper_patch_student_profile_avatar);
import { GET as get_student_profile } from '@/legacy-api-handlers/v1/student/profile/route';

async function wrapper_get_student_profile(req: any, params: Record<string, string>) {
  return (get_student_profile as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/profile', wrapper_get_student_profile);
import { PATCH as patch_student_profile } from '@/legacy-api-handlers/v1/student/profile/route';

async function wrapper_patch_student_profile(req: any, params: Record<string, string>) {
  return (patch_student_profile as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/student/profile', wrapper_patch_student_profile);
import { GET as get_student_programmes } from '@/legacy-api-handlers/v1/student/programmes/route';

async function wrapper_get_student_programmes(req: any, params: Record<string, string>) {
  return (get_student_programmes as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/programmes', wrapper_get_student_programmes);
import { POST as post_student_programmes } from '@/legacy-api-handlers/v1/student/programmes/route';

async function wrapper_post_student_programmes(req: any, params: Record<string, string>) {
  return (post_student_programmes as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/student/programmes', wrapper_post_student_programmes);
import { PATCH as patch_student_programmes_id } from '@/legacy-api-handlers/v1/student/programmes/[id]/route';

async function wrapper_patch_student_programmes_id(req: any, params: Record<string, string>) {
  return (patch_student_programmes_id as any)(req, { params: Promise.resolve(params) });
}
apiRouter.patch('/student/programmes/:id', wrapper_patch_student_programmes_id);
import { GET as get_student_progress } from '@/legacy-api-handlers/v1/student/progress/route';

async function wrapper_get_student_progress(req: any, params: Record<string, string>) {
  return (get_student_progress as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/progress', wrapper_get_student_progress);
import { POST as post_student_readiness_recalculate } from '@/legacy-api-handlers/v1/student/readiness/recalculate/route';

async function wrapper_post_student_readiness_recalculate(req: any, params: Record<string, string>) {
  return (post_student_readiness_recalculate as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/student/readiness/recalculate', wrapper_post_student_readiness_recalculate);
import { GET as get_student_readiness } from '@/legacy-api-handlers/v1/student/readiness/route';

async function wrapper_get_student_readiness(req: any, params: Record<string, string>) {
  return (get_student_readiness as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/readiness', wrapper_get_student_readiness);
import { GET as get_student_results } from '@/legacy-api-handlers/v1/student/results/route';

async function wrapper_get_student_results(req: any, params: Record<string, string>) {
  return (get_student_results as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/results', wrapper_get_student_results);
import { GET as get_student_statistics } from '@/legacy-api-handlers/v1/student/statistics/route';

async function wrapper_get_student_statistics(req: any, params: Record<string, string>) {
  return (get_student_statistics as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/statistics', wrapper_get_student_statistics);
import { POST as post_student_study_session_end } from '@/legacy-api-handlers/v1/student/study-session/end/route';

async function wrapper_post_student_study_session_end(req: any, params: Record<string, string>) {
  return (post_student_study_session_end as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/student/study-session/end', wrapper_post_student_study_session_end);
import { POST as post_student_study_session_start } from '@/legacy-api-handlers/v1/student/study-session/start/route';

async function wrapper_post_student_study_session_start(req: any, params: Record<string, string>) {
  return (post_student_study_session_start as any)(req, { params: Promise.resolve(params) });
}
apiRouter.post('/student/study-session/start', wrapper_post_student_study_session_start);
import { GET as get_student_timeline } from '@/legacy-api-handlers/v1/student/timeline/route';

async function wrapper_get_student_timeline(req: any, params: Record<string, string>) {
  return (get_student_timeline as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/timeline', wrapper_get_student_timeline);
import { GET as get_student_weak_skills } from '@/legacy-api-handlers/v1/student/weak-skills/route';

async function wrapper_get_student_weak_skills(req: any, params: Record<string, string>) {
  return (get_student_weak_skills as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/student/weak-skills', wrapper_get_student_weak_skills);
import { GET as get_system_health_database } from '@/legacy-api-handlers/v1/system/health/database/route';

async function wrapper_get_system_health_database(req: any, params: Record<string, string>) {
  return (get_system_health_database as any)(req, { params: Promise.resolve(params) });
}
apiRouter.get('/system/health/database', wrapper_get_system_health_database);

export { apiRouter };