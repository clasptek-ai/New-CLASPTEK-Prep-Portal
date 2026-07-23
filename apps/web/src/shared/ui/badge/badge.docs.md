# Component Specification: Badge & NotificationBadge

1. **Purpose**: Status badge indicator pills and notification counters.
2. **Category**: Data Display Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `BadgeProps`, `NotificationBadgeProps` (`badge.types.ts`).
6. **Supported Variants**: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `outline`.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: Semantic span tag wrapper.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Inline badge layout bounds.
14. **Usage Example**: `<Badge variant="success">Completed</Badge>`
15. **Tests**: Covered in `badge.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
