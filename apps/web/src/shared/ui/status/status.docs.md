# Component Specification: Status Indicators

1. **Purpose**: Real-time status indicators (StatusBadge, StatusIndicator, ConnectionIndicator, SyncIndicator).
2. **Category**: Status Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `StatusBadgeProps`, `StatusIndicatorProps`, `ConnectionIndicatorProps`, `SyncIndicatorProps` (`status.types.ts`).
6. **Supported Variants**: `success`, `warning`, `error`, `info`, `offline`.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: `role="status"`, `aria-label`.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Inline badge flex layout.
14. **Usage Example**: `<StatusBadge variant="success" label="Passed" />`
15. **Tests**: Covered in `status.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
