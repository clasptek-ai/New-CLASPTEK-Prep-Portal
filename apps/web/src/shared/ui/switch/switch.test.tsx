import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './Switch';

describe('Switch Component (Wave 002B)', () => {
  it('renders switch with role="switch"', () => {
    render(<Switch label="Enable Notifications" />);
    const sw = screen.getByRole('switch');
    expect(sw).toBeDefined();
  });

  it('handles toggle events', () => {
    const handleChange = vi.fn();
    render(<Switch label="Dark Mode" onChange={handleChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalled();
  });
});
