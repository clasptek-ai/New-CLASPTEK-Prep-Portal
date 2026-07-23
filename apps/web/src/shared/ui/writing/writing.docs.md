# Component Specification: WordCounter

1. **Purpose**: Real-time essay word and character counter for IELTS Task 1 & Task 2 writing.
2. **Category**: Assessment Experience Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `WordCounterProps` (`writing.types.ts`).
6. **Supported Variants**: WritingToolbar, WritingStatus.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `BelowMin`, `TargetReached`, `AboveMax`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: Clear textual word count indicator.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Inline flex row layout.
14. **Usage Example**: `<WordCounter text={essayText} minTarget={250} />`
15. **Tests**: Covered in `writing.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
