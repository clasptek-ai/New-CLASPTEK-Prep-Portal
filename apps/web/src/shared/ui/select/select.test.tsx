import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select } from './Select';

describe('Select Component (Wave 002B)', () => {
  const options = [
    { value: 'ielts', label: 'IELTS Preparation' },
    { value: 'toefl', label: 'TOEFL iBT' },
  ];

  it('renders select with options and label', () => {
    render(<Select label="Programme" options={options} />);
    expect(screen.getByLabelText('Programme')).toBeDefined();
    expect(screen.getByText('IELTS Preparation')).toBeDefined();
  });
});
