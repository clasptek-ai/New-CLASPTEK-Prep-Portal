# Component Specification: ProgressBar & CircularProgress

1. **Purpose**: Linear and circular progress indicators for completion status tracking.
2. **Category**: Feedback Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `ProgressBarProps`, `CircularProgressProps` (`progress.types.ts`).
6. **Supported Variants**: Linear horizontal bar, Circular SVG ring.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Percentage width scaling.
14. **Usage Example**: `<ProgressBar value={60} showValueLabel />`
15. **Tests**: Covered in `progress.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
