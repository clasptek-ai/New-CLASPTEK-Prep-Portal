# Sprint 2.7 Security & RLS Matrix

| DB Table          | Authenticated Student             | Academic Instructor     | System Admin            |
| ----------------- | --------------------------------- | ----------------------- | ----------------------- |
| `mock_blueprints` | No Access                         | Full Authoring (`ALL`)  | Full Management (`ALL`) |
| `mock_templates`  | `SELECT` (`status = 'PUBLISHED'`) | Full Management (`ALL`) | Full Management (`ALL`) |
| `mock_sessions`   | `student_id = auth.uid()`         | `SELECT` All Sessions   | Full Management (`ALL`) |
| `mock_attempts`   | `student_id = auth.uid()`         | `SELECT` All Attempts   | Full Management (`ALL`) |
| `mock_results`    | `student_id = auth.uid()`         | `SELECT` All Results    | Full Management (`ALL`) |
| `mock_reports`    | `student_id = auth.uid()`         | `SELECT` All Reports    | Full Management (`ALL`) |
| `mock_readiness`  | `student_id = auth.uid()`         | `SELECT` All Readiness  | Full Management (`ALL`) |
