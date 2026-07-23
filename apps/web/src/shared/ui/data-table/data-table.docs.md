# Component Specification: Layer 2 Enterprise DataTable

1. **Purpose**: High-performance generic data grid with sorting, row selection, column accessors, and CSV export readiness.
2. **Category**: Data Display Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `DataTableProps<T>`, `ColumnDefinition<T>` (`data-table.types.ts`).
6. **Supported Variants**: Sortable, Selectable, Exportable, Loading, Empty.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: Semantic table structure, checkbox row selection aria-labels.
10. **Keyboard Support**: Full table navigation and spacebar selection.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Horizontal overflow wrapper.
14. **Usage Example**: `<DataTable columns={cols} data={rows} keyExtractor={(r) => r.id} />`
15. **Tests**: Covered in `data-table.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
