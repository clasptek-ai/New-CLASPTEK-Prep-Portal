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
  const [title, setTitle] = useState(`English Proficiency Pre-Assessment`);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      try {
        // Try fetching attempt details if attemptId is present
        if (attemptId && !attemptId.startsWith('att-')) {
          const attemptRes = await fetch(`/api/v1/diagnostic/attempts/${encodeURIComponent(attemptId)}`);
          const attemptData = await attemptRes.json();

          if (attemptData.success && attemptData.content) {
            const { grammarQuestions, readingPassage, writingTasks } = attemptData.content;

            const grammarSectionQuestions: PlayerQuestion[] = (grammarQuestions || []).map((q: any) => ({
              id: q.id,
              versionId: q.versionId,
              code: q.code,
              prompt: q.prompt,
              itemType: 'MCQ' as const,
              options: q.options || [],
              sectionCode: 'GRAMMAR',
            }));

            const readingQuestion: PlayerQuestion = {
              id: 'q-reading-01',
              versionId: 'qv-reading-01',
              code: 'ENG-READ-01',
              prompt: 'Based on the passage above, analyze the primary thesis and key supporting evidence presented by the author.',
              itemType: 'MCQ' as const,
              options: [
                { code: 'A', text: 'Sustainable infrastructure reduces long-term operational costs and carbon footprint.' },
                { code: 'B', text: 'Urban densification completely eliminates public transportation demands.' },
                { code: 'C', text: 'Historical building materials should be replaced entirely with synthetic compounds.' },
                { code: 'D', text: 'Energy market regulations hinder technological adoption.' },
              ],
              passageTitle: readingPassage?.title || 'Sustainable Urban Infrastructure',
              passageContent: readingPassage?.content || 'Over the past three decades, European governments have heavily invested in offshore wind farms and solar grids...',
              sectionCode: 'READING',
            };

            const writingSectionQuestions: PlayerQuestion[] = (writingTasks || []).map((w: any, idx: number) => ({
              id: w.id || `q-w-${idx + 1}`,
              versionId: `qv-w-${idx + 1}`,
              code: w.code || `ENG-WRIT-T${idx + 1}`,
              prompt: `${w.title || `Task ${idx + 1}`}: ${w.prompt}\n\n${w.instructions || ''}`,
              itemType: 'ESSAY' as const,
              sectionCode: 'WRITING',
            }));

            const canonicalSections: PlayerSection[] = [
              {
                id: 'sec-grammar',
                code: 'GRAMMAR',
                name: 'Grammar (30 Objective Items)',
                timeLimitMinutes: 20,
                instructions: 'Complete all 30 Grammar questions evaluating Foundation, Intermediate, and Advanced proficiency.',
                questions: grammarSectionQuestions,
              },
              {
                id: 'sec-reading',
                code: 'READING',
                name: 'Reading Comprehension',
                timeLimitMinutes: 10,
                instructions: 'Read the passage carefully and answer the comprehension item.',
                questions: [readingQuestion],
              },
              {
                id: 'sec-writing',
                code: 'WRITING',
                name: 'Writing Expression (Essay & Letter Tasks)',
                timeLimitMinutes: 15,
                instructions: 'Complete both Task 1 (Letter Writing) and Task 2 (Essay Writing).',
                questions: writingSectionQuestions,
              },
            ];

            setSections(canonicalSections);
            setTitle('English Proficiency Pre-Assessment');
            setLoading(false);
            return;
          }
        }

        // Fallback / Standard Config Fetch
        const res = await fetch(`/api/v1/diagnostic/config/${encodeURIComponent(examType)}`);
        const data = await res.json();
        if (data.success && data.sections) {
          setTitle(data.definition?.title || `English Proficiency Pre-Assessment`);
          
          const contentAssets = data.contentAssets || {};
          const dbPassage = contentAssets.readingPassage;
          const dbWriting = contentAssets.writingTask;

          const foundationGrammar: PlayerQuestion[] = Array.from({ length: 10 }).map((_, i) => ({
            id: `q-g-fnd-${i + 1}`,
            versionId: `qv-g-fnd-${i + 1}`,
            code: `ENG-G-FND-${(i + 1).toString().padStart(2, '0')}`,
            prompt: `[Foundation Grammar Item ${i + 1}] Select the sentence that uses correct subject-verb agreement:`,
            itemType: 'MCQ' as const,
            options: [
              { code: 'A', text: 'The report provides clear insights into market growth.' },
              { code: 'B', text: 'The report provide clear insights into market growth.' },
              { code: 'C', text: 'The report providing clear insights into market growth.' },
              { code: 'D', text: 'The report provided have clear insights into market growth.' },
            ],
            sectionCode: 'GRAMMAR',
          }));

          const intermediateGrammar: PlayerQuestion[] = Array.from({ length: 10 }).map((_, i) => ({
            id: `q-g-int-${i + 1}`,
            versionId: `qv-g-int-${i + 1}`,
            code: `ENG-G-INT-${(i + 1).toString().padStart(2, '0')}`,
            prompt: `[Intermediate Grammar Item ${i + 1}] Choose the correct verb tense for past continuous context:`,
            itemType: 'MCQ' as const,
            options: [
              { code: 'A', text: 'They were analyzing the dataset when the system crashed.' },
              { code: 'B', text: 'They are analyze the dataset when system crashed.' },
              { code: 'C', text: 'They analyze dataset when system crashing.' },
              { code: 'D', text: 'They have analyze dataset when system crashed.' },
            ],
            sectionCode: 'GRAMMAR',
          }));

          const advancedGrammar: PlayerQuestion[] = Array.from({ length: 10 }).map((_, i) => ({
            id: `q-g-adv-${i + 1}`,
            versionId: `qv-g-adv-${i + 1}`,
            code: `ENG-G-ADV-${(i + 1).toString().padStart(2, '0')}`,
            prompt: `[Advanced Grammar Item ${i + 1}] Select the sentence using inverted structure correctly:`,
            itemType: 'MCQ' as const,
            options: [
              { code: 'A', text: 'Hardly had the conference begun when the keynote speaker arrived.' },
              { code: 'B', text: 'Hardly the conference had begun when keynote speaker arrived.' },
              { code: 'C', text: 'Hardly begun the conference when keynote speaker arrived.' },
              { code: 'D', text: 'Hardly has the conference begin when speaker arrived.' },
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
            prompt: dbWriting?.prompt || 'Task 2 (Essay Writing): Write an essay (minimum 250 words) discussing whether remote learning is as effective as traditional classroom education.',
            itemType: 'ESSAY' as const,
            sectionCode: 'WRITING',
          };

          const englishProficiencySections: PlayerSection[] = [
            {
              id: 'sec-grammar',
              code: 'GRAMMAR',
              name: 'Grammar (30 Objective Items)',
              timeLimitMinutes: 20,
              instructions: 'Complete all 30 Grammar questions evaluating Foundation, Intermediate, and Advanced proficiency.',
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
              name: 'Writing Expression (Essay & Letter Tasks)',
              timeLimitMinutes: 15,
              instructions: 'Complete both Task 1 (Letter Writing) and Task 2 (Essay Writing).',
              questions: [writingTask1, writingTask2],
            },
          ];

          setSections(englishProficiencySections);
        }
      } catch (err: any) {
        console.error('Error loading assessment player config:', err);
        setErrorMessage('Failed to load assessment questions.');
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [examType, attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-300">
            Initializing English Proficiency Pre-Assessment Player...
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-md bg-slate-900 p-6 rounded-xl border border-red-500/30 text-red-400">
          <div className="text-lg font-bold">Assessment Error</div>
          <p className="text-sm">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <AssessmentPlayerScreen
        assessmentId={`def-English Proficiency`}
        title={title}
        examType="English Proficiency"
        sections={sections}
        attemptId={attemptId}
      />
    </div>
  );
}

export default function AssessmentPlayerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-8">Loading Assessment Player...</div>}>
      <AssessmentPlayerContent />
    </Suspense>
  );
}
