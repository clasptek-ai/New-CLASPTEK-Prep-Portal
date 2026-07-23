# Sprint 2.7 Rollback Runbook

### Rollback Procedure

1. Checkout pre-sprint baseline git tag:
   `git checkout pre-sprint-2.7-mock-engine`
2. Drop Sprint 2.7 database tables:
   ```sql
   DROP TABLE IF EXISTS mock_statistics CASCADE;
   DROP TABLE IF EXISTS mock_readiness CASCADE;
   DROP TABLE IF EXISTS mock_reports CASCADE;
   DROP TABLE IF EXISTS mock_results CASCADE;
   DROP TABLE IF EXISTS mock_section_scores CASCADE;
   DROP TABLE IF EXISTS mock_attempt_answers CASCADE;
   DROP TABLE IF EXISTS mock_attempts CASCADE;
   DROP TABLE IF EXISTS mock_sessions CASCADE;
   DROP TABLE IF EXISTS mock_template_sections CASCADE;
   DROP TABLE IF EXISTS mock_templates CASCADE;
   DROP TABLE IF EXISTS mock_blueprints CASCADE;
   ```
3. Remove workspace packages `@clasptek/domain-mock-examination` and `@clasptek/application-mock-examination`.
