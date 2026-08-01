'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AssessmentPlayerScreen, PlayerSection, PlayerQuestion } from '@/features/assessment-player/AssessmentPlayerScreen';

function AssessmentPlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const attemptId = searchParams.get('attemptId');

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<PlayerSection[]>([]);
  const [title, setTitle] = useState('Assessment Engine Player');
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState(2700);
  const [initialSavedAnswers, setInitialSavedAnswers] = useState<Record<string, any>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadAttemptQuestions() {
      if (!attemptId) {
        setErrorMessage('Missing assessment attempt ID. Please return to the gateway.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/v1/assessment-attempts/${encodeURIComponent(attemptId)}/questions`);
        const json = await res.json();

        if (!res.ok || !json.success || !json.data) {
          setErrorMessage(json.error || json.message || 'Failed to load attempt questions.');
          setLoading(false);
          return;
        }

        const {
          assessment,
          remainingTime,
          grammarQuestions,
          readingPassage,
          writingTasks,
          savedAnswers,
        } = json.data;

        setTitle(assessment?.title || 'Placement Assessment');
        setRemainingTimeSeconds(remainingTime || 2700);
        if (savedAnswers) {
          setInitialSavedAnswers(savedAnswers);
        }

        // Build generic player section models dynamically from snapshot
        const grammarSectionQuestions: PlayerQuestion[] = (grammarQuestions || []).map((q: any, i: number) => ({
          id: q.id,
          versionId: q.versionId || q.id,
          code: q.code || `Q-${i + 1}`,
          prompt: q.prompt,
          itemType: 'MCQ' as const,
          options: q.options || [],
          sectionCode: 'GRAMMAR',
        }));

        // RC1 Phase 4: Reading questions served from snapshot — never hardcoded
        // readingPassage.comprehensionQuestions is frozen at attempt creation time
        const readingCompQs: PlayerQuestion[] = (readingPassage?.comprehensionQuestions || []).map(
          (cq: any, cIdx: number) => ({
            id: cq.id || `comp-${cIdx}`,
            versionId: cq.versionId || `compv-${cIdx}`,
            code: cq.code || `ENG-READ-${(cIdx + 1).toString().padStart(2, '0')}`,
            prompt: cq.prompt || 'Based on the passage, answer the following question.',
            itemType: 'MCQ' as const,
            options: cq.options || [],
            passageTitle: readingPassage?.title || 'Reading Passage',
            passageContent: readingPassage?.content || '',
            sectionCode: 'READING',
          })
        );

        // Maintain a single top-level readingQuestion reference for backward compat
        const readingQuestion: PlayerQuestion | null =
          readingPassage && readingCompQs.length > 0 ? readingCompQs[0] : null;

        const writingSectionQuestions: PlayerQuestion[] = (writingTasks || []).map((w: any, idx: number) => ({
          id: w.id || `q-w-${idx + 1}`,
          versionId: `qv-w-${idx + 1}`,
          code: w.code || `ENG-WRIT-T${idx + 1}`,
          prompt: `${w.title || `Task ${idx + 1}`}: ${w.prompt}\n\n${w.instructions || ''}`,
          itemType: 'ESSAY' as const,
          sectionCode: 'WRITING',
        }));

        const canonicalSections: PlayerSection[] = [];

        if (grammarSectionQuestions.length > 0) {
          canonicalSections.push({
            id: 'sec-grammar',
            code: 'GRAMMAR',
            name: `Grammar & Structure (${grammarSectionQuestions.length} Items)`,
            timeLimitMinutes: 20,
            instructions: 'Answer all objective items evaluating structural precision.',
            questions: grammarSectionQuestions,
          });
        }

        if (readingQuestion) {
          canonicalSections.push({
            id: 'sec-reading',
            code: 'READING',
            name: 'Reading Comprehension',
            timeLimitMinutes: 10,
            instructions: 'Read the passage carefully and analyze the core arguments.',
            questions: [readingQuestion],
          });
        }

        if (writingSectionQuestions.length > 0) {
          canonicalSections.push({
            id: 'sec-writing',
            code: 'WRITING',
            name: `Writing Expression (${writingSectionQuestions.length} Tasks)`,
            timeLimitMinutes: 15,
            instructions: 'Complete all assigned writing prompts within the duration.',
            questions: writingSectionQuestions,
          });
        }

        setSections(canonicalSections);
      } catch (err: any) {
        console.error('Error loading attempt questions from API:', err);
        setErrorMessage('Network error occurred while fetching assessment questions.');
      } finally {
        setLoading(false);
      }
    }

    loadAttemptQuestions();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-300">
            Loading Assessment Paper from Server...
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !attemptId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md bg-slate-900 p-6 rounded-xl border border-red-500/30 text-red-400">
          <div className="text-lg font-bold">Assessment Error</div>
          <p className="text-sm text-slate-300">{errorMessage || 'Invalid Attempt Session'}</p>
          <button
            onClick={() => router.push('/student/welcome')}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Return to Gateway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <AssessmentPlayerScreen
        assessmentId={`attempt-${attemptId}`}
        title={title}
        examType="Universal Assessment"
        sections={sections}
        attemptId={attemptId}
        initialRemainingTime={remainingTimeSeconds}
        initialSavedAnswers={initialSavedAnswers}
      />
    </div>
  );
}

export default function AssessmentPlayerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-8">Loading Universal Assessment Player...</div>}>
      <AssessmentPlayerContent />
    </Suspense>
  );
}
