# Component Specification: ScoreCard

1. **Purpose**: Executive score result summary cards for completed practice tests and mock exams.
2. **Category**: Assessment Experience Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `ScoreCardProps` (`results.types.ts`).
6. **Supported Variants**: BandScore, PerformanceBreakdown, SkillBreakdown.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: Clear textual hierarchy and score presentation.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Centered column card bounds.
14. **Usage Example**: `<ScoreCard testTitle="IELTS Mock #1" overallScore={7.5} bandDescriptor="Good User" />`
15. **Tests**: Covered in `results.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
