import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import { ConnectionIndicator } from './ConnectionIndicator';

describe('Status Components (Wave 002D)', () => {
  it('renders StatusBadge with label', () => {
    render(<StatusBadge variant="success" label="Active Exam" />);
    expect(screen.getByText('Active Exam')).toBeDefined();
  });

  it('renders ConnectionIndicator status correctly', () => {
    render(<ConnectionIndicator isOnline={true} />);
    expect(screen.getByText('Online')).toBeDefined();
  });
});
