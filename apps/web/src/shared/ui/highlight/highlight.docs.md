# Component Specification: TextHighlight

1. **Purpose**: Reading passage text highlighting tool for candidate passage annotations.
2. **Category**: Assessment Experience Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `TextHighlightProps` (`highlight.types.ts`).
6. **Supported Variants**: SelectionToolbar, HighlightLegend.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Highlighted`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: Semantic `<mark>` HTML tag.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Inline text wrapper.
14. **Usage Example**: `<TextHighlight color="#fef08a">Annotated phrase</TextHighlight>`
15. **Tests**: Covered in `highlight.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
