# @clasptek/domain-adaptive-practice Package Manifest

## Domain Bounded Context
Adaptive Practice Domain

## Domain Boundaries
- Owns `PracticeRecommendation` aggregate root (recommendation rules, decision trace, and state machine).
- Owns `PracticePlan` aggregate root (plans, targeted competencies, selection rules, spacing policy).
- Owns `PracticeSession` aggregate root (active execution progress, active question queue, difficulty profile).
- Owns `PracticeStrategy` configuration settings.
- Restricts cross-domain writes: Never mutates Student Learning, Question Bank, or Curriculum contexts directly.
