import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Metric } from './Metric';
import { TrendIndicator } from './TrendIndicator';

describe('Metric Components (Wave 002E)', () => {
  it('renders Metric with label, value, and trend percentage', () => {
    render(
      <Metric
        label="Total Diagnostic Tests"
        value="1,240"
        percentageChange="+15%"
        trend="up"
        period="last month"
      />
    );
    expect(screen.getByText('TOTAL DIAGNOSTIC TESTS')).toBeDefined();
    expect(screen.getByText('1,240')).toBeDefined();
    expect(screen.getByText('+15%')).toBeDefined();
  });

  it('renders TrendIndicator arrow and color', () => {
    render(<TrendIndicator direction="up" label="+8.4%" />);
    expect(screen.getByText('↑')).toBeDefined();
    expect(screen.getByText('+8.4%')).toBeDefined();
  });
});
