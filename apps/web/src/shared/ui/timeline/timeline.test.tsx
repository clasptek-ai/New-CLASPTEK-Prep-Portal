import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline, TimelineItem } from './Timeline';

describe('Timeline Component (Wave 002E)', () => {
  it('renders timeline activity items', () => {
    render(
      <Timeline>
        <TimelineItem date="July 22" title="Diagnostic Completed" isCompleted />
      </Timeline>
    );

    expect(screen.getByText('July 22')).toBeDefined();
    expect(screen.getByText('Diagnostic Completed')).toBeDefined();
  });
});
