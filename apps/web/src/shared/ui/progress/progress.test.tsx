import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';
import { CircularProgress } from './CircularProgress';

describe('Progress Components (Wave 002D)', () => {
  it('renders progressbar element with aria-valuenow', () => {
    render(<ProgressBar value={75} max={100} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('75');
  });

  it('renders CircularProgress with score percent', () => {
    render(<CircularProgress value={85} />);
    expect(screen.getByText('85%')).toBeDefined();
  });
});
