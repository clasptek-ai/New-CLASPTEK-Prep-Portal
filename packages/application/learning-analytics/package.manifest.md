# Package Manifest: @clasptek/application-learning-analytics

## Purpose

Application service layers, command handlers, query handlers, repository contracts, and read-only ports for the Learning Analytics bounded context.

## Metadata

- **Owner**: Clasptek Engineering
- **Depends On**: @clasptek/domain-learning-analytics, @clasptek/kernel
- **Publishes**: GenerateStudentDashboardHandler, GenerateInstructorDashboardHandler, GenerateAdminDashboardHandler, RefreshAnalyticsHandler, GetStudentDashboardHandler, and other handlers & repository interfaces
- **Consumes**: @clasptek/domain-learning-analytics
- **Business Domain**: Presentation / Reporting / Analytics
- **ADR References**: [ADR-016](../../docs/architecture/ADR/016-learning-analytics.md)
