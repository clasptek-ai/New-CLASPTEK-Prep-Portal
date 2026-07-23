# Component Specification: InstructionPanel

1. **Purpose**: Exam section instructions, rules guidelines, and candidate tips panel.
2. **Category**: Assessment Experience Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `InstructionPanelProps` (`instructions.types.ts`).
6. **Supported Variants**: ExamRules, SectionIntroduction, TipsPanel.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Open`, `Collapsed`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: Semantic list structure and interactive toggle header.
10. **Keyboard Support**: Spacebar/Enter expand toggle.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Full container bounds.
14. **Usage Example**: `<InstructionPanel title="Guidelines" rules={["No calculators allowed."]} />`
15. **Tests**: Covered in `instructions.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
