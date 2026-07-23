# @clasptek/domain-student-learning Package Manifest

## Domain Bounded Context

Student Learning Journey Domain

## Domain Boundaries

- Owns `StudentLearningJourney` aggregate, student streak counts, achievements definitions & logs, bookmark logs, milestones, goals, competencies progress and historical audit trails, study sessions, and privacy consent logs.
- Owns `StudentProgrammeEnrollment` aggregate (delivery mode, cohort intake, completion certificate, and withdrawal lifecycle).
- Owns `LearningPlan` aggregate (versioned study configurations, goals and schedules sourced from student, instructor, or AI).
- Decoupled from assessment runtime and curriculum metadata authoring.
