'use client';

import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  hideOnTablet?: boolean;
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No records available.',
}: ResponsiveTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-(--surface-0) border border-(--border) rounded-xl text-(--text-muted) text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-(--border) bg-(--surface-0)">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-(--border) bg-(--surface-1) text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3.5 ${col.hideOnTablet ? 'hidden lg:table-cell' : ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border) text-sm text-(--text-primary)">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-(--surface-1) transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-4 ${col.hideOnTablet ? 'hidden lg:table-cell' : ''}`}
                  >
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack View (<768px) */}
      <div className="block md:hidden space-y-3">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            className="p-4 bg-(--surface-0) border border-(--border) rounded-xl space-y-2.5 shadow-sm"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex justify-between items-start text-xs border-b border-(--border) pb-2 last:border-b-0 last:pb-0"
              >
                <span className="font-semibold text-(--text-muted) uppercase tracking-wider">
                  {col.header}:
                </span>
                <span className="text-(--text-primary) text-right font-medium">
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
