import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextHighlight } from './TextHighlight';

describe('TextHighlight Component (Wave 002F)', () => {
  it('renders mark text highlight tag', () => {
    render(<TextHighlight color="#fef08a">Passage Key Fact</TextHighlight>);
    expect(screen.getByText('Passage Key Fact')).toBeDefined();
  });
});
