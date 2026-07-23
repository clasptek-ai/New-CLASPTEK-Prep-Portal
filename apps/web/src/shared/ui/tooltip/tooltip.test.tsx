import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip Component (Wave 002D)', () => {
  it('shows tooltip on mouse hover with role="tooltip"', () => {
    render(
      <Tooltip content="Helper detail">
        <button>Hover Me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Hover Me'));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.textContent).toBe('Helper detail');
  });
});
