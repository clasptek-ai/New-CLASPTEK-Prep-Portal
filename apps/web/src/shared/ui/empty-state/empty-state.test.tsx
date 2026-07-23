import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState, NoResults } from './EmptyState';

describe('EmptyState Components (Wave 002E)', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No Assessments Yet"
        description="Complete a practice test to see your analytics here."
      />
    );
    expect(screen.getByText('No Assessments Yet')).toBeDefined();
    expect(screen.getByText('Complete a practice test to see your analytics here.')).toBeDefined();
  });

  it('renders NoResults with search query', () => {
    render(<NoResults query="IELTS Task 2" />);
    expect(screen.getByText('No Results Found')).toBeDefined();
    expect(screen.getByText(/IELTS Task 2/)).toBeDefined();
  });
});
