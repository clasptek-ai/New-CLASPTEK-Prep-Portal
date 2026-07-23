# Component Specification: Pagination

1. **Purpose**: Data table and list navigation control for stepping through multi-page data sets.
2. **Category**: Navigation Controls
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `PaginationProps`, `PageButtonProps` (`pagination.types.ts`).
6. **Supported Variants**: Full pagination and Compact pagination.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Active`, `Inactive`, `Hover`, `Focus`, `Disabled`.
9. **Accessibility (WCAG AA)**: `<nav aria-label="Pagination Navigation">`, `aria-current="page"`.
10. **Keyboard Support**: Full `Tab` focus navigation.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Compact ellipsis display on mobile viewports.
14. **Usage Example**: `<Pagination currentPage={page} totalPages={10} onPageChange={setPage} />`
15. **Tests**: Covered in `pagination.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
