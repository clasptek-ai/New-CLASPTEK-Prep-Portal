# @clasptek/domain-question-bank Package Manifest

## Domain Bounded Context

Question Bank & Assessment Authoring Domain

## Domain Boundaries

- Owns `Question`, `QuestionVersion`, `AnswerOption`, `Solution`, `Rubric`, `QuestionMedia`, `QuestionStatistics`, `QuestionOwnership`, and `QuestionDependency`.
- Owns `ReviewRequest` workflow, reviewer comments, automated validations, and history logs in `QuestionReview`.
- Decoupled from assessment attempts and delivery runtimes.
