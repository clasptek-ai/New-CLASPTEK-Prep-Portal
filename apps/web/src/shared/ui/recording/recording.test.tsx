import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecordingIndicator } from './RecordingIndicator';

describe('RecordingIndicator Component (Wave 002F)', () => {
  it('renders active recording state and elapsed timer', () => {
    render(<RecordingIndicator status="recording" elapsedSeconds={45} />);
    expect(screen.getByText('recording')).toBeDefined();
    expect(screen.getByText('(00:45)')).toBeDefined();
  });
});
