import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton Component (Wave 002D)', () => {
  it('renders skeleton element with aria-hidden="true"', () => {
    const { container } = render(<Skeleton width={200} height={24} />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});
