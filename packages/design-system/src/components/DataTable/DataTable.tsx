import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  className?: string;
}

export function DataTable<T>({ data, columns, keyExtractor, className = '' }: DataTableProps<T>) {
  return (
    <div
      className={`w-full overflow-x-auto border border-[#c3c6d2] rounded-xl bg-white shadow-sm ${className}`}
    >
      <table className="w-full text-left text-sm text-[#191c1e] border-collapse">
        <thead className="bg-[#eceef0] text-[#434750] uppercase tracking-wider text-xs font-semibold border-b border-[#c3c6d2]">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3.5">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eceef0]">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="h-14 hover:bg-[#f2f4f6] transition-colors">
              {columns.map((col, idx) => (
                <td key={idx} className="px-4 py-3.5 align-middle">
                  {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey]) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
