'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AssessmentPlayerScreen, PlayerSection } from '@/features/assessment-player/AssessmentPlayerScreen';

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
          const dbAudio = contentAssets.listeningTrack;
          const dbWriting = contentAssets.writingTask;
          const dbSpeaking = contentAssets.speakingTask;

          const mappedSections: PlayerSection[] = data.sections.map((sec: any) => {
            let questions = [];

            if (sec.name.includes('Grammar') || sec.code.includes('GRAMMAR')) {
              questions = [
                {
                  id: 'q-g1',
                  versionId: 'qv-g1',
                  code: 'ENG-G1',
                  prompt: 'Select the sentence with correct subject-verb agreement:',
                  itemType: 'MCQ' as const,
                  options: [
                    { code: 'A', text: 'The list of items are on the desk.' },
                    { code: 'B', text: 'The list of items is on the desk.' },
                    { code: 'C', text: 'The list of items were on the desk.' },
                    { code: 'D', text: 'The list of items have been on the desk.' },
                  ],
                  sectionCode: sec.code,
                },
                {
                  id: 'q-g2',
                  versionId: 'qv-g2',
                  code: 'ENG-G2',
                  prompt: 'Choose the correct tense: "By the time we arrived, she _____ her presentation."',
                  itemType: 'MCQ' as const,
                  options: [
                    { code: 'A', text: 'has finished' },
                    { code: 'B', text: 'had finished' },
                    { code: 'C', text: 'finishes' },
                    { code: 'D', text: 'will finish' },
                  ],
                  sectionCode: sec.code,
                },
              ];
            } else if (sec.name.includes('Reading') || sec.code.includes('READING')) {
              questions = [
                {
                  id: 'q-r1',
                  versionId: 'qv-r1',
                  code: 'ENG-R1',
                  prompt: 'What is the main topic of the passage?',
                  itemType: 'MCQ' as const,
                  options: [
                    { code: 'A', text: 'The historical development of global trade networks' },
                    { code: 'B', text: 'Agricultural techniques in ancient civilisations' },
                    { code: 'C', text: 'Modern transport logistics' },
                    { code: 'D', text: 'Urbanisation patterns' },
                  ],
                  passageTitle: dbPassage?.title || 'The Evolution of Maritime Trade',
                  passageContent: dbPassage?.content || 'Maritime trade has served as the backbone of international commerce for over two millennia...',
                  sectionCode: sec.code,
                },
              ];
            } else if (sec.name.includes('Writing') || sec.code.includes('WRITING')) {
              questions = [
                {
                  id: 'q-w1',
                  versionId: 'qv-w1',
                  code: 'ENG-W1',
                  prompt: dbWriting?.prompt || 'Write an essay (minimum 150 words) discussing whether remote learning is as effective as traditional classroom education.',
                  itemType: 'ESSAY' as const,
                  sectionCode: sec.code,
                },
              ];
            } else if (sec.name.includes('Listening') || sec.code.includes('LISTENING')) {
              questions = [
                {
                  id: 'q-l1',
                  versionId: 'qv-l1',
                  code: 'ENG-L1',
                  prompt: 'According to the speaker, what is the primary reason for the schedule adjustment?',
                  itemType: 'MCQ' as const,
                  options: [
                    { code: 'A', text: 'Unfavourable weather forecast' },
                    { code: 'B', text: 'Maintenance works on venue facilities' },
                    { code: 'C', text: 'Speaker unavailability' },
                    { code: 'D', text: 'Budget reallocations' },
                  ],
                  audioUrl: dbAudio?.url || 'https://cdn.clasptek.com/audio/eng-prof-diagnostic-track-1.mp3',
                  sectionCode: sec.code,
                },
              ];
            } else if (sec.name.includes('Speaking') || sec.code.includes('SPEAKING')) {
              questions = [
                {
                  id: 'q-s1',
                  versionId: 'qv-s1',
                  code: 'ENG-S1',
                  prompt: dbSpeaking?.prompt || 'Describe a memorable journey you have taken. Speak for 1-2 minutes.',
                  itemType: 'SPEAKING_PROMPT' as const,
                  cueCardPoints: [
                    'Where you went and who you were with',
                    'How you traveled there',
                    'What made the trip memorable',
                  ],
                  sectionCode: sec.code,
                },
              ];
            } else {
              questions = [
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
              ];
            }

            return {
              id: sec.id,
              code: sec.code,
              name: sec.name,
              timeLimitMinutes: sec.timeLimitMinutes || 10,
              instructions: sec.instructions || `Complete all items in the ${sec.name} section.`,
              questions,
            };
          });

          setSections(mappedSections);
        }
      } catch {
        // Fallback error handling
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
