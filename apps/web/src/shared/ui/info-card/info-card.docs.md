# Component Specification: InfoCard & StatCard

1. **Purpose**: Executive dashboard stat cards and information section containers.
2. **Category**: Data Display Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `StatCardProps`, `InfoCardProps` (`info-card.types.ts`).
6. **Supported Variants**: StatCard, MetricCard, SummaryCard, InfoCard.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: Semantic headings, structured text hierarchy.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Flex and grid column bounds.
14. **Usage Example**: `<StatCard title="Total Mock Exams" value="48" delta="+12%" trend="up" />`
15. **Tests**: Covered in `info-card.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
