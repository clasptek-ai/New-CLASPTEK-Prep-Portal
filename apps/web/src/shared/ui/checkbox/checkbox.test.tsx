import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox Component (Wave 002B)', () => {
  it('renders checkbox with label', () => {
    render(<Checkbox label="I agree to terms" />);
    expect(screen.getByLabelText('I agree to terms')).toBeDefined();
  });

  it('handles toggle events', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Opt in" onChange={handleChange} />);
    fireEvent.click(screen.getByLabelText('Opt in'));
    expect(handleChange).toHaveBeenCalled();
  });
});
