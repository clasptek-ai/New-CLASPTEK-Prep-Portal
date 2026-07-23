# Sprint 2.5 Addendum Security & RLS Matrix

| Role                         | `student_learning_profiles`             | `student_progress` | `student_interventions` | `intervention_rules` | `student_alerts`          |
| ---------------------------- | --------------------------------------- | ------------------ | ----------------------- | -------------------- | ------------------------- |
| **Student**                  | READ / WRITE (Own row via `auth.uid()`) | READ (Own row)     | READ (Own rows)         | READ (Active rules)  | READ / WRITE (Own alerts) |
| **Facilitator / Instructor** | READ                                    | READ               | READ / WRITE            | READ                 | READ                      |
| **Academic Reviewer**        | READ                                    | READ               | READ / WRITE            | READ / WRITE         | READ                      |
| **Program Manager**          | READ                                    | READ               | READ                    | READ / WRITE         | READ                      |
| **Admin / Super Admin**      | ALL (Bypass)                            | ALL (Bypass)       | ALL (Bypass)            | ALL (Bypass)         | ALL (Bypass)              |
