/**
 * Canonical Answer Extraction Utility for Assessment Engine
 *
 * Single source of truth for extracting candidate option codes ('A', 'B', 'C', 'D')
 * from all known current, legacy, and alternate payload formats.
 */
export function extractSelectedOptionCode(raw: unknown): string | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  let value: unknown = raw;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        value = JSON.parse(trimmed);
      } catch {
        // Return null for malformed JSON strings starting with { or [
        return null;
      }
    } else {
      value = trimmed;
    }
  }

  if (typeof value === 'string') {
    return value.length > 0 ? value : null;
  }

  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;

    // Return null for essay payloads containing text without objective option codes
    if (
      typeof obj.text === 'string' &&
      !obj.selectedOptionCode &&
      !obj.option &&
      !obj.code &&
      !obj.answer
    ) {
      return null;
    }

    const extracted =
      (typeof obj.selectedOptionCode === 'string' && obj.selectedOptionCode) ||
      (typeof obj.option === 'string' && obj.option) ||
      (typeof obj.code === 'string' && obj.code) ||
      (typeof obj.answer === 'string' && obj.answer) ||
      null;

    return extracted ? extracted.trim() : null;
  }

  return null;
}
