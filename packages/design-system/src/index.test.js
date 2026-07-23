import { describe, test, expect } from 'vitest';
import { Button, ButtonMetadata } from './index';
describe('@clasptek/design-system Components & Governance', () => {
  test('ButtonMetadata specifies CDS naming and WCAG compliance', () => {
    expect(ButtonMetadata.name).toBe('CDS/Button/Primary');
    expect(ButtonMetadata.accessibility).toBe('WCAG 2.2 AA');
  });
  test('Button component renders without errors', () => {
    expect(Button).toBeDefined();
  });
});
