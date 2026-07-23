import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarGroup } from './Avatar';

describe('Avatar Component (Wave 002E)', () => {
  it('renders initials fallback cleanly when image is not provided', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeDefined();
  });

  it('renders AvatarGroup overflow indicator', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="User 1" />
        <Avatar name="User 2" />
        <Avatar name="User 3" />
        <Avatar name="User 4" />
      </AvatarGroup>
    );

    expect(screen.getByText('+2')).toBeDefined();
  });
});
