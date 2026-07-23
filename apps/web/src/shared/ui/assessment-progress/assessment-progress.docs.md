# Component Specification: AssessmentProgress

1. **Purpose**: Exam section and total progress tracking header bar.
2. **Category**: Assessment Experience Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `AssessmentProgressProps` (`assessment-progress.types.ts`).
6. **Supported Variants**: SectionProgress, OverallProgress.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: ARIA progressbar wrapper.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Flex container layout.
14. **Usage Example**: `<AssessmentProgress currentSection="Reading" totalQuestions={40} answeredQuestions={30} />`
15. **Tests**: Covered in `assessment-progress.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
