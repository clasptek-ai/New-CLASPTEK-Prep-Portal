'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '../ui/ui-components';

// ─── Instructor Stat Card ───────────────────────────────────────────
export function InstructorStatCard({
  title,
  value,
  change,
  changeType = 'positive',
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
}) {
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#94a3b8',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>{value}</span>
        {change && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: changeType === 'positive' ? '#10b981' : '#ef4444',
            }}
          >
            {changeType === 'positive' ? '▲' : '▼'} {change}
          </span>
        )}
      </div>
    </Card>
  );
}

// ─── Risk Badge ──────────────────────────────────────────────────────
export function RiskBadge({ status }: { status: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  switch (status) {
    case 'HIGH':
      return <Badge variant="danger">HIGH RISK</Badge>;
    case 'MEDIUM':
      return <Badge variant="warning">MEDIUM RISK</Badge>;
    default:
      return <Badge variant="success">LOW RISK</Badge>;
  }
}

// ─── Accessible Table Supporting Bulk Checkbox Actions ───────────────
interface TableColumn<T> {
  header: string;
  render: (row: T) => React.ReactNode;
}

interface BulkTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onBulkAction?: (selectedItems: T[]) => void;
  bulkActionLabel?: string;
}

export function BulkTable<T extends { id: string }>({
  data,
  columns,
  onBulkAction,
  bulkActionLabel = 'Execute Bulk Action',
}: BulkTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(data.map((item) => item.id)));
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

  const handleExecute = () => {
    if (!onBulkAction) return;
    const selected = data.filter((item) => selectedIds.has(item.id));
    onBulkAction(selected);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {onBulkAction && selectedIds.size > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid rgba(37, 99, 235, 0.2)',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            Selected: **{selectedIds.size}** items
          </span>
          <Button onClick={handleExecute}>{bulkActionLabel}</Button>
        </div>
      )}

      <div style={{ overflowX: 'auto', border: '1px solid #232e48', borderRadius: '8px' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#151d30',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid #232e48', backgroundColor: '#0b0f19' }}>
              <th style={{ padding: '1rem', width: '40px' }}>
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.size === data.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </th>
              {columns.map((c, i) => (
                <th
                  key={i}
                  style={{
                    padding: '1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                  }}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}
                >
                  No records matching search query.
                </td>
              </tr>
            ) : (
              data.map((row, _rIndex) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: '1px solid #232e48', transition: 'background-color 0.2s' }}
                >
                  <td style={{ padding: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={(e) => handleSelectItem(row.id, e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </td>
                  {columns.map((col, cIndex) => (
                    <td key={cIndex} style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Chronological Timeline Widget ──────────────────────────────────
export function Timeline({
  events,
}: {
  events: Array<{ date: string; title: string; desc?: string; category?: string }>;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        borderLeft: '2px solid #232e48',
        paddingLeft: '1.25rem',
        marginLeft: '0.5rem',
        position: 'relative',
      }}
    >
      {events.map((e, idx) => (
        <div key={idx} style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: '-27px',
              top: '2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              border: '3px solid #151d30',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>{e.date}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
              {e.title} {e.category && <Badge>{e.category}</Badge>}
            </span>
            {e.desc && <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>{e.desc}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
