import React, { forwardRef } from 'react';
import {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
  TableHeaderCellProps,
} from './table.types';

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { style, children, ...props },
  ref
) {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table
        ref={ref}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
          textAlign: 'left',
          color: 'var(--text-primary, #f8fafc)',
          ...style,
        }}
        {...props}
      >
        {children}
      </table>
    </div>
  );
});

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableHeader({ style, children, ...props }, ref) {
    return (
      <thead
        ref={ref}
        style={{
          backgroundColor: 'var(--bg-surface-1, #161e2e)',
          borderBottom: '1px solid var(--border-default, #1e293b)',
          ...style,
        }}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  { style, children, ...props },
  ref
) {
  return (
    <tbody ref={ref} style={{ ...style }} {...props}>
      {children}
    </tbody>
  );
});

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { isSelected = false, style, children, ...props },
  ref
) {
  return (
    <tr
      ref={ref}
      aria-selected={isSelected}
      style={{
        borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.07))',
        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
        transition: 'background-color 150ms ease',
        ...style,
      }}
      {...props}
    >
      {children}
    </tr>
  );
});

export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell({ style, children, ...props }, ref) {
    return (
      <th
        ref={ref}
        style={{
          padding: '0.75rem 1.0rem',
          fontWeight: 700,
          color: 'var(--text-secondary, #cbd5e1)',
          fontSize: '0.8125rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          ...style,
        }}
        {...props}
      >
        {children}
      </th>
    );
  }
);

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { style, children, ...props },
  ref
) {
  return (
    <td
      ref={ref}
      style={{
        padding: '0.75rem 1.0rem',
        color: 'var(--text-primary, #f8fafc)',
        ...style,
      }}
      {...props}
    >
      {children}
    </td>
  );
});

export const TableFooter = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableFooter({ style, children, ...props }, ref) {
    return (
      <tfoot
        ref={ref}
        style={{
          backgroundColor: 'var(--bg-surface-1, #161e2e)',
          borderTop: '1px solid var(--border-default, #1e293b)',
          fontWeight: 600,
          ...style,
        }}
        {...props}
      >
        {children}
      </tfoot>
    );
  }
);
