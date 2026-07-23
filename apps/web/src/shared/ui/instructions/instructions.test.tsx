import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InstructionPanel } from './InstructionPanel';

describe('InstructionPanel Component (Wave 002F)', () => {
  it('renders exam rules list', () => {
    render(
      <InstructionPanel
        title="IELTS Academic Rules"
        rules={['Do not refresh the page.', 'Complete all 40 questions.']}
      />
    );
    expect(screen.getByText('📋 IELTS Academic Rules')).toBeDefined();
    expect(screen.getByText('Do not refresh the page.')).toBeDefined();
  });
});
