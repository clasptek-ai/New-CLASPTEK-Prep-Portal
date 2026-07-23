import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { InfoCard } from './InfoCard';

describe('Information & Stat Cards (Wave 002E)', () => {
  it('renders StatCard with value and delta %', () => {
    render(<StatCard title="Average Band Score" value="7.5" delta="+0.5" trend="up" />);
    expect(screen.getByText('Average Band Score')).toBeDefined();
    expect(screen.getByText('7.5')).toBeDefined();
    expect(screen.getByText('+0.5')).toBeDefined();
  });

  it('renders InfoCard title and body children', () => {
    render(<InfoCard title="Exam Guidelines">Study 20 minutes daily</InfoCard>);
    expect(screen.getByText('Exam Guidelines')).toBeDefined();
    expect(screen.getByText('Study 20 minutes daily')).toBeDefined();
  });
});
