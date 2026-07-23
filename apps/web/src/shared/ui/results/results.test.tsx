import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreCard } from './ScoreCard';

describe('ScoreCard Component (Wave 002F)', () => {
  it('renders overall score and band descriptor', () => {
    render(
      <ScoreCard
        testTitle="IELTS Academic Diagnostic"
        overallScore={8.0}
        bandDescriptor="Very Good User"
      />
    );
    expect(screen.getByText('IELTS ACADEMIC DIAGNOSTIC')).toBeDefined();
    expect(screen.getByText('8')).toBeDefined();
    expect(screen.getByText('Very Good User')).toBeDefined();
  });
});
