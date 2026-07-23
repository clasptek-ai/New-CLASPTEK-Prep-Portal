import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssessmentProgress } from './AssessmentProgress';

describe('AssessmentProgress Component (Wave 002F)', () => {
  it('renders progress section and completion percentage', () => {
    render(
      <AssessmentProgress
        currentSection="Listening Section 1"
        totalQuestions={40}
        answeredQuestions={20}
      />
    );
    expect(screen.getByText('Section: Listening Section 1')).toBeDefined();
    expect(screen.getByText('20 of 40 answered (50%)')).toBeDefined();
  });
});
