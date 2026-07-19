'use client';

import React, { useState, useMemo } from 'react';
import { Button } from './ui-components';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (info: { row: T }) => React.ReactNode;
  sortable?: boolean;
}

interface SharedTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
  bulkActionLabel?: string;
  onBulkAction?: (rows: T[]) => void;
  exportLabel?: string;
  onExport?: (rows: T[]) => void;
}

export function SharedTable<T extends { id: string }>({
  data,
  columns,
  pageSize = 10,
  bulkActionLabel = 'Bulk Action',
  onBulkAction,
  exportLabel = 'Export Data',
  onExport
}: SharedTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.values(item).some(val =>
        String(val).toLowerCase().includes(filterText.toLowerCase())
      );
    });
  }, [data, filterText]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortKey as keyof T];
      const bVal = b[sortKey as keyof T];
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortKey, sortAsc]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedData.map(item => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  const handleSort = (colId: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === colId) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(colId);
      setSortAsc(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Top Filter and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <input
          placeholder="Filter table rows..."
          value={filterText}
          onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid #232e48',
            backgroundColor: '#0b0f19',
            color: '#f8fafc',
            fontSize: '0.85rem',
            width: '240px'
          }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onBulkAction && selectedIds.size > 0 && (
            <Button onClick={() => onBulkAction(data.filter(item => selectedIds.has(item.id)))}>
              {bulkActionLabel} ({selectedIds.size})
            </Button>
          )}
          {onExport && (
            <Button variant="secondary" onClick={() => onExport(sortedData)}>
              {exportLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Grid container */}
      <div style={{ overflowX: 'auto', border: '1px solid #232e48', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#151d30', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #232e48', backgroundColor: '#0b0f19' }}>
              <th style={{ padding: '1rem', width: '40px' }}>
                <input
                  type="checkbox"
                  checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </th>
              {columns.map((c) => (
                <th
                  key={c.id}
                  onClick={() => handleSort(c.id, c.sortable)}
                  style={{
                    padding: '1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    cursor: c.sortable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {c.header} {c.sortable && (sortKey === c.id ? (sortAsc ? '▲' : '▼') : '↕')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #232e48' }}>
                  <td style={{ padding: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={(e) => handleSelectItem(row.id, e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.id} style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {col.cell ? col.cell({ row }) : String(row[col.accessorKey as keyof T] || '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
        <span>Showing {paginatedData.length} of {sortedData.length} records</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button
            variant="ghost"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{ padding: '0.25rem 0.5rem' }}
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            variant="ghost"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{ padding: '0.25rem 0.5rem' }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
export default SharedTable;
