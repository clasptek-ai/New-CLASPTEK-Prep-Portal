# Component Specification: Enterprise Navigation

1. **Purpose**: Presentation navigation primitives (SidebarItem, TopNavigation, StepIndicator, NavigationGroup).
2. **Category**: Navigation Controls
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `SidebarItemProps`, `TopNavigationProps`, `StepIndicatorProps`, `NavigationGroupProps` (`navigation.types.ts`).
6. **Supported Variants**: Collapsed/Expanded Sidebar, Sticky Header, Multi-step Progress.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Active`, `Inactive`, `Hover`, `Focus`, `Disabled`, `Expanded`, `Collapsed`.
9. **Accessibility (WCAG AA)**: `<header>`, `<nav>`, `aria-current="page"`, `aria-label`.
10. **Keyboard Support**: Full keyboard link navigation.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Collapsible sidebar, mobile header flex bounds.
14. **Usage Example**: `<SidebarItem href="/dashboard" label="Dashboard" isActive />`
15. **Tests**: Covered in `navigation.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
