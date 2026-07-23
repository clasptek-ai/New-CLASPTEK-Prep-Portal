import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Banner } from './Banner';

describe('Banner Component (Wave 002D)', () => {
  it('renders announcement banner with landmark region', () => {
    render(<Banner variant="maintenance">Scheduled System Maintenance at 00:00 UTC</Banner>);
    expect(screen.getByRole('region')).toBeDefined();
    expect(screen.getByText('Scheduled System Maintenance at 00:00 UTC')).toBeDefined();
  });
});
