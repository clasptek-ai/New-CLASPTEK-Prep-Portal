import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RadioGroup } from './RadioGroup';

describe('RadioGroup Component (Wave 002B)', () => {
  const opts = [
    { value: 'academic', label: 'Academic Module' },
    { value: 'general', label: 'General Training' },
  ];

  it('renders radio group options with legend', () => {
    render(<RadioGroup name="module" label="Select Exam Module" options={opts} />);
    expect(screen.getByText('Select Exam Module')).toBeDefined();
    expect(screen.getByLabelText('Academic Module')).toBeDefined();
  });
});
