import { describe, test, expect } from 'vitest';
import { tokens, semanticTokens, motionTokens, typographyTokens } from './index';

describe('@clasptek/design-tokens Specification', () => {
  test('tokens contains primary color palette and brand hex', () => {
    expect(tokens.color.primary).toBe('#00346b');
    expect(tokens.color.secondary).toBe('#bb0014');
  });

  test('semanticTokens contains button and exam aliases', () => {
    expect(semanticTokens.button.primary.background).toBe('var(--cds-color-primary)');
    expect(semanticTokens.exam.correct).toBe('#059669');
  });

  test('motionTokens standardizes transitions', () => {
    expect(motionTokens.duration.hover).toBe('150ms');
    expect(motionTokens.duration.modal).toBe('250ms');
    expect(motionTokens.duration.skeleton).toBe('1200ms');
  });

  test('typographyTokens specifies display and body sizes', () => {
    expect(typographyTokens.fontSize.displayXl).toBe('48px');
    expect(typographyTokens.fontFamily.sans).toContain('Inter');
  });
});
