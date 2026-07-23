import React from 'react';
import { DataTable } from './DataTable';
import { ColumnDefinition } from './data-table.types';

interface DemoRow {
  id: string;
  name: string;
  score: number;
}

export default {
  title: 'Data Display/DataTable',
  component: DataTable,
};

const cols: ColumnDefinition<DemoRow>[] = [
  { id: 'name', header: 'Student Name', accessor: 'name' },
  { id: 'score', header: 'Band Score', accessor: 'score' },
];

const data: DemoRow[] = [{ id: '1', name: 'John Doe', score: 8.0 }];

export const Default = () => (
  <DataTable<DemoRow> columns={cols} data={data} keyExtractor={(r) => r.id} />
);
