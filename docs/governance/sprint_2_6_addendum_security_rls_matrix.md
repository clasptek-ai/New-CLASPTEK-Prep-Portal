# Sprint 2.6 Addendum — Security & RLS Matrix

| Database Table                   | RLS Policy Name                 | Permitted Roles             | Policy Condition                 |
| -------------------------------- | ------------------------------- | --------------------------- | -------------------------------- |
| `practice_goals`                 | `practice_goals_isolation`      | Student                     | `student_id = auth.uid()`        |
| `practice_goals`                 | `admin_practice_goals_bypass`   | Admin, Instructor, Reviewer | `auth.jwt() ->> 'role' IN (...)` |
| `retention_profiles`             | `retention_profiles_isolation`  | Student                     | `student_id = auth.uid()`        |
| `retention_profiles`             | `admin_retention_bypass`        | Admin, Instructor, Reviewer | `auth.jwt() ->> 'role' IN (...)` |
| `daily_goals`                    | `daily_goals_isolation`         | Student                     | `student_id = auth.uid()`        |
| `daily_goals`                    | `admin_daily_goals_bypass`      | Admin, Instructor, Reviewer | `auth.jwt() ->> 'role' IN (...)` |
| `practice_motivation`            | `practice_motivation_isolation` | Student                     | `student_id = auth.uid()`        |
| `practice_motivation`            | `admin_motivation_bypass`       | Admin, Instructor, Reviewer | `auth.jwt() ->> 'role' IN (...)` |
| `practice_analytics_projections` | `practice_analytics_isolation`  | Student                     | `student_id = auth.uid()`        |
| `practice_analytics_projections` | `admin_analytics_bypass`        | Admin, Instructor, Reviewer | `auth.jwt() ->> 'role' IN (...)` |
