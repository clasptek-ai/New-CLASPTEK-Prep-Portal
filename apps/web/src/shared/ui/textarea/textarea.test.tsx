import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea Component (Wave 002B)', () => {
  it('renders textarea with label', () => {
    render(<Textarea label="Essay Answer" placeholder="Type here..." />);
    expect(screen.getByLabelText('Essay Answer')).toBeDefined();
  });

  it('displays character counter when showCount and maxLength are true', () => {
    render(<Textarea label="Bio" value="Hello" maxLength={100} showCount readOnly />);
    expect(screen.getByText('5 / 100')).toBeDefined();
  });
});
