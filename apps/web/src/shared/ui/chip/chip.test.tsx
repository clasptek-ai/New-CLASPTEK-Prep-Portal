import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Chip } from './Chip';

describe('Chip Component (Wave 002E)', () => {
  it('renders chip label and handles click', () => {
    const handleClick = vi.fn();
    render(<Chip label="Reading Module" onClick={handleClick} />);

    fireEvent.click(screen.getByText('Reading Module'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('triggers onRemove callback when remove button is clicked', () => {
    const handleRemove = vi.fn();
    render(<Chip label="Band 8.0" onRemove={handleRemove} />);

    fireEvent.click(screen.getByLabelText('Remove Band 8.0'));
    expect(handleRemove).toHaveBeenCalled();
  });
});
