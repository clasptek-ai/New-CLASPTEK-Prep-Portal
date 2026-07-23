# Enterprise Sprint 2.2 Architecture Freeze

# Aggregate Catalogue

## Curriculum Aggregate

- Curriculum
- CurriculumVersion

## Programme Aggregate

- Programme
- ProgrammeVersion
- Course
- Subject
- Module
- Competency
- LearningObjective
- LearningOutcome

# Aggregate Relationships

CurriculumVersion -> ProgrammeVersion (mapping only)

# State Machine

Draft -> Under Review -> Approved -> Published -> Deprecated -> Archived

# Stable Repository Contracts

## CurriculumRepository

save
findById
findByCode
findPublished
findVersion
search
archive
restore
nextIdentity

## ProgrammeRepository

save
findById
findByCode
publish
search
duplicate
archive
nextIdentity

# Domain Events

CurriculumCreated
CurriculumPublished
ProgrammeAdded
CourseAdded
SubjectAdded
ModuleAdded
CompetencyAdded
LearningObjectiveAdded
LearningOutcomeAdded

# Database Freeze

Migration Range: 00200-00203

# API Freeze

Freeze all public/admin Curriculum endpoints as Sprint 2.2 contract baseline.

# Known Limitations

Learning Resources intentionally excluded.
