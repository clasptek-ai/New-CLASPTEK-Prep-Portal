import { ProgrammeRegistry } from '@/features/dashboard/models/programme-registry';

export interface CanonicalProgrammeInfo {
  id: string; // e.g. "IELTS_ACADEMIC"
  title: string; // e.g. "IELTS Academic Prep"
  aliases: string[];
}

const CANONICAL_ALIASES: Record<string, string[]> = {
  IELTS_ACADEMIC: ['IELTS Academic Prep', 'IELTS Academic', 'IELTS_ACADEMIC', 'IELTS'],
  IELTS_GENERAL: ['IELTS General Training', 'IELTS General', 'IELTS_GENERAL'],
  SAT: ['SAT Digital Prep', 'SAT Digital', 'SAT', 'DIGITAL_SAT'],
  TOEFL: ['TOEFL iBT Prep', 'TOEFL iBT', 'TOEFL'],
  CELPIP: ['CELPIP General Prep', 'CELPIP General', 'CELPIP'],
  ENGLISH_PROFICIENCY: ['English Proficiency', 'English Proficiency Core', 'ENGLISH_PROFICIENCY'],
};

/**
 * Shared canonical programme resolution helper used across student-scoped API routes and services.
 * Normalizes input display strings and raw IDs to a single authoritative canonical programme identity.
 */
export function getCanonicalProgramme(rawInput?: string | null): CanonicalProgrammeInfo {
  const config = ProgrammeRegistry.get(rawInput || 'IELTS_ACADEMIC');
  const canonicalId = config.id;

  const aliases = CANONICAL_ALIASES[canonicalId] || [config.title, canonicalId];

  return {
    id: canonicalId,
    title: config.title,
    aliases,
  };
}

/**
 * Validates whether two raw programme inputs resolve to the exact same canonical programme identity.
 */
export function isSameCanonicalProgramme(rawA?: string | null, rawB?: string | null): boolean {
  if (!rawA || !rawB) return false;
  const progA = getCanonicalProgramme(rawA);
  const progB = getCanonicalProgramme(rawB);
  return progA.id === progB.id;
}
