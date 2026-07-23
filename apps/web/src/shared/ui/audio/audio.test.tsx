import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AudioPlayer } from './AudioPlayer';

describe('AudioPlayer Component (Wave 002F)', () => {
  it('renders audio title and play button', () => {
    render(<AudioPlayer src="/audio/listening-1.mp3" title="IELTS Section 1 Audio" />);
    expect(screen.getByText('IELTS Section 1 Audio')).toBeDefined();
    expect(screen.getByLabelText('Play Audio')).toBeDefined();
  });
});
