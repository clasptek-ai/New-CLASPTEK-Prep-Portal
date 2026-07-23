import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

describe('Breadcrumb Component (Wave 002C)', () => {
  it('renders breadcrumb items with aria-current="page" on current item', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/student">Student</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Assessments</BreadcrumbItem>
      </Breadcrumb>
    );

    const current = screen.getByText('Assessments');
    expect(current.getAttribute('aria-current')).toBe('page');
  });
});
