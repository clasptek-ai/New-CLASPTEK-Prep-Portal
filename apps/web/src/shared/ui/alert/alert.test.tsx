import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from './Alert';

describe('Alert Component (Wave 002D)', () => {
  it('renders alert with role="alert" and assertive aria-live', () => {
    render(
      <Alert variant="error">
        <AlertTitle>System Error</AlertTitle>
        <AlertDescription>Failed to fetch diagnostic scores.</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert.getAttribute('aria-live')).toBe('assertive');
    expect(screen.getByText('System Error')).toBeDefined();
  });

  it('triggers onDismiss when close button is clicked', () => {
    const handleDismiss = vi.fn();
    render(<Alert onDismiss={handleDismiss}>Dismissible Notification</Alert>);

    fireEvent.click(screen.getByLabelText('Dismiss alert'));
    expect(handleDismiss).toHaveBeenCalled();
  });
});
