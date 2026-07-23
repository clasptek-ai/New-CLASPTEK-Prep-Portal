import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, IconButton } from './Button';

describe('Button Component (Wave 002B)', () => {
  it('renders primary button cleanly', () => {
    render(<Button variant="primary">Click Me</Button>);
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toBeDefined();
  });

  it('handles click events when enabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button click when isLoading is true', () => {
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Saving
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('disabled')).not.toBeNull();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders IconButton with accessible label', () => {
    render(<IconButton icon={<span>Icon</span>} aria-label="Close modal" />);
    const iconBtn = screen.getByRole('button', { name: 'Close modal' });
    expect(iconBtn).toBeDefined();
  });
});
