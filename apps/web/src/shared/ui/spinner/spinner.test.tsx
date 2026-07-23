import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner Component (Wave 002D)', () => {
  it('renders spinner status element', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toBeDefined();
  });
});
