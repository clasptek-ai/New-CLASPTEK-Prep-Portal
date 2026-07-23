import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookmarkButton } from './BookmarkButton';

describe('BookmarkButton Component (Wave 002F)', () => {
  it('toggles bookmark state on click', () => {
    const handleToggle = vi.fn();
    render(<BookmarkButton onToggle={handleToggle} />);

    expect(screen.getByText('Flag Question')).toBeDefined();
    fireEvent.click(screen.getByRole('button'));
    expect(handleToggle).toHaveBeenCalledWith(true);
    expect(screen.getByText('Flagged')).toBeDefined();
  });
});
