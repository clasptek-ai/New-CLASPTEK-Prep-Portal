# Component Specification: Breadcrumb

1. **Purpose**: Secondary hierarchical navigation path display for current page location.
2. **Category**: Navigation Controls
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `BreadcrumbProps`, `BreadcrumbItemProps` (`breadcrumb.types.ts`).
6. **Supported Variants**: Icon-augmented, custom separator.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Active`, `Inactive`, `Hover`, `Focus`, `Disabled`.
9. **Accessibility (WCAG AA)**: `<nav aria-label="Breadcrumb">`, `aria-current="page"`.
10. **Keyboard Support**: Full keyboard link navigation.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Responsive text truncation.
14. **Usage Example**: `<Breadcrumb><BreadcrumbItem href="/">Home</BreadcrumbItem><BreadcrumbItem isCurrent>Assessments</BreadcrumbItem></Breadcrumb>`
15. **Tests**: Covered in `breadcrumb.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
