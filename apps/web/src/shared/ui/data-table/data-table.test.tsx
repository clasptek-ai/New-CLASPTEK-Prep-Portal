import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from './DataTable';
import { ColumnDefinition } from './data-table.types';

interface StudentExam {
  id: string;
  name: string;
  score: number;
}

describe('Layer 2 Enterprise DataTable (Wave 002E)', () => {
  const columns: ColumnDefinition<StudentExam>[] = [
    { id: 'name', header: 'Student Name', accessor: 'name', sortable: true },
    { id: 'score', header: 'Overall Score', accessor: 'score' },
  ];

  const data: StudentExam[] = [
    { id: 's1', name: 'Alice Smith', score: 8.5 },
    { id: 's2', name: 'Bob Jones', score: 7.0 },
  ];

  it('renders generic data rows with column headers', () => {
    render(<DataTable<StudentExam> columns={columns} data={data} keyExtractor={(r) => r.id} />);
    expect(screen.getByText('Student Name')).toBeDefined();
    expect(screen.getByText('Alice Smith')).toBeDefined();
  });

  it('handles row selection callbacks', () => {
    const handleSelect = vi.fn();
    render(
      <DataTable<StudentExam>
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
        selectable
        onSelectionChange={handleSelect}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    expect(handleSelect).toHaveBeenCalledWith(['s1']);
  });
});
