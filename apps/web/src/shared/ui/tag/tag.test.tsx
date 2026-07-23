import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tag } from './Tag';

describe('Tag Component (Wave 002E)', () => {
  it('renders tag label content', () => {
    render(<Tag color="#10b981">IELTS Academic</Tag>);
    expect(screen.getByText('IELTS Academic')).toBeDefined();
  });
});
