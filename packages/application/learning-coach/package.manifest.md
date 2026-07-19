# Package Manifest: @clasptek/application-learning-coach

## Purpose
Application service layers, command handlers, query handlers, and repository contracts for the AI Learning Coach.

## Metadata
- **Owner**: Clasptek Engineering
- **Depends On**: @clasptek/domain-learning-coach, @clasptek/kernel
- **Publishes**: CreateCoachHandler, StartCoachingSessionHandler, EndCoachingSessionHandler, GenerateStudyPlanHandler, CreateGoalHandler, CompleteGoalHandler, UpdateHabitHandler, RecordReflectionHandler, GenerateMotivationHandler, GetCoachDashboardHandler, and repository contracts
- **Consumes**: @clasptek/domain-learning-coach
- **Business Domain**: Student Experience / AI Tutoring
- **ADR References**: [ADR-015](../../docs/architecture/ADR/015-learning-coach-domain.md)
