# Component Specification: Metric & MetricGroup

1. **Purpose**: Executive dashboard analytics metrics and trend indicators.
2. **Category**: Data Display Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `MetricProps`, `MetricGroupProps` (`metric.types.ts`).
6. **Supported Variants**: Single Metric, MetricGroup grid, TrendIndicator, Sparkline.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: Clear textual hierarchy and screen reader data presentation.
10. **Keyboard Support**: N/A
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Responsive auto-fit CSS grid layout.
14. **Usage Example**: `<Metric label="Score" value="8.5" percentageChange="+0.5" trend="up" />`
15. **Tests**: Covered in `metric.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
