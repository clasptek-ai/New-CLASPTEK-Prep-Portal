# Component Specification: QuestionNavigator

1. **Purpose**: Grid palette of exam questions for jumping between sections and reviewing flagged items.
2. **Category**: Assessment Experience Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `QuestionNavigatorProps` (`question-navigation.types.ts`).
6. **Supported Variants**: QuestionPalette, SectionNavigator.
7. **Supported Sizes**: Standard grid.
8. **Supported States**: `Visited`, `Answered`, `Unanswered`, `Flagged`, `Current`, `Disabled`.
9. **Accessibility (WCAG AA)**: `<button aria-label="Question N, status">`.
10. **Keyboard Support**: Full keyboard grid navigation.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Responsive auto-fill CSS grid.
14. **Usage Example**: `<QuestionNavigator questions={items} currentQuestionId="1" onSelectQuestion={jump} />`
15. **Tests**: Covered in `question-navigation.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
