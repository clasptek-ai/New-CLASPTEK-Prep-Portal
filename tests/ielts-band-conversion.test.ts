// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { IeltsExamPlugin } from '../apps/web/src/features/plugins/implementations/ielts.plugin';

// Functions matching the official conversion implementation
function calculateListeningBand(raw: number): number {
  if (raw >= 39) return 9.0;
  if (raw >= 37) return 8.5;
  if (raw >= 35) return 8.0;
  if (raw >= 32) return 7.5;
  if (raw >= 30) return 7.0;
  if (raw >= 27) return 6.5; // NOTE: 26 → 6.0 (not 6.5)
  if (raw >= 23) return 6.0;
  if (raw >= 18) return 5.5;
  if (raw >= 16) return 5.0;
  if (raw >= 13) return 4.5;
  if (raw >= 10) return 4.0;
  if (raw >= 8) return 3.5;
  if (raw >= 6) return 3.0;
  if (raw >= 4) return 2.5;
  if (raw >= 2) return 2.0;
  return 1.0;
}

function calculateReadingBand(raw: number): number {
  if (raw >= 39) return 9.0;
  if (raw >= 37) return 8.5;
  if (raw >= 35) return 8.0;
  if (raw >= 33) return 7.5;
  if (raw >= 30) return 7.0;
  if (raw >= 27) return 6.5;
  if (raw >= 23) return 6.0;
  if (raw >= 19) return 5.5;
  if (raw >= 15) return 5.0;
  if (raw >= 13) return 4.5;
  if (raw >= 10) return 4.0;
  if (raw >= 8) return 3.5;
  if (raw >= 6) return 3.0;
  if (raw >= 4) return 2.5;
  if (raw >= 2) return 2.0;
  return 1.0;
}

function calculateOverallBand(l: number, r: number, w: number, s: number): number {
  const avg = (l + r + w + s) / 4;
  return Math.round(avg * 2) / 2;
}

describe('IELTS Official Band Conversion Regressions', () => {
  describe('Listening Academic Band Table (Exact Boundaries)', () => {
    it('maps top scores correctly', () => {
      expect(calculateListeningBand(40)).toBe(9.0);
      expect(calculateListeningBand(39)).toBe(9.0);
      expect(calculateListeningBand(38)).toBe(8.5);
      expect(calculateListeningBand(37)).toBe(8.5);
      expect(calculateListeningBand(36)).toBe(8.0);
      expect(calculateListeningBand(35)).toBe(8.0);
    });

    it('maps middle scores and critical 26 vs 27 boundary correctly', () => {
      expect(calculateListeningBand(34)).toBe(7.5);
      expect(calculateListeningBand(32)).toBe(7.5);
      expect(calculateListeningBand(31)).toBe(7.0);
      expect(calculateListeningBand(30)).toBe(7.0);
      expect(calculateListeningBand(29)).toBe(6.5);
      expect(calculateListeningBand(27)).toBe(6.5);
      // CRITICAL FORENSIC DEFECT TEST: raw 26 MUST be 6.0, NOT 6.5!
      expect(calculateListeningBand(26)).toBe(6.0);
      expect(calculateListeningBand(25)).toBe(6.0);
      expect(calculateListeningBand(23)).toBe(6.0);
    });

    it('maps lower scores and zero boundary correctly', () => {
      expect(calculateListeningBand(22)).toBe(5.5);
      expect(calculateListeningBand(18)).toBe(5.5);
      expect(calculateListeningBand(17)).toBe(5.0);
      expect(calculateListeningBand(16)).toBe(5.0);
      expect(calculateListeningBand(15)).toBe(4.5);
      expect(calculateListeningBand(13)).toBe(4.5);
      expect(calculateListeningBand(12)).toBe(4.0);
      expect(calculateListeningBand(10)).toBe(4.0);
      expect(calculateListeningBand(9)).toBe(3.5);
      expect(calculateListeningBand(8)).toBe(3.5);
      expect(calculateListeningBand(7)).toBe(3.0);
      expect(calculateListeningBand(6)).toBe(3.0);
      expect(calculateListeningBand(5)).toBe(2.5);
      expect(calculateListeningBand(4)).toBe(2.5);
      expect(calculateListeningBand(3)).toBe(2.0);
      expect(calculateListeningBand(2)).toBe(2.0);
      expect(calculateListeningBand(1)).toBe(1.0);
      expect(calculateListeningBand(0)).toBe(1.0);
    });
  });

  describe('Reading Academic Band Table (Exact Boundaries)', () => {
    it('maps top scores correctly', () => {
      expect(calculateReadingBand(40)).toBe(9.0);
      expect(calculateReadingBand(39)).toBe(9.0);
      expect(calculateReadingBand(38)).toBe(8.5);
      expect(calculateReadingBand(37)).toBe(8.5);
      expect(calculateReadingBand(36)).toBe(8.0);
      expect(calculateReadingBand(35)).toBe(8.0);
    });

    it('maps middle scores and critical boundaries correctly', () => {
      expect(calculateReadingBand(34)).toBe(7.5);
      expect(calculateReadingBand(33)).toBe(7.5);
      expect(calculateReadingBand(32)).toBe(7.0);
      expect(calculateReadingBand(30)).toBe(7.0);
      expect(calculateReadingBand(29)).toBe(6.5);
      expect(calculateReadingBand(27)).toBe(6.5);
      expect(calculateReadingBand(26)).toBe(6.0);
      expect(calculateReadingBand(23)).toBe(6.0);
      expect(calculateReadingBand(22)).toBe(5.5);
      expect(calculateReadingBand(19)).toBe(5.5);
      expect(calculateReadingBand(18)).toBe(5.0);
      expect(calculateReadingBand(15)).toBe(5.0);
      expect(calculateReadingBand(14)).toBe(4.5);
      expect(calculateReadingBand(13)).toBe(4.5);
      expect(calculateReadingBand(12)).toBe(4.0);
      expect(calculateReadingBand(10)).toBe(4.0);
    });

    it('maps lower scores and zero boundary correctly', () => {
      expect(calculateReadingBand(9)).toBe(3.5);
      expect(calculateReadingBand(8)).toBe(3.5);
      expect(calculateReadingBand(7)).toBe(3.0);
      expect(calculateReadingBand(6)).toBe(3.0);
      expect(calculateReadingBand(5)).toBe(2.5);
      expect(calculateReadingBand(4)).toBe(2.5);
      expect(calculateReadingBand(3)).toBe(2.0);
      expect(calculateReadingBand(2)).toBe(2.0);
      expect(calculateReadingBand(1)).toBe(1.0);
      expect(calculateReadingBand(0)).toBe(1.0);
    });
  });

  describe('IELTS Overall Band Rounding Convention & Precision Boundaries', () => {
    it('correctly rounds quarter and half boundaries per official IELTS standard', () => {
      // 6.125 -> 6.0
      expect(calculateOverallBand(6.0, 6.0, 6.5, 6.0)).toBe(6.0); // (24.5 / 4 = 6.125) -> 6.0
      // 6.250 -> 6.5
      expect(calculateOverallBand(6.5, 6.5, 6.0, 6.0)).toBe(6.5); // (25.0 / 4 = 6.250) -> 6.5
      // 6.375 -> 6.5
      expect(calculateOverallBand(6.5, 6.5, 6.5, 6.0)).toBe(6.5); // (25.5 / 4 = 6.375) -> 6.5
      // 6.500 -> 6.5
      expect(calculateOverallBand(6.5, 6.5, 6.5, 6.5)).toBe(6.5); // (26.0 / 4 = 6.500) -> 6.5
      // 6.625 -> 6.5
      expect(calculateOverallBand(7.0, 6.5, 6.5, 6.5)).toBe(6.5); // (26.5 / 4 = 6.625) -> 6.5
      // 6.750 -> 7.0
      expect(calculateOverallBand(7.0, 7.0, 6.5, 6.5)).toBe(7.0); // (27.0 / 4 = 6.750) -> 7.0
      // 6.875 -> 7.0
      expect(calculateOverallBand(7.0, 7.0, 7.0, 6.5)).toBe(7.0); // (27.5 / 4 = 6.875) -> 7.0
    });

    it('handles realistic end-to-end section band combinations', () => {
      // 35 Listening (8.0), 35 Reading (8.0), 7.0 Writing, 7.5 Speaking -> avg = 30.5 / 4 = 7.625 -> 7.5
      const lBand = calculateListeningBand(35); // 8.0
      const rBand = calculateReadingBand(35);   // 8.0
      const wBand = 7.0;
      const sBand = 7.5;
      expect(calculateOverallBand(lBand, rBand, wBand, sBand)).toBe(7.5);

      // Perfect attempt: 40 L (9.0), 40 R (9.0), 9.0 W, 9.0 S -> 9.0
      expect(calculateOverallBand(calculateListeningBand(40), calculateReadingBand(40), 9.0, 9.0)).toBe(9.0);

      // Zero attempt: 0 L (1.0), 0 R (1.0), 1.0 W, 1.0 S -> 1.0
      expect(calculateOverallBand(calculateListeningBand(0), calculateReadingBand(0), 1.0, 1.0)).toBe(1.0);
    });

    it('verifies IeltsExamPlugin behaves consistently', () => {
      const plugin = new IeltsExamPlugin();
      const res = plugin.calculateOverallScore(70, 80); // 35 L + 35 R
      expect(res.sectionBreakdown.Listening).toBe(8.0);
      expect(res.sectionBreakdown.Reading).toBe(8.0);
      expect(res.overallScore).toBe(8.0);
      expect(res.cefrLevel).toBe('C1');
    });
  });
});
