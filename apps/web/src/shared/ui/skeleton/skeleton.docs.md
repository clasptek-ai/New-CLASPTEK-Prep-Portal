# Component Specification: Skeleton

1. **Purpose**: Content placeholder skeleton shimmer for layout loading feedback.
2. **Category**: Feedback Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `SkeletonProps` (`skeleton.types.ts`).
6. **Supported Variants**: Block, Text line, Avatar circle.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: `aria-hidden="true"`.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Responsive percentage width scaling.
14. **Usage Example**: `<Skeleton width="100%" height={40} />`
15. **Tests**: Covered in `skeleton.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
