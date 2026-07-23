# Component Specification: Layer 1 Table

1. **Purpose**: Primitive HTML table layout components (Table, TableHeader, TableBody, TableRow, TableCell, TableFooter).
2. **Category**: Data Display Components
3. **Owner**: Platform Team
4. **Version**: `v1.0.0`
5. **Props Interface**: `TableProps`, `TableRowProps`, `TableCellProps` (`table.types.ts`).
6. **Supported Variants**: Standard semantic HTML table elements.
7. **Supported Sizes**: Standard customizable.
8. **Supported States**: `Loading`, `Disabled`, `Success`, `Error`, `Warning`, `Empty`, `Responsive`.
9. **Accessibility (WCAG AA)**: Semantic `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`, `aria-selected`.
10. **Keyboard Support**: Screen reader table reading navigation.
11. **React Hook Form Compatibility**: N/A
12. **Theme Support**: Dynamic Light/Dark token inheritance.
13. **Responsive Behavior**: Horizontal overflow wrapper.
14. **Usage Example**: `<Table><TableHeader><TableRow><TableHeaderCell>Header</TableHeaderCell></TableRow></TableHeader></Table>`
15. **Tests**: Covered in `table.test.tsx`.
16. **Changelog**: Documented in `CHANGELOG.md`.
