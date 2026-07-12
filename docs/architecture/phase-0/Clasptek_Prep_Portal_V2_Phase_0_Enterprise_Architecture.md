# CLASPTEK PREP PORTAL VERSION 2

## Phase 0 — Enterprise Product and Solution Architecture

**Document status:** Consolidated governing architecture  
**Document type:** Enterprise product, domain and solution architecture  
**Implementation code:** Excluded  
**SQL and physical database design:** Excluded  
**Planning horizon:** 5–10 years  
**Audience:** CTO, Enterprise Architects, Solution Architects, Database Architects, Backend Engineers, Frontend Engineers, AI Engineers, DevOps Engineers, QA Engineers and Product Managers

---

# 1. Purpose

This document consolidates the approved Phase 0 architecture for Clasptek Prep Portal Version 2.

It defines the platform’s product identity, business outcomes, domain boundaries, high-level solution architecture, security model, scalability approach, academic intelligence model and implementation roadmap.

It governs all later logical modelling and implementation work.

Phase 0 answers:

- What product is being built?
- What academic outcomes must it produce?
- Which business domains must exist?
- How do courses, enrollments, goals and preparation journeys relate?
- Which engines must be shared?
- How should AI be governed?
- How should the platform scale and remain maintainable?
- What must be resolved before Phase 1 begins?

Phase 0 does not define:

- SQL tables or migrations.
- Physical database schemas.
- API endpoint implementations.
- Frontend components.
- Deployment scripts.
- Application code.
- Final row-level security policies.

Those belong to Phase 0.5 and implementation phases.

---

# 2. Platform Positioning

Clasptek Prep Portal Version 2 is:

> **An AI-powered Examination Preparation Platform that combines structured learning, intelligent practice, standardized assessments, realistic exam simulations, AI-assisted evaluation, and personalized learning recommendations to improve exam readiness.**

The platform is not primarily a generic Learning Management System.

It may include LMS-like capabilities such as courses, lessons, resources, instructor feedback and announcements, but these are supporting capabilities.

The primary business objective is:

> **To improve the probability that a student will achieve a defined target result in a standardized examination by a planned examination date.**

Every major capability should support one or more of the following:

- Examination-skill mastery.
- Target-score achievement.
- Effective and adaptive practice.
- Assessment validity.
- Exam-simulation realism.
- Feedback quality.
- Readiness accuracy.
- Study-plan effectiveness.
- Student intervention.
- Academic operational quality.

---

# 3. Architectural North Star

The architecture must distinguish access, preparation, academic execution and outcomes.

## 3.1 Access

```text
Student
   ↓
Enrollment
   ↓
Course Offering
```

Enrollment controls access.

## 3.2 Preparation

```text
Enrollment
   ↓
Exam Goal
   ↓
Preparation Journey
   ↓
Diagnostic Assessment
   ↓
Competency Gap
   ↓
Learning Path
   ↓
Study Plan
   ↓
Learning Workspace
```

The Preparation Journey organizes the student’s complete exam-preparation experience.

## 3.3 Academic Execution

```text
Learning
   ↓
Adaptive Practice
   ↓
Assessment
   ↓
Exam Simulation
   ↓
Writing and Speaking Submission
   ↓
Evaluation
```

## 3.4 Examination Intelligence

```text
Academic Evidence
   ↓
Mastery
   ↓
Exam Readiness
   ↓
Recommendations
   ↓
Student Success Interventions
```

## 3.5 Final Position

The platform is:

- **Course-centred for content organisation.**
- **Enrollment-centred for entitlement and access.**
- **Preparation-Journey-centred for student progression.**
- **Exam-Readiness-centred for academic outcomes.**

These concepts must remain separate.

---

# 4. Canonical Terminology

| Term                  | Meaning                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Academy               | A business or organisational tenant operating on the platform.                                                       |
| Exam Product          | A standardized examination family such as IELTS Academic, SAT, TOEFL iBT or CELPIP General.                          |
| Exam Product Version  | A versioned specification of an exam product, including sections, timing, scoring and question formats.              |
| Course                | A structured preparation product created by an academy.                                                              |
| Course Version        | A versioned definition of a course.                                                                                  |
| Course Offering       | A scheduled or commercially available delivery of a course.                                                          |
| Enrollment            | The relationship granting a student access to a course offering.                                                     |
| Exam Goal             | The student’s target examination, target result and planned examination date.                                        |
| Preparation Journey   | The authoritative context connecting the goal, baseline, learning path, study plan, evidence, readiness and outcome. |
| Diagnostic Assessment | An assessment used to establish baseline performance and competency gaps.                                            |
| Competency Framework  | The academic model connecting exam sections, competencies, skills, subskills and observable indicators.              |
| Learning Path         | The personalised academic route through available learning and assessment activities.                                |
| Study Plan            | The scheduled execution of the Learning Path.                                                                        |
| Learning Workspace    | The active preparation environment generated for an enrolled course and Preparation Journey.                         |
| Academic Evidence     | A structured record of demonstrated academic performance.                                                            |
| Mastery               | A derived estimate of competence within a skill or subskill.                                                         |
| Exam Readiness        | A versioned estimate of target-result readiness under relevant exam conditions.                                      |
| Recommendation        | A ranked next-best academic activity.                                                                                |
| Exam Simulation       | A realistic representation of the target examination using configurable exam-specific policies.                      |
| Grade Decision        | The effective grade after automatic, AI-assisted and human evaluation.                                               |
| Student Success       | Monitoring and intervention focused on engagement, consistency, readiness and target achievement.                    |
| Academic Intelligence | Institution-level decision support for academic quality, readiness, courses, content, instructors and AI.            |

---

# 5. Executive Summary

The target platform should be implemented as a multi-academy, modular, database-first and API-first examination-preparation platform.

The recommended structure is a **modular monolith with separately deployable asynchronous workers**.

The platform should have:

1. One shared identity and academy model.
2. One course and enrollment model.
3. One Preparation Journey model.
4. One versioned Competency Framework.
5. One reusable learning architecture.
6. One governed Question Bank.
7. One shared Examination Delivery Kernel.
8. Separate policies for diagnostics, adaptive practice, assessment and simulation.
9. A provider-neutral AI Academic Intelligence layer.
10. An Academic Evidence and Mastery model.
11. Product-specific Exam Readiness models.
12. A transparent Recommendation Engine.
13. A Student Success intervention model.
14. A Learning Workspace instead of duplicated dashboards.
15. An Academic Operations Center instead of a generic admin portal.
16. Enterprise academic publishing and quality assurance.
17. Strong academy, course, enrollment and object-level authorization.
18. Immutable published academic versions.
19. Event-driven analytics and asynchronous intelligence.
20. A formal Phase 0.5 before production implementation.

---

# 6. Business Goals

## 6.1 Students

Students should be able to:

- Register and verify an account.
- Complete a profile.
- Be enrolled into one or more course offerings.
- Define an exam goal.
- Complete a diagnostic assessment.
- Receive a Learning Path and Study Plan.
- Enter a Learning Workspace for each active Preparation Journey.
- Study structured materials.
- Practise adaptively.
- Take assessments and realistic simulations.
- Submit writing and speaking tasks.
- Receive objective, AI-assisted and instructor-reviewed feedback.
- View competency mastery and readiness.
- Receive recommended next activities.
- Track preparation history and milestones.
- Receive support interventions.
- Record official exam outcomes.
- Continue preparation or begin a retake journey where necessary.

## 6.2 Instructors

Instructors should be able to:

- Access assigned academies, offerings and students.
- Upload authorised materials.
- Build questions and assessment content.
- Review academic evidence.
- Monitor mastery and readiness.
- Review AI-generated scores and feedback.
- Override grades with reasons.
- Assign activities.
- Intervene in at-risk journeys.

## 6.3 Academic Operations

Academic teams should be able to:

- Manage exam specifications.
- Manage competency frameworks.
- Create courses and offerings.
- Design Learning Paths.
- Govern question banks.
- Build practice, assessments and simulations.
- Manage academic review and publishing.
- Configure AI evaluation.
- Monitor delivery incidents and grading exceptions.
- Monitor student readiness.
- Analyse course, question, instructor and AI effectiveness.

## 6.4 Platform Owner

The platform owner should be able to:

- Manage academies.
- Configure global exam products.
- Manage global permissions.
- Configure integrations and AI providers.
- Monitor availability, cost and security.
- Manage feature flags.
- Enforce global academic standards.
- Add future examination products without redesigning the platform.

---

# 7. Product Success Model

The platform should distinguish four forms of progress.

## 7.1 Participation

Measures activity such as sessions, lessons opened, time spent and practice frequency.

Participation does not prove learning.

## 7.2 Learning Progress

Measures completion of assigned learning activities.

Learning completion does not prove exam readiness.

## 7.3 Mastery Progress

Measures demonstrated ability within competencies and subskills.

## 7.4 Exam Readiness

Measures whether the student is likely to achieve the target result under relevant exam conditions.

Readiness incorporates:

- Target result.
- Target exam date.
- Competency mastery.
- Timed performance.
- Assessment evidence.
- Simulation evidence.
- Writing and speaking evaluation.
- Consistency.
- Evidence recency.
- Evidence confidence.

Completion is supporting evidence, not the primary academic outcome.

---

# 8. Personas

The architecture must support:

- First-time examination student.
- Retake student.
- Teen SAT student.
- Working professional.
- Parent or sponsor.
- Instructor.
- Content Author.
- Academic Reviewer.
- Student Success Officer.
- Academy Administrator.
- Platform Super Administrator.
- Auditor and Support Officer.

---

# 9. Student Preparation Journey

```text
Prospect
   ↓
Registered
   ↓
Student Profile Completed
   ↓
Enrollment Activated
   ↓
Exam Goal Defined
   ↓
Preparation Journey Created
   ↓
Diagnostic Assigned
   ↓
Diagnostic Completed
   ↓
Baseline and Gap Analysis
   ↓
Learning Path Assigned
   ↓
Study Plan Generated
   ↓
Learning Workspace Activated
   ↓
Learning and Adaptive Practice
   ↓
Assessments and Simulations
   ↓
Academic Evidence and Mastery Updates
   ↓
Readiness Recalculation
   ↓
Recommendations
   ↓
Student Success Intervention if Required
   ↓
Target Readiness
   ↓
Official Exam Taken
   ↓
Outcome Review
   ↓
Target Achieved / Continued Preparation / Retake
```

The Student Relationship lifecycle, Enrollment lifecycle, Preparation Journey lifecycle and Official Result lifecycle must remain separate state models.

---

# 10. Business Domain Map

## 10.1 Identity and Access

Authentication, profiles, sessions, roles, consent, delegated access and security controls.

## 10.2 Student Relationship

Prospect, applicant, student, inactive-student and alumni relationships.

## 10.3 Academy

Tenant identity, branding, memberships and academy policies.

## 10.4 Exam Product and Specification

Exam products, versions, sections, timing, scoring, navigation, tools, accommodations and result scales.

## 10.5 Competency Framework

The academic spine connecting content, questions, evidence, mastery, readiness and recommendations.

## 10.6 Course and Offering

Courses, versions, offerings, cohorts, instructors and capabilities.

## 10.7 Enrollment

Time-bound entitlement to a course offering.

## 10.8 Goal Management

Target examination, target score, section targets, exam date, study availability and goal revisions.

## 10.9 Preparation Journey

The umbrella coordinating the student’s complete preparation effort.

## 10.10 Diagnostic Assessment

Baseline evidence, competency gaps, placement and path generation.

## 10.11 Learning Content

Curricula, modules, lessons, resources, prerequisites and release rules.

## 10.12 Learning Path

The personalised academic route through available activities.

## 10.13 Study Planning

The scheduled execution of the Learning Path.

## 10.14 Learning Workspace

A cross-domain preparation capability and read model, not an independent source of truth.

## 10.15 Content and Media

Files, assets, storage metadata, versions, access and retention.

## 10.16 Question Bank

Question identities, versions, stimuli, options, answers, rubrics and taxonomy.

## 10.17 Psychometrics and Item Quality

Difficulty, discrimination, distractors, timing, exposure and form quality.

## 10.18 Practice

Adaptive and fixed practice using the shared delivery kernel.

## 10.19 Assessment Definition

Assessment definitions, blueprints, forms, scoring and release policies.

## 10.20 Examination Delivery

Deliveries, attempts, responses, autosave, timing and submission.

## 10.21 Exam Simulation

Exam-specific behaviour, sequence, timing, tools, breaks and accommodations.

## 10.22 Grading and Evaluation

Objective scoring, AI grade runs, human review, override and effective grade decisions.

## 10.23 Academic Evidence

Structured academic observations produced by activities.

## 10.24 Mastery

Versioned estimates of skill and subskill competence.

## 10.25 Exam Readiness

Target-aware predicted scores, readiness states, confidence and readiness dates.

## 10.26 Recommendation Engine

Candidate generation, eligibility, ranking, explanation and outcome tracking.

## 10.27 AI Academic Intelligence

AI Evaluator, Tutor, Coach, Planner and Predictor.

## 10.28 Student Success

Engagement, consistency, readiness trajectory, risk and intervention.

## 10.29 Achievement and Milestones

Meaningful academic and consistency milestones.

## 10.30 Official Result and Outcome Review

Official results, target comparison and retake decisions.

## 10.31 Academic Publishing

Review, QA, pilot, approval, publication, retirement and archive.

## 10.32 Academic Operations

Academic work queues, delivery incidents, grading exceptions and quality oversight.

## 10.33 Academic Intelligence

Institution-level analysis of competencies, readiness, questions, content, instructors and AI.

## 10.34 Communication

Announcements, templates, preferences and delivery records.

## 10.35 Audit and Compliance

Immutable records of sensitive business, academic, AI and security actions.

## 10.36 Integration

Provider adapters, webhooks, mappings and integration jobs.

## 10.37 Platform Operations

Deployment, observability, feature flags, backup, security and platform health.

---

# 11. Preparation Journey Architecture

A Preparation Journey represents one student’s structured effort to achieve one exam objective.

It connects:

- Student.
- Enrollment.
- Exam Goal.
- Exam Product Version.
- Course Offering.
- Diagnostic Baseline.
- Learning Path.
- Study Plan.
- Academic Evidence.
- Readiness.
- Recommendations.
- Milestones.
- Official Outcome.

Recommended lifecycle:

```text
goal_definition_pending
→ baseline_pending
→ diagnostic_in_progress
→ path_generation_pending
→ foundation_building
→ skill_development
→ exam_focused_preparation
→ approaching_target
→ target_ready
→ exam_scheduled
→ exam_taken
→ result_pending
→ outcome_review
→ completed
```

Alternative states include paused, at_risk, abandoned, rescheduled, continuing_preparation and retake_planned.

---

# 12. Diagnostic Assessment Architecture

Diagnostics reuse the common Assessment and Delivery Kernel.

```text
Enrollment Activated
→ Journey Created
→ Diagnostic Assigned
→ Diagnostic Completed
→ Responses Evaluated
→ Evidence Recorded
→ Baseline Established
→ Competency Gaps Calculated
→ Learning Path Generated
→ Initial Study Plan Created
```

Supported diagnostic types:

- Full diagnostic.
- Section diagnostic.
- Skill diagnostic.
- Progressive diagnostic.
- Prior-result-supported diagnostic.

The diagnostic is baseline evidence, not a permanent label.

---

# 13. Goal Management

An Exam Goal may contain:

- Exam product and version.
- Target overall result.
- Target section results.
- Planned examination date.
- Application or institutional deadline.
- Available study hours.
- Preferred study days and periods.
- Known weaknesses.
- Previous attempts.
- Previous official results.

Material goal changes create new goal versions and may trigger:

- Learning Path review.
- Study Plan regeneration.
- Readiness recalculation.
- Recommendation recalculation.
- Intervention reprioritisation.

---

# 14. Competency Framework

The Competency Framework is the academic spine.

```text
Exam Product
   ↓
Exam Section
   ↓
Competency Area
   ↓
Skill
   ↓
Subskill
   ↓
Observable Indicator
```

Competencies map to:

- Learning objectives.
- Lessons.
- Questions.
- Assessment blueprints.
- Rubrics.
- AI feedback dimensions.
- Practice objectives.
- Evidence.
- Mastery.
- Readiness.
- Recommendations.
- Interventions.

Question type must not automatically be treated as a competency.

Competency frameworks are versioned by exam-product specification.

---

# 15. Learning Path and Study Planning

The curriculum defines what is available.

The Learning Path defines the student’s recommended route.

The Study Plan defines when the route should be executed.

```text
Course Curriculum
→ Available Activities
→ Diagnostic and Goal Analysis
→ Personalised Learning Path
→ Study Plan
→ Recommendations
→ Completed Activities and New Evidence
→ Path Review
```

The Study Plan considers:

- Exam date.
- Available hours.
- Preferred study periods.
- Prerequisites.
- Readiness gap.
- Assessment schedule.
- Missed work.
- Course-access expiry.

---

# 16. Learning Workspace

The Learning Workspace replaces a static course dashboard.

It is generated from:

- Enrollment.
- active Preparation Journey.
- course capabilities.
- course version.
- Learning Path.
- Study Plan.
- progress.
- mastery.
- readiness.
- recommendations.
- upcoming deliveries.
- announcements.
- permissions.

Workspace capabilities may include:

- Preparation Overview.
- Learning.
- Adaptive Practice.
- Assessments.
- Exam Simulations.
- AI Writing.
- AI Speaking.
- Performance.
- Exam Readiness.
- Recommendations.
- Study Plan.
- Announcements.
- Resources.
- Student Timeline.

Use typed capabilities and approved components rather than unrestricted page-builder JSON.

---

# 17. Question Bank

Core model:

```text
Question Item
   ↓
Question Version
   ↓
Stimulus / Passage / Media
   ↓
Prompt
   ↓
Response Configuration
   ↓
Answer Definition
   ↓
Explanation
   ↓
Rubric
   ↓
Competency and Taxonomy Mappings
```

Principles:

- Stable item identity.
- Immutable published versions.
- Reusable stimuli.
- Shared question-type registry.
- Relational core model.
- Controlled type-specific configuration.
- Answer-key isolation.
- Reviewer approval.
- Item-quality monitoring.
- Exposure control.

Lifecycle:

```text
draft
→ internal_review
→ academic_review
→ quality_assurance
→ pilot_testing
→ approved
→ published
→ retired
→ archived
```

---

# 18. Adaptive Practice

Practice is not random question selection.

Inputs include:

- Skill mastery.
- Readiness gap.
- Target score.
- Exam blueprint.
- Item difficulty.
- Previous attempts.
- Incorrect answers.
- Time since exposure.
- Response speed.
- Evidence confidence.
- Recent learning.
- Exposure limits.
- Available session duration.

Selection flow:

```text
Practice Objective
→ Required Competencies
→ Eligible Question Pool
→ Exposure and Recency Exclusions
→ Difficulty Matching
→ Priority Scoring
→ Content Balance
→ Session Assembly
→ Evidence and Mastery Update
```

Practice should optimise learning. Simulation should reproduce the target examination.

---

# 19. Unified Examination Architecture

Diagnostics, practice, assessment and simulation share one Examination Delivery Kernel.

```text
                 Examination Delivery Kernel
                  /       |       |       \
                 /        |       |        \
        Diagnostic   Practice  Assessment  Simulation
```

The shared kernel owns:

- Deliveries.
- Attempts.
- Responses.
- Autosave.
- Timers.
- Submission.
- Integrity.
- Grading hooks.

Each domain owns its own academic policies.

---

# 20. Assessment Architecture

```text
Assessment Definition
   ↓
Assessment Version
   ↓
Assessment Blueprint
   ↓
Assessment Form
   ↓
Assessment Delivery
   ↓
Student Attempt
   ↓
Responses
   ↓
Scoring and Evaluation
   ↓
Grade Decision
```

Policies may define:

- Sections.
- Question counts.
- Timing.
- Navigation.
- Backtracking.
- Attempt limits.
- Scoring.
- Feedback release.
- Answer release.
- Result release.
- Late submission.
- Resume policy.
- Accommodations.

Attempt lifecycle:

```text
created
→ started
→ in_progress
→ submitted
→ grading
→ reviewed
→ released
```

Exceptional states include expired, abandoned, invalidated and cancelled.

---

# 21. Exam Simulation Engine

Exam Simulation is a first-class domain built on the shared delivery kernel.

Each Exam Product Version may define a Simulation Policy Pack containing:

- Section and module sequence.
- Timing.
- Breaks.
- Navigation.
- Review behaviour.
- Adaptive routing.
- Media behaviour.
- Recording behaviour.
- On-screen tools.
- Accommodations.
- Interruption handling.
- Resume policy.
- Result conversion.
- Result presentation.

Quality assurance must validate structure, timing, tools, routing, media, accommodations and recovery behaviour before publication.

---

# 22. AI Academic Intelligence

AI capabilities must be separated by purpose and authority.

## 22.1 AI Evaluator

Grades writing and speaking, produces criterion-level scores and flags uncertainty.

## 22.2 AI Tutor

Explains concepts, provides guided examples and supports revision.

## 22.3 AI Coach

Explains patterns, encourages consistency and supports reflection.

## 22.4 AI Planner

Proposes and adjusts study schedules.

## 22.5 AI Predictor

Supports predicted scores, readiness trajectory and risk estimation.

All capabilities share:

- Provider gateway.
- Model registry.
- Prompt registry.
- Evaluation framework.
- Output validation.
- Cost tracking.
- Safety controls.
- Human-review thresholds.
- Audit.
- Retention.
- Incident handling.
- Rollback.

AI is never the system of record.

---

# 23. Academic Evidence and Mastery

Evidence may come from:

- Diagnostics.
- Practice.
- Assessments.
- Simulations.
- Writing evaluation.
- Speaking evaluation.
- Instructor evaluation.
- Learning checks.

Evidence should identify:

- Student.
- Enrollment.
- Preparation Journey.
- Exam Goal.
- Source activity.
- Competency.
- Score or observation.
- Difficulty.
- Timed status.
- Exam-fidelity level.
- Reliability.
- Recency.
- Grader or model version.

Mastery is derived from evidence and should include estimate, confidence, coverage, trend and model version.

Mastery must not be an unexplained mutable percentage.

---

# 24. Exam Readiness

Readiness estimates target-result achievement under relevant exam conditions.

Inputs:

- Target result.
- Target date.
- Comparable scores.
- Competency mastery.
- Timed performance.
- Simulation performance.
- Writing and speaking performance.
- Consistency.
- Recency.
- Coverage.
- Confidence.
- Study trajectory.

Outputs:

- Current score.
- Target score.
- Predicted score and range.
- Band or scale interpretation.
- Weak skills.
- Strong skills.
- Readiness indicator.
- Confidence level.
- Estimated readiness date.
- Recommended activities.

Recommended readiness states:

```text
insufficient_evidence
foundation_building
developing
approaching_target
target_ready
high_confidence_ready
at_risk
```

Readiness models must be product-specific, versioned, explainable and validated.

---

# 25. Recommendation Engine

Inputs include:

- Practice history.
- Assessment history.
- Simulation history.
- AI evaluation.
- Mastery.
- Readiness.
- Missed questions.
- Time spent.
- Study Plan.
- Learning progress.
- Exam date.
- Available activities.
- Instructor priority.

Outputs include:

- Next lesson.
- Next practice session.
- Next assessment.
- Revision topic.
- Writing exercise.
- Speaking exercise.
- Simulation.
- Study-plan adjustment.

Architecture:

```text
Academic and Engagement Evidence
→ Candidate Generation
→ Eligibility Rules
→ Academic Priority Ranking
→ Workload and Diversity Constraints
→ Explanation
→ Workspace Presentation
→ Outcome Tracking
```

The initial engine should be transparent and rules-based, evolving to hybrid and predictive approaches only after reliable data is available.

---

# 26. Student Success

Student Success monitors whether preparation is progressing effectively.

Signals include:

- Engagement.
- Consistency.
- Missed work.
- Declining scores.
- Abandoned simulations.
- Readiness stagnation.
- Exam-date urgency.
- Target gap.
- Enrollment expiry.

Intervention lifecycle:

```text
detected
→ validated
→ assigned
→ student_contacted
→ action_plan_created
→ monitoring
→ resolved
```

Alternative states include dismissed, duplicate, unreachable, escalated and closed_without_resolution.

Student and administrator views should emphasise readiness trajectory, weak competencies, study-plan adherence, intervention priorities and improvement velocity.

---

# 27. Student Timeline and Achievements

The Student Timeline is a cross-domain projection of selected events, including:

- Enrollment activation.
- Goal creation.
- Diagnostic completion.
- Learning Path assignment.
- Practice completion.
- Assessment submission.
- AI feedback release.
- Simulation completion.
- Readiness changes.
- Recommendations.
- Milestones.

It is not a new source of truth.

Achievements should recognise verified academic progress and consistency, not unhealthy or meaningless activity.

---

# 28. Parent and Sponsor Access

Sponsor access should be designed from the beginning even if implemented later.

Subject to consent and policy, sponsors may view:

- Enrollment status.
- Engagement summary.
- Progress.
- Readiness.
- Study-plan adherence.
- Upcoming deadlines.
- Approved comments.
- Payment status where authorised.

Sponsors should not automatically access hidden answers, detailed responses, private AI conversations, instructor-only notes, raw recordings or unrelated enrollments.

Access must be delegated, scoped, time-bound, revocable and audited.

---

# 29. Academic Operations Center

The administration experience should be an Academic Operations Center containing:

- Academic Dashboard.
- Course Management.
- Learning Management.
- Competency Framework.
- Question Bank.
- Assessment Builder.
- Practice Builder.
- Exam Simulation Builder.
- AI Management.
- Content Review.
- Academic Publishing.
- Academic Intelligence.
- Student Success.
- Exam Readiness.
- System Monitoring.

The purpose is not merely to manage records. It is to govern academic quality, readiness, delivery and outcomes.

---

# 30. Enterprise Academic Publishing

Lifecycle:

```text
Draft
→ Internal Review
→ Academic Review
→ Quality Assurance
→ Pilot Testing
→ Approval
→ Publication
→ Retirement
→ Archive
```

A critical version may be withdrawn before normal retirement.

Risk tiers:

| Tier   | Example                                 | Controls                                     |
| ------ | --------------------------------------- | -------------------------------------------- |
| Tier 1 | Supplementary resource                  | Internal review and approval                 |
| Tier 2 | Practice content                        | Academic review and QA                       |
| Tier 3 | Scored assessment or simulation         | Full lifecycle                               |
| Tier 4 | Rubric, scoring, readiness or AI policy | Independent evaluation and monitored rollout |

Published academic content must be immutable.

---

# 31. High-Level Solution Architecture

```text
Students / Instructors / Administrators / Sponsors
                        |
                    CDN + WAF
                        |
                Web Experience Layer
       Learning Workspace | Academic Operations
                        |
             Backend-for-Frontend API Layer
                        |
              Application Service Modules
----------------------------------------------------------
Identity | Academy | Course | Enrollment | Journey
Learning | Question Bank | Assessment | Simulation
Evidence | Mastery | Readiness | Recommendation
AI | Student Success | Academic Operations | Audit
----------------------------------------------------------
           |               |                |
      PostgreSQL      Object Storage      Cache
           |
     Transactional Outbox / Queue
           |
        Asynchronous Workers
----------------------------------------------------------
AI Evaluation | Transcription | Readiness
Recommendations | Notifications | Imports
Analytics Projections | File Scanning
----------------------------------------------------------
           |
 External AI / Email / SMS / Storage Integrations
```

The browser must not decide authorization, eligibility, timing validity, correct answers, official grades, readiness or recommendation ranking.

---

# 32. Modular Monolith Recommendation

Use a modular monolith with separately deployable asynchronous workers.

This provides:

- Strong transaction boundaries.
- Lower operational complexity.
- Simpler observability.
- Reduced infrastructure duplication.
- Clear domain boundaries.
- Independent worker scaling.
- Future extraction paths.

Potential future service extractions:

- AI Grading.
- Media Processing.
- Notifications.
- Reporting and Export.
- Analytics Pipeline.

A module should become a service only when independent scaling, ownership, runtime or regulatory isolation is demonstrated.

---

# 33. Technology Stack Recommendation

| Layer           | Recommendation                                                            |
| --------------- | ------------------------------------------------------------------------- |
| Web             | Next.js, React and TypeScript                                             |
| UI              | Tailwind CSS and a governed accessible component system                   |
| Core backend    | TypeScript application services                                           |
| Database        | Managed PostgreSQL through Supabase                                       |
| Authentication  | Supabase Auth with secure server-side sessions                            |
| Database design | SQL-first migrations and generated types                                  |
| Storage         | Private object storage behind an adapter                                  |
| Queue           | Managed queue initially                                                   |
| Workers         | Containerised Node.js/TypeScript workers                                  |
| Cache           | Managed Redis where justified                                             |
| AI              | Provider-neutral AI gateway                                               |
| Observability   | OpenTelemetry-compatible platform                                         |
| Testing         | Unit, database, integration, contract, browser, load and security testing |
| Infrastructure  | Infrastructure as code                                                    |
| Delivery        | Automated CI/CD with controlled migrations                                |

The database schema is authoritative.

The browser must never receive privileged service credentials.

---

# 34. Folder Architecture

```text
clasptek-prep-v2/
|
|-- apps/
|   |-- web/
|   `-- worker/
|
|-- packages/
|   |-- domain/
|   |-- application/
|   |-- contracts/
|   |-- database/
|   |-- authorization/
|   |-- integrations/
|   |-- observability/
|   |-- validation/
|   |-- ui/
|   `-- configuration/
|
|-- database/
|   |-- migrations/
|   |-- policies/
|   |-- functions/
|   |-- views/
|   `-- tests/
|
|-- infrastructure/
|-- docs/
`-- scripts/
```

Dependency direction:

```text
UI → Application → Domain
Infrastructure → Application Interfaces
Domain → No External Dependencies
```

---

# 35. API Architecture

Use versioned REST-style business APIs with formal contracts.

Important actions should be commands, not unrestricted CRUD.

Examples:

- Activate Enrollment.
- Create Preparation Journey.
- Assign Learning Path.
- Generate Recommendation.
- Start Attempt.
- Save Response.
- Submit Attempt.
- Release Grade.
- Override Grade.
- Record Official Result.

API principles:

- Versioned contracts.
- Explicit authorization.
- Idempotent commands.
- Cursor pagination.
- Stable error codes.
- No answer-key exposure.
- No provider-payload leakage.
- Correlation identifiers.
- Contract tests.
- Deprecation policy.

---

# 36. Authentication and Authorization

Authentication should support:

- Email and password.
- Verification.
- Password recovery.
- Optional federated identity.
- Mandatory MFA for privileged staff.
- Session revocation.
- Secure server-side sessions.
- Login-event monitoring.

Authorization should combine RBAC and ABAC.

Roles may include:

- Platform Super Administrator.
- Academy Owner.
- Academy Administrator.
- Academic Manager.
- Content Author.
- Academic Reviewer.
- Instructor.
- Grader.
- Student Success Officer.
- Support Officer.
- Auditor.
- Student.
- Sponsor.

Authorization attributes include academy membership, course assignment, offering assignment, enrollment, ownership, content state, attempt state, time-based access and sponsor scope.

A role alone never grants unrestricted access.

---

# 37. Database Architecture

Use one managed PostgreSQL cluster initially with domain-oriented logical namespaces.

Suggested namespaces:

```text
identity
academy
exam_specification
competency
course
enrollment
goal
journey
diagnostic
learning
learning_path
content
question_bank
psychometrics
assessment
practice
simulation
delivery
grading
academic_evidence
mastery
readiness
recommendation
student_success
achievement
academic_publishing
academic_operations
analytics
communication
ai
integration
audit
api
```

Use shared-schema tenancy with academy scoping.

Do not create:

- One database per academy.
- One schema per academy.
- Duplicated tables per exam product.
- Duplicated tables per course.
- Separate attempt and response tables for practice, assessment and mock examinations.

Use relational normalization for core transactional data.

JSON should be limited to genuinely variable configuration and external provider metadata.

---

# 38. File and Media Architecture

Private object storage should manage:

- Images.
- Reading passages.
- PDFs.
- Audio.
- Videos.
- Essays.
- Speaking recordings.
- Certificates.
- Retained AI artifacts where justified.

Requirements:

- Private access by default.
- Signed access.
- File-type validation.
- Malware scanning.
- Metadata and ownership.
- Versioning.
- Retention policies.
- Access audit.
- Orphan-file reconciliation.
- Lifecycle management.

The database stores metadata and relationships, not large binary files.

---

# 39. Analytics and Academic Intelligence

Operational analytics includes active users, current attempts, queue depth, failures, latency and autosave health.

Academic Intelligence includes:

- Weak competencies.
- Readiness distribution.
- Target-achievement trends.
- Course effectiveness.
- Learning Path effectiveness.
- Question quality.
- Distractor analysis.
- AI-human agreement.
- Instructor impact.
- Intervention effectiveness.
- Recommendation effectiveness.
- Simulation performance.

Analytics and workspace records are rebuildable projections, not authoritative transactional data.

---

# 40. Notification Architecture

Supported channels may include in-app, email, push and selected messaging channels.

Notifications should be event-driven.

Examples:

- Enrollment activated.
- Diagnostic assigned.
- Study-plan reminder.
- Assessment scheduled.
- Feedback released.
- Readiness changed.
- Intervention opened.
- Course access expiring.
- Security event.

Requirements include preferences, template versioning, retries, deduplication, delivery status and restricted use of sensitive academic data.

---

# 41. Security Architecture

Security covers identity, sessions, APIs, database, storage, queues, AI, administration, deployment, logging and backup.

Core controls:

- Least privilege.
- Staff MFA.
- Row-level security.
- Object-level authorization.
- Rate limiting.
- WAF.
- Input validation.
- Output encoding.
- CSRF protection.
- Secure headers.
- Secret management.
- Dependency scanning.
- Malware scanning.
- Encryption.
- Private storage.
- Short-lived signed URLs.
- Audit logging.
- Security monitoring.

Answer keys must remain in restricted data structures and be graded server-side.

AI controls should include prompt-injection defences, context minimisation, output validation, provider isolation and active-assessment restrictions.

---

# 42. Logging and Audit

Operational logs should be structured and correlated by request, trace and job identifiers.

They must not contain passwords, tokens, answer keys, full essays, raw audio or provider secrets.

Audit records should capture:

- Actor.
- Role.
- Academy.
- Action.
- Entity.
- Previous and new state.
- Reason.
- Request.
- Time.
- Security context.

Audit records should be append-only, searchable and retention-controlled.

---

# 43. Backup and Recovery

Baseline requirements:

- Point-in-time recovery.
- Automated daily backup.
- Weekly logical export.
- Monthly archived backup.
- Encrypted separate-account or cross-region copy.
- Object versioning.
- Lifecycle policies.
- Quarterly restore testing.
- Recovery runbooks.

Initial targets:

| Measure                   | Target               |
| ------------------------- | -------------------- |
| Database RPO              | 15 minutes or better |
| Core platform RTO         | 4 hours              |
| Student-response priority | Highest              |
| AI grading recovery       | Reprocessable        |
| Analytics recovery        | Rebuildable          |

A backup is valid only after restoration testing.

---

# 44. Performance Strategy

Recommended service objectives:

| Operation          | Target                     |
| ------------------ | -------------------------- |
| Standard page      | P95 below 2 seconds        |
| Standard API read  | P95 below 500 milliseconds |
| Standard command   | P95 below 800 milliseconds |
| Response autosave  | P95 below 500 milliseconds |
| Objective scoring  | Below 5 seconds            |
| AI writing result  | Normally below 2 minutes   |
| AI speaking result | Normally below 5 minutes   |

Performance techniques include appropriate indexes, query-plan review, cursor pagination, read projections, stable metadata caching, pre-resolved forms, incremental loading, changed-response autosave, asynchronous AI work, connection pooling and CDN delivery.

---

# 45. Scalability Strategy

## Stage 1

Managed PostgreSQL, stateless web instances, workers, object storage, CDN, connection pool and selected caching.

## Stage 2

Horizontal web scaling, queue-depth worker scaling, reporting replicas, read projections and workload isolation.

## Stage 3

Partition high-volume event and audit data only where evidence supports it.

## Stage 4

Extract selected services where independent ownership or scaling is demonstrated.

## Stage 5

Introduce tenant sharding only for demonstrated scale, residency or isolation requirements.

---

# 46. Risk Analysis

| Risk                                            | Impact   | Mitigation                                 |
| ----------------------------------------------- | -------- | ------------------------------------------ |
| Recreating separate exam engines                | Critical | Shared Examination Delivery Kernel         |
| Treating Course as the complete student journey | High     | Preparation Journey                        |
| Tenant data leakage                             | Critical | RLS, ABAC and isolation tests              |
| Answer-key exposure                             | Critical | Restricted storage and server-side grading |
| AI inconsistency                                | High     | Evaluation, confidence and human review    |
| AI provider outage                              | High     | Queues, retries and fallback               |
| AI cost escalation                              | High     | Budgets and routing                        |
| Weak question quality                           | High     | Publishing, pilots and psychometrics       |
| Editing published content                       | High     | Immutable versions                         |
| Autosave failure                                | Critical | Idempotency and reconnect recovery         |
| Analytics affecting live exams                  | High     | Projections and workload isolation         |
| Administrator mistakes                          | Medium   | Review, validation and audit               |
| Large imports blocking production               | High     | Asynchronous import processing             |
| Premature microservices                         | High     | Modular monolith                           |
| Excessive JSON modelling                        | High     | Relational-first governance                |
| Weak readiness claims                           | High     | Confidence, evidence and validation        |
| Sponsor privacy leakage                         | Critical | Delegated and scoped access                |
| Unhealthy gamification                          | Medium   | Academic-value milestone rules             |

---

# 47. Deployment Architecture

Maintain separate local, development, staging and production environments.

Each environment must separate:

- Database.
- Authentication.
- Storage.
- Queues.
- Secrets.
- AI credentials.
- Notification providers.
- Observability.

Deployment requires automated builds, tests, migration validation, security checks, staging verification, smoke tests, controlled production release, rollback procedures and feature flags.

Database changes should use backward-compatible expand-and-contract migration patterns.

---

# 48. Development Standards

Every feature must include:

- Business acceptance criteria.
- Domain ownership.
- Authorization rules.
- Database impact.
- API contract.
- UI states.
- Error handling.
- Audit requirements.
- Analytics events.
- Accessibility review.
- Automated tests.
- Monitoring.
- Rollback.

Required testing layers:

1. Domain unit tests.
2. Application-service tests.
3. Database constraint tests.
4. RLS tests.
5. API contract tests.
6. Integration tests.
7. Browser end-to-end tests.
8. Load tests.
9. Security tests.
10. Migration tests.
11. AI evaluation tests.

---

# 49. Programme Roadmap

## Phase -1 — Product Strategy and Domain Discovery

- Product vision.
- Market and segment analysis.
- Personas.
- Journey maps.
- Competitive capability analysis.
- Business Capability Map.
- One-year and three-year roadmaps.
- Success metrics.
- Feature prioritisation.
- Glossary.
- Assumption register.

## Phase 0 — Enterprise Product and Solution Architecture

This document.

## Phase 0.5 — Canonical Domain, Data, Security and Contract Design

- Canonical Domain Model.
- Logical ER model.
- Data Dictionary.
- Domain Ownership Matrix.
- Event and Command Catalogues.
- State Machines.
- Permission and RLS Matrices.
- API Contracts.
- Naming and indexing standards.
- Versioning and migration strategy.

## Phase 1 — Platform Foundation

Repository, environments, CI/CD, migrations, observability, design system and feature flags.

## Phase 2 — Identity, Academy and Authorization

## Phase 3 — Exam Specification, Course, Enrollment and Goals

## Phase 4 — Preparation Journey, Diagnostics and Learning Workspace

## Phase 5 — Competencies, Learning Paths and Question Bank

## Phase 6 — Unified Examination Definition and Delivery

## Phase 7 — Adaptive Practice and Standard Assessments

## Phase 8 — Exam Simulation

## Phase 9 — AI Evaluation and AI Learning Capabilities

## Phase 10 — Readiness, Recommendations, Student Success and Academic Intelligence

## Phase 11 — Migration, Hardening and Production Launch

---

# 50. Architecture Decision Records

## ADR-001 — Examination-Preparation Positioning

Build an AI-powered Examination Preparation Platform rather than a generic LMS.

## ADR-002 — Preparation Journey

Use Preparation Journey as the academic umbrella for goal, baseline, path, plan, readiness and outcome.

## ADR-003 — Course and Enrollment

Courses organise content; enrollments control access.

## ADR-004 — Exam Readiness

Readiness is the primary academic outcome; completion is subordinate.

## ADR-005 — Modular Monolith

Use a modular monolith with independent workers.

## ADR-006 — Unified Examination Delivery

Diagnostics, practice, assessment and simulation share attempts, responses, timing and submission infrastructure.

## ADR-007 — Competency Framework

Competencies form the academic spine.

## ADR-008 — Diagnostics

Personalisation begins with baseline evidence.

## ADR-009 — Learning Paths

The curriculum defines availability; the Learning Path defines the student route.

## ADR-010 — Study Plans

Study Plans schedule Learning Paths.

## ADR-011 — Learning Workspace

Use a dynamic preparation workspace rather than duplicated exam-product dashboards.

## ADR-012 — Adaptive Practice

Practice selection is mastery-, difficulty-, recency- and target-aware.

## ADR-013 — Exam Simulation

Simulation is a first-class domain built on shared delivery capabilities.

## ADR-014 — Academic Evidence

Mastery and readiness derive from structured evidence.

## ADR-015 — Provider-Neutral AI

AI providers are accessed through internal contracts and adapters.

## ADR-016 — AI Roles

Evaluator, Tutor, Coach, Planner and Predictor have different authority and controls.

## ADR-017 — AI Is Not the System of Record

AI outputs do not replace authoritative grades, policies or structured data.

## ADR-018 — Recommendation Engine

Recommendations use transparent eligibility and ranking policies.

## ADR-019 — Student Success

Risks and opportunities create governed intervention workflows.

## ADR-020 — Academic Operations Center

Administration is organised around academic quality, delivery and outcomes.

## ADR-021 — Academic Publishing

High-impact content uses review, QA, pilot testing and approval.

## ADR-022 — Immutable Publication

Published academic versions are never edited in place.

## ADR-023 — Shared PostgreSQL

Use one managed relational system of record with academy scoping.

## ADR-024 — Relational-First Modelling

Core business relationships remain normalized and relational.

## ADR-025 — RBAC and ABAC

Authorization combines roles with academy, course, enrollment, ownership and state attributes.

## ADR-026 — Private Storage

Restricted media and submissions use private object storage.

## ADR-027 — Transactional Outbox

Asynchronous side effects originate from transactional domain events.

## ADR-028 — Analytics as Projections

Analytics, timelines and workspaces use rebuildable read models.

## ADR-029 — Sponsor Access

Sponsor access is delegated, consent-based and field-restricted.

## ADR-030 — Target Achievement

Use target-achievement semantics rather than universal pass/fail.

## ADR-031 — Progressive Scaling

Scale from evidence rather than premature service fragmentation or sharding.

## ADR-032 — Phase 0.5 Gate

Canonical logical design must be approved before production implementation.

---

# 51. Phase 0 Completion Criteria

Phase 0 is complete only when the following are approved:

## Product

- Examination-preparation positioning.
- Launch exam products.
- Primary value proposition.
- Readiness as the principal outcome.

## Domains

- Preparation Journey.
- Goal Management.
- Diagnostic Assessment.
- Competency Framework.
- Learning Path.
- Study Planning.
- Exam Simulation.
- Academic Evidence.
- Mastery.
- Exam Readiness.
- Recommendation Engine.
- AI Academic Intelligence.
- Student Success.
- Academic Intelligence.
- Sponsor Relationship.

## Experience

- Learning Workspace.
- Student Timeline.
- Academic Operations Center.

## Governance

- Academic publishing lifecycle.
- AI governance principles.
- Target-achievement semantics.
- Phase 0.5 scope.
- Architecture Decision Records.

---

# 52. Phase 1 Readiness Gate

Phase 1 should not begin until Phase 0.5 is complete and the following decisions have accountable owners and approvals:

1. Launch exam-product specifications.
2. Competency Framework Version 1.
3. Preparation Journey state model.
4. Diagnostic policy.
5. Learning Path policy.
6. Readiness Model Version 1.
7. Adaptive Practice Policy Version 1.
8. AI evaluation and review thresholds.
9. Sponsor, minor and consent policy.
10. Data-retention policy.
11. Security and RLS design.
12. Migration inventory.
13. Non-functional targets.
14. Official Result verification policy.
15. Domain ownership assignments.

Prototype work may validate assumptions, but prototype structures must not silently become production architecture.

---

# 53. Final Architectural Definition

Clasptek Prep Portal Version 2 must not follow:

```text
Student
→ Course
→ Content
→ Completion
```

It must follow:

```text
Student
→ Enrollment
→ Exam Goal
→ Preparation Journey
→ Diagnostic Baseline
→ Competency Gap
→ Learning Path
→ Study Plan
→ Learning Workspace
→ Adaptive Academic Activity
→ Academic Evidence
→ Mastery
→ Exam Readiness
→ Recommendation
→ Target Achievement
```

The course remains essential, but it serves the Preparation Journey.

The platform should always be able to explain:

- Where the student started.
- What the student is trying to achieve.
- Which competencies require attention.
- Which route has been assigned.
- What the student has demonstrated.
- How ready the student is.
- What the student should do next.
- Whether the target was achieved.

This is the governing Phase 0 architecture of Clasptek Prep Portal Version 2.
