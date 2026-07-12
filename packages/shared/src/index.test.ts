import { describe, test, expect } from 'vitest';
import { safeJSONParse } from './index';

describe('Shared Utilities Unit Tests', () => {
  test('Valid JSON parses correctly', () => {
    const result = safeJSONParse('{"ok":true}', { ok: false });
    expect(result.ok).toBe(true);
  });

  test('Invalid JSON returns fallback', () => {
    const result = safeJSONParse('{invalid}', { ok: false });
    expect(result.ok).toBe(false);
  });
});
