import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SidebarItem } from './SidebarItem';
import { TopNavigation } from './TopNavigation';
import { StepIndicator } from './StepIndicator';

describe('Navigation Components (Wave 002C)', () => {
  it('renders active SidebarItem with aria-current="page"', () => {
    render(<SidebarItem href="/dashboard" label="Dashboard" isActive />);
    const item = screen.getByText('Dashboard').parentElement?.parentElement;
    expect(item?.getAttribute('aria-current')).toBe('page');
  });

  it('renders TopNavigation header landmark cleanly', () => {
    render(<TopNavigation logo={<span>Clasptek</span>} />);
    expect(screen.getByRole('banner')).toBeDefined();
    expect(screen.getByText('Clasptek')).toBeDefined();
  });

  it('renders StepIndicator step steps', () => {
    const steps = [
      { id: '1', label: 'Registration' },
      { id: '2', label: 'Diagnostic' },
    ];
    render(<StepIndicator steps={steps} currentStep={0} />);
    expect(screen.getByText('Registration')).toBeDefined();
  });
});
