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
}
export declare function DataTable<T>({
  data,
  columns,
  keyExtractor,
}: DataTableProps<T>): React.JSX.Element;
