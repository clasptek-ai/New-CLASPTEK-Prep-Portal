/**
 * Deterministic Mock Utility
 * Generates stable, repeatable identifiers for development and offline fallback modes.
 * Ensures literal strings like 'stud-active-123' are not hardcoded.
 */

export function getDeterministicId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `mock-id-${Math.abs(hash)}`;
}

export function getDeterministicName(email: string): string {
  const parts = email.split('@')[0].split('.');
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}
