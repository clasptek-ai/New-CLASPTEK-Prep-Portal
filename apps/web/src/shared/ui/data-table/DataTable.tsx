import React, { useState } from 'react';
import { DataTableProps, ColumnDefinition } from './data-table.types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '../table/Table';
import { Checkbox } from '../checkbox/Checkbox';
import { Spinner } from '../spinner/Spinner';
import { Button } from '../button/Button';

export function DataTable<T extends object>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  onCSVExport,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (colId: string) => {
    if (sortColumn === colId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(colId);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(data.map((r) => keyExtractor(r)));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (key: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedKeys, key]);
    } else {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    }
  };

  const renderCellValue = (col: ColumnDefinition<T>, row: T) => {
    if (col.render) {
      const val =
        typeof col.accessor === 'function'
          ? col.accessor(row)
          : (row as Record<string, unknown>)[col.accessor as string];
      return col.render(val, row);
    }
    if (typeof col.accessor === 'function') {
      return col.accessor(row);
    }
    return String((row as Record<string, unknown>)[col.accessor as string] ?? '');
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {onCSVExport && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" onClick={onCSVExport}>
            Export CSV
          </Button>
        </div>
      )}

      <Table style={{ position: 'relative' }}>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHeaderCell style={{ width: '40px' }}>
                <Checkbox
                  checked={selectedKeys.length > 0 && selectedKeys.length === data.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHeaderCell>
            )}

            {columns.map((col) => (
              <TableHeaderCell
                key={col.id}
                onClick={() => col.sortable && handleSort(col.id)}
                style={{
                  cursor: col.sortable ? 'pointer' : 'default',
                  textAlign: col.align || 'left',
                  width: col.width,
                  userSelect: 'none',
                }}
              >
                {col.header}
                {col.sortable && sortColumn === col.id && (
                  <span style={{ marginLeft: '0.35rem', fontSize: '0.75rem' }}>
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                style={{ textAlign: 'center', padding: '3.0rem' }}
              >
                <Spinner size="lg" />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                style={{
                  textAlign: 'center',
                  padding: '3.0rem',
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => {
              const key = keyExtractor(row);
              const isSelected = selectedKeys.includes(key);

              return (
                <TableRow key={key} isSelected={isSelected}>
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(key, e.target.checked)}
                      />
                    </TableCell>
                  )}

                  {columns.map((col) => (
                    <TableCell key={col.id} style={{ textAlign: col.align || 'left' }}>
                      {renderCellValue(col, row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
