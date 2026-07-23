import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast Component (Wave 002D)', () => {
  it('renders toast with role="status" and polite aria-live', () => {
    const item = { id: 't1', message: 'Saved successfully', variant: 'success' as const };
    const handleDismiss = vi.fn();

    render(<Toast toast={item} onDismiss={handleDismiss} />);
    const toastEl = screen.getByRole('status');
    expect(toastEl.getAttribute('aria-live')).toBe('polite');
    expect(screen.getByText('Saved successfully')).toBeDefined();
  });
});
