import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionNavigator } from './QuestionNavigator';

describe('QuestionNavigator Component (Wave 002F)', () => {
  const questions = [
    { id: 'q1', number: 1, status: 'answered' as const },
    { id: 'q2', number: 2, status: 'flagged' as const },
  ];

  it('renders question numbers and handles selection', () => {
    const handleSelect = vi.fn();
    render(
      <QuestionNavigator
        questions={questions}
        currentQuestionId="q1"
        onSelectQuestion={handleSelect}
      />
    );

    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();

    fireEvent.click(screen.getByText('2'));
    expect(handleSelect).toHaveBeenCalledWith('q2');
  });
});
