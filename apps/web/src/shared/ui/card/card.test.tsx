import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, Surface } from './Card';

describe('Card Component (Wave 002B)', () => {
  it('renders default card with children', () => {
    render(<Card data-testid="card">Card Body</Card>);
    const card = screen.getByTestId('card');
    expect(card).toBeDefined();
    expect(card.textContent).toBe('Card Body');
  });

  it('renders elevated card variant', () => {
    render(
      <Card variant="elevated" data-testid="card-elevated">
        Elevated Content
      </Card>
    );
    const card = screen.getByTestId('card-elevated');
    expect(card).toBeDefined();
  });

  it('renders Surface component cleanly', () => {
    render(
      <Surface elevation="floating" data-testid="surface">
        Surface Content
      </Surface>
    );
    const surface = screen.getByTestId('surface');
    expect(surface).toBeDefined();
  });
});
