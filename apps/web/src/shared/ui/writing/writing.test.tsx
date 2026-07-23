import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WordCounter } from './WordCounter';

describe('WordCounter Component (Wave 002F)', () => {
  it('counts words and characters accurately', () => {
    render(<WordCounter text="IELTS Academic Writing Task 2 essay response." minTarget={250} />);
    expect(screen.getByText('7')).toBeDefined();
    expect(screen.getByText(/250 min/)).toBeDefined();
  });
});
