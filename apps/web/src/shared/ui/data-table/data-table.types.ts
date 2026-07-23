import React from 'react';

export interface ColumnDefinition<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  onCSVExport?: () => void;
}
