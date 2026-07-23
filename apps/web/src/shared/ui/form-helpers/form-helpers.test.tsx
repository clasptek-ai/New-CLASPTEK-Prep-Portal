import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelperText } from './HelperText';
import { FieldError } from './FieldError';
import { CharacterCounter } from './CharacterCounter';
import { StrengthMeter } from './StrengthMeter';

describe('Form Helpers Primitives (Wave 002B)', () => {
  it('renders HelperText subtext', () => {
    render(<HelperText>Helper Message</HelperText>);
    expect(screen.getByText('Helper Message')).toBeDefined();
  });

  it('renders FieldError message with alert role', () => {
    render(<FieldError error="Validation failed" />);
    expect(screen.getByRole('alert').textContent).toBe('Validation failed');
  });

  it('renders CharacterCounter counts', () => {
    render(<CharacterCounter current={15} max={100} />);
    expect(screen.getByText('15 / 100')).toBeDefined();
  });

  it('renders StrengthMeter indicator label', () => {
    render(<StrengthMeter score={3} />);
    expect(screen.getByText('Password Strength: Strong')).toBeDefined();
  });
});
