# Component Specification: EmptyState

1. **Purpose**: Zero-data placeholders for empty tables, search results, permissions, and coming soon features.
2. **Category**: Data Display Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `EmptyStateProps` (`empty-state.types.ts`).
6. **Supported Variants**: EmptyState, NoResults, PermissionDenied, ComingSoon.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: Semantic heading and body hierarchy.
10. **Keyboard Support**: Action button focus handling.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Centered column layout.
14. **Usage Example**: `<EmptyState title="No Data" description="Check back later." />`
15. **Tests**: Covered in `empty-state.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
