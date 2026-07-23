import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';
import { Grid } from './Grid';
import { Stack } from './Stack';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';

describe('Design System Foundation Primitives (Wave 002A)', () => {
  it('renders Container component cleanly', () => {
    render(<Container data-testid="container">Container Content</Container>);
    const el = screen.getByTestId('container');
    expect(el).toBeDefined();
    expect(el.textContent).toBe('Container Content');
  });

  it('renders Grid component with columns props', () => {
    render(
      <Grid columns={4} data-testid="grid">
        Grid Content
      </Grid>
    );
    const el = screen.getByTestId('grid');
    expect(el.style.gridTemplateColumns).toBe('repeat(4, minmax(0, 1fr))');
  });

  it('renders Stack component with direction and gap', () => {
    render(
      <Stack direction="row" gap="2rem" data-testid="stack">
        Stack Content
      </Stack>
    );
    const el = screen.getByTestId('stack');
    expect(el.style.flexDirection).toBe('row');
    expect(el.style.gap).toBe('2rem');
  });

  it('renders Heading primitive with semantic tags', () => {
    render(
      <Heading level={1} size="hero">
        Hero Title
      </Heading>
    );
    const el = screen.getByRole('heading', { level: 1 });
    expect(el).toBeDefined();
    expect(el.textContent).toBe('Hero Title');
  });

  it('renders Text body primitive correctly', () => {
    render(<Text variant="muted">Muted Subtext</Text>);
    const el = screen.getByText('Muted Subtext');
    expect(el).toBeDefined();
  });
});
