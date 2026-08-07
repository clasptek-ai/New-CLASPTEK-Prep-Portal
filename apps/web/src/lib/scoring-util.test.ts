import { describe, test, expect } from 'vitest';
import { extractSelectedOptionCode } from './scoring/extractSelectedOptionCode';

describe('Phase 6: Canonical extractSelectedOptionCode Regression Tests', () => {
  test('✅ Current payload format: { selectedOptionCode: "A" }', () => {
    expect(extractSelectedOptionCode({ selectedOptionCode: 'A' })).toBe('A');
  });

  test('✅ Legacy payload format: { option: "A" }', () => {
    expect(extractSelectedOptionCode({ option: 'A' })).toBe('A');
  });

  test('✅ Alternate payload format: { code: "A" }', () => {
    expect(extractSelectedOptionCode({ code: 'A' })).toBe('A');
  });

  test('✅ Older payload format: { answer: "A" }', () => {
    expect(extractSelectedOptionCode({ answer: 'A' })).toBe('A');
  });

  test('✅ Direct string format: "A"', () => {
    expect(extractSelectedOptionCode('A')).toBe('A');
  });

  test('✅ JSON string format: "{\\"selectedOptionCode\\":\\"A\\"}"', () => {
    expect(extractSelectedOptionCode('{"selectedOptionCode":"A"}')).toBe('A');
  });

  test('✅ Mixed payload formats across questions in a single assessment attempt', () => {
    const attemptAnswers = [
      { payload: { selectedOptionCode: 'A' }, expected: 'A' },
      { payload: { option: 'B' }, expected: 'B' },
      { payload: { code: 'C' }, expected: 'C' },
      { payload: { answer: 'D' }, expected: 'D' },
      { payload: 'A', expected: 'A' },
      { payload: '{"option":"C"}', expected: 'C' },
      { payload: { text: 'Essay response content' }, expected: null },
    ];

    attemptAnswers.forEach((item, index) => {
      const extracted = extractSelectedOptionCode(item.payload);
      expect(extracted, `Question ${index + 1} payload failed extraction`).toBe(item.expected);
    });
  });

  test('✅ Essay payload format: { text: "..." } => returns null', () => {
    expect(
      extractSelectedOptionCode({
        text: 'In recent years, distance education has transformed learning...',
      })
    ).toBeNull();
  });

  test('✅ Malformed JSON string: "{invalid" => returns null', () => {
    expect(extractSelectedOptionCode('{invalid')).toBeNull();
  });

  test('✅ Empty object: {} => returns null', () => {
    expect(extractSelectedOptionCode({})).toBeNull();
  });

  test('✅ Null & undefined inputs => returns null', () => {
    expect(extractSelectedOptionCode(null)).toBeNull();
    expect(extractSelectedOptionCode(undefined)).toBeNull();
  });
});
