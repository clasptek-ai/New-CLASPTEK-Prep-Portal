import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination Component (Wave 002C)', () => {
  it('renders pagination controls correctly', () => {
    const handlePageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={handlePageChange} />);

    expect(screen.getByRole('navigation')).toBeDefined();
    expect(screen.getByText('2').getAttribute('aria-current')).toBe('page');
  });

  it('triggers onPageChange when clicking next button', () => {
    const handlePageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={handlePageChange} />);

    fireEvent.click(screen.getByLabelText('Next page'));
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });
});
