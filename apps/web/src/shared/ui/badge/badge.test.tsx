import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';
import { NotificationBadge } from './NotificationBadge';

describe('Badge Components (Wave 002E)', () => {
  it('renders badge content', () => {
    render(<Badge variant="success">Passed</Badge>);
    expect(screen.getByText('Passed')).toBeDefined();
  });

  it('renders notification badge count overflow', () => {
    render(
      <NotificationBadge count={120} max={99}>
        <button>Inbox</button>
      </NotificationBadge>
    );

    expect(screen.getByText('99+')).toBeDefined();
  });
});
