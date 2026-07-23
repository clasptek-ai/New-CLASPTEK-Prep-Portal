# Component Specification: Tag & TagGroup

1. **Purpose**: Static categorization tags for entity labels and metadata keywords.
2. **Category**: Data Display Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `TagProps`, `TagGroupProps` (`tag.types.ts`).
6. **Supported Variants**: Left-accent colored border tag.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: Semantic span tag wrapper.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: TagGroup flex wrap display.
14. **Usage Example**: `<Tag color="#10b981">Listening Section</Tag>`
15. **Tests**: Covered in `tag.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
