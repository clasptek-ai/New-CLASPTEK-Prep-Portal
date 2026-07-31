'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AssessmentPlayerScreen, PlayerSection, PlayerQuestion } from '@/features/assessment-player/AssessmentPlayerScreen';

function AssessmentPlayerContent() {
  const searchParams = useSearchParams();
  const examType = searchParams.get('examType') || 'English Proficiency';
  const attemptId = searchParams.get('attemptId') || `att-${Date.now()}`;

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<PlayerSection[]>([]);
  const [title, setTitle] = useState(`${examType} Diagnostic Assessment`);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`/api/v1/diagnostic/config/${encodeURIComponent(examType)}`);
        const data = await res.json();
        if (data.success && data.sections) {
          setTitle(data.definition?.title || `${examType} Diagnostic Assessment`);
          
          const contentAssets = data.contentAssets || {};
          const dbPassage = contentAssets.readingPassage;
          const dbWriting = contentAssets.writingTask;

          if (examType === 'English Proficiency') {
            // Generate exact 33 items: 30 Grammar (10 Foundation, 10 Intermediate, 10 Advanced) + 1 Reading + 2 Writing
            const foundationGrammar: PlayerQuestion[] = Array.from({ length: 10 }).map((_, i) => ({
              id: `q-g-fnd-${i + 1}`,
              versionId: `qv-g-fnd-${i + 1}`,
              code: `ENG-G-FND-${(i + 1).toString().padStart(2, '0')}`,
              prompt: `[Foundation Grammar Item ${i + 1}] Select the sentence that uses basic articles and subject-verb agreement correctly:`,
              itemType: 'MCQ' as const,
              options: [
                { code: 'A', text: 'An apple falls from the tree.' },
                { code: 'B', text: 'A apple fall from the tree.' },
                { code: 'C', text: 'The apple falling from tree.' },
                { code: 'D', text: 'An apple fall from a tree.' },
              ],
              sectionCode: 'GRAMMAR',
            }));

            const intermediateGrammar: PlayerQuestion[] = Array.from({ length: 10 }).map((_, i) => ({
              id: `q-g-int-${i + 1}`,
              versionId: `qv-g-int-${i + 1}`,
              code: `ENG-G-INT-${(i + 1).toString().padStart(2, '0')}`,
              prompt: `[Intermediate Grammar Item ${i + 1}] Choose the correct verb form for present perfect context:`,
              itemType: 'MCQ' as const,
              options: [
                { code: 'A', text: 'She has completed her assignments.' },
                { code: 'B', text: 'She have completed her assignments.' },
                { code: 'C', text: 'She completing her assignments.' },
                { code: 'D', text: 'She had complete her assignments.' },
              ],
              sectionCode: 'GRAMMAR',
            }));

            const advancedGrammar: PlayerQuestion[] = Array.from({ length: 10 }).map((_, i) => ({
              id: `q-g-adv-${i + 1}`,
              versionId: `qv-g-adv-${i + 1}`,
              code: `ENG-G-ADV-${(i + 1).toString().padStart(2, '0')}`,
              prompt: `[Advanced Grammar Item ${i + 1}] Select the sentence with appropriate inverted structure or complex clause:`,
              itemType: 'MCQ' as const,
              options: [
                { code: 'A', text: 'Seldom have I seen such dedication to research.' },
                { code: 'B', text: 'Seldom I have seen such dedication to research.' },
                { code: 'C', text: 'Seldom saw I such dedication to research.' },
                { code: 'D', text: 'Seldom have I see such dedication to research.' },
              ],
              sectionCode: 'GRAMMAR',
            }));

            const readingQuestion: PlayerQuestion = {
              id: 'q-r1',
              versionId: 'qv-r1',
              code: 'ENG-READ-01',
              prompt: 'Based on the passage, what is the principal benefit of sustainable urban planning?',
              itemType: 'MCQ' as const,
              options: [
                { code: 'A', text: 'Reduction of long-term environmental impact and improved resource efficiency' },
                { code: 'B', text: 'Immediate elimination of public transit costs' },
                { code: 'C', text: 'Unlimited urban expansion into rural agricultural zones' },
                { code: 'D', text: 'Automated architectural construction without human oversight' },
              ],
              passageTitle: dbPassage?.title || 'Sustainable Urban Development and Ecology',
              passageContent: dbPassage?.content || 'Sustainable urban planning integrates ecological conservation with modern infrastructure...',
              sectionCode: 'READING',
            };

            const writingTask1: PlayerQuestion = {
              id: 'q-w1',
              versionId: 'qv-w1',
              code: 'ENG-WRIT-T1',
              prompt: 'Task 1 (Letter Writing): Write a formal letter (minimum 150 words) to your local council requesting improved street lighting in your residential area.',
              itemType: 'ESSAY' as const,
              sectionCode: 'WRITING',
            };

            const writingTask2: PlayerQuestion = {
              id: 'q-w2',
              versionId: 'qv-w2',
              code: 'ENG-WRIT-T2',
              prompt: dbWriting?.prompt || 'Task 2 (Essay Writing): Write an essay (minimum 250 words) discussing whether artificial intelligence in education benefits or hinders critical thinking skills.',
              itemType: 'ESSAY' as const,
              sectionCode: 'WRITING',
            };

            const englishProficiencySections: PlayerSection[] = [
              {
                id: 'sec-grammar',
                code: 'GRAMMAR',
                name: 'Grammar (Foundation, Intermediate & Advanced)',
                timeLimitMinutes: 20,
                instructions: 'Complete all 30 Grammar assessment items covering Foundation, Intermediate, and Advanced proficiency levels.',
                questions: [...foundationGrammar, ...intermediateGrammar, ...advancedGrammar],
              },
              {
                id: 'sec-reading',
                code: 'READING',
                name: 'Reading Passage',
                timeLimitMinutes: 10,
                instructions: 'Read the passage carefully and answer the comprehension question.',
                questions: [readingQuestion],
              },
              {
                id: 'sec-writing',
                code: 'WRITING',
                name: 'Writing Tasks',
                timeLimitMinutes: 15,
                instructions: 'Complete both Task 1 (Letter Writing) and Task 2 (Essay Writing).',
                questions: [writingTask1, writingTask2],
              },
            ];

            setSections(englishProficiencySections);
          } else {
            // General exam product configuration mapping
            const mappedSections: PlayerSection[] = data.sections.map((sec: any) => ({
              id: sec.id,
              code: sec.code,
              name: sec.name,
              timeLimitMinutes: sec.timeLimitMinutes || 10,
              instructions: sec.instructions || `Complete all items in the ${sec.name} section.`,
              questions: [
                {
                  id: `q-${sec.id}-1`,
                  versionId: `qv-${sec.id}-1`,
                  code: `${sec.code}-Q1`,
                  prompt: `Evaluate your readiness for ${sec.name}:`,
                  itemType: 'MCQ' as const,
                  options: [
                    { code: 'A', text: 'Option A - High Readiness' },
                    { code: 'B', text: 'Option B - Moderate Readiness' },
                    { code: 'C', text: 'Option C - Developing Readiness' },
                  ],
                  sectionCode: sec.code,
                },
              ],
            }));

            setSections(mappedSections);
          }
        }
      } catch {
        // Fallback handling
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [examType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-300">
            Initializing {examType} Assessment Player...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <AssessmentPlayerScreen
        assessmentId={`def-${examType}`}
        title={title}
        examType={examType}
        sections={sections}
        attemptId={attemptId}
      />
    </div>
  );
}

export default function AssessmentPlayerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-8">Loading...</div>}>
      <AssessmentPlayerContent />
    </Suspense>
  );
}
