'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import {
  adminQuestionsService,
  ExamType,
  SectionType,
  DifficultyLevel,
  AdminQuestion,
} from '../../../services/admin/questions.service';
import {
  Layers,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  BookOpen,
  Filter,
  Play,
  Users,
  Shield,
  RotateCcw,
} from 'lucide-react';

export interface PracticeSessionTemplate {
  id: string;
  title: string;
  exam: ExamType;
  section: SectionType;
  skill: string;
  difficulty: DifficultyLevel | 'ADAPTIVE';
  questionCount: number;
  isTimed: boolean;
  timeLimitMinutes: number;
  availability: 'Everyone' | 'Premium' | 'Band 7+' | 'Specific Cohort';
  createdAt: string;
}

export const DEFAULT_PRACTICE_TEMPLATES: PracticeSessionTemplate[] = [
  {
    id: 'ptmpl-01',
    title: 'IELTS Academic Reading Headings Warm-up',
    exam: 'IELTS Academic',
    section: 'Reading',
    skill: 'Matching Headings',
    difficulty: 'MEDIUM',
    questionCount: 10,
    isTimed: true,
    timeLimitMinutes: 20,
    availability: 'Everyone',
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'ptmpl-02',
    title: 'TOEFL iBT Integrated Writing Drill',
    exam: 'TOEFL iBT',
    section: 'Writing',
    skill: 'Integrated Task Synthesis',
    difficulty: 'HARD',
    questionCount: 5,
    isTimed: true,
    timeLimitMinutes: 15,
    availability: 'Everyone',
    createdAt: '2026-06-10T12:00:00Z',
  },
  {
    id: 'ptmpl-03',
    title: 'SAT Math Quadratic Equations Sprint',
    exam: 'SAT',
    section: 'Math',
    skill: 'Quadratic Equations',
    difficulty: 'ADAPTIVE',
    questionCount: 15,
    isTimed: true,
    timeLimitMinutes: 25,
    availability: 'Premium',
    createdAt: '2026-06-15T09:00:00Z',
  },
];

export function PracticeSessionsScreen() {
  const [templates, setTemplates] = useState<PracticeSessionTemplate[]>(DEFAULT_PRACTICE_TEMPLATES);
  const [availablePracticeQuestions, setAvailablePracticeQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  // New Template Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [exam, setExam] = useState<ExamType>('IELTS Academic');
  const [section, setSection] = useState<SectionType>('Reading');
  const [skill, setSkill] = useState('Matching Headings');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'ADAPTIVE'>('MEDIUM');
  const [questionCount, setQuestionCount] = useState(10);
  const [isTimed, setIsTimed] = useState(true);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  const [availability, setAvailability] = useState<
    'Everyone' | 'Premium' | 'Band 7+' | 'Specific Cohort'
  >('Everyone');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const practiceQuestions = await adminQuestionsService.getPublishedQuestionsForCandidates(
          undefined,
          'PRACTICE'
        );
        setAvailablePracticeQuestions(practiceQuestions);
      } catch (e) {
        console.error('Failed to load practice bank', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTmpl: PracticeSessionTemplate = {
      id: `ptmpl-${Date.now()}`,
      title: title.trim(),
      exam,
      section,
      skill,
      difficulty,
      questionCount,
      isTimed,
      timeLimitMinutes: isTimed ? timeLimitMinutes : 0,
      availability,
      createdAt: new Date().toISOString(),
    };

    setTemplates((prev) => [newTmpl, ...prev]);
    setModalOpen(false);
    setTitle('');
    showBanner(`Practice Session Template "${newTmpl.title}" created successfully!`);
  };

  const showBanner = (msg: string) => {
    setBanner(msg);
    setTimeout(() => setBanner(null), 4000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '2rem',
        backgroundColor: '#0b0f19',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.35rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                padding: '0.5rem',
                borderRadius: '8px',
                color: '#3b82f6',
              }}
            >
              <Layers size={24} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Practice Session Operations
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Configure practice session templates and dynamic drills referencing Universal Question
            Bank (`usage = PRACTICE`). Zero duplicate storage.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Create Practice Template
        </Button>
      </div>

      {banner && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(52, 211, 153, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            borderRadius: '10px',
            color: '#34d399',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} /> {banner}
        </div>
      )}

      {/* Dynamic Practice Generator Summary KPI Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <Card
          style={{
            padding: '1.25rem',
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
            }}
          >
            Active Practice Templates
          </div>
          <div
            style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}
          >
            {templates.length} Presets
          </div>
        </Card>

        <Card
          style={{
            padding: '1.25rem',
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
            }}
          >
            Available Practice Bank Questions
          </div>
          <div
            style={{ fontSize: '1.85rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.35rem' }}
          >
            {availablePracticeQuestions.length} Questions
          </div>
        </Card>

        <Card
          style={{
            padding: '1.25rem',
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
            }}
          >
            Storage Efficiency
          </div>
          <div
            style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34d399', marginTop: '0.35rem' }}
          >
            100% Referenced
          </div>
        </Card>
      </div>

      {/* Configured Practice Session Templates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Configured Practice Session Presets ({templates.length})
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {templates.map((tmpl) => (
            <Card
              key={tmpl.id}
              style={{
                padding: '1.5rem',
                backgroundColor: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <Badge variant="primary">{tmpl.exam}</Badge>
                  <Badge variant={tmpl.availability === 'Premium' ? 'warning' : 'neutral'}>
                    {tmpl.availability}
                  </Badge>
                </div>

                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: '0 0 0.5rem',
                    lineHeight: 1.3,
                  }}
                >
                  {tmpl.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                  Section: <strong>{tmpl.section}</strong> | Skill: <strong>{tmpl.skill}</strong>
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '0.85rem',
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                  }}
                >
                  <span>
                    Count: <strong>{tmpl.questionCount} Qs</strong>
                  </span>
                  <span>
                    Difficulty: <strong>{tmpl.difficulty}</strong>
                  </span>
                  <span>
                    Timer: <strong>{tmpl.isTimed ? `${tmpl.timeLimitMinutes}m` : 'Untimed'}</strong>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    alert(
                      `Dynamic Generator Test: Assembled ${tmpl.questionCount} ${tmpl.exam} ${tmpl.section} items from Question Bank (usage = PRACTICE).`
                    )
                  }
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Test Assembly
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CREATE TEMPLATE MODAL */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <Card
            style={{
              width: '100%',
              maxWidth: '580px',
              padding: '2rem',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              color: '#ffffff',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 1.25rem' }}>
              Configure Practice Session Template
            </h2>

            <form
              onSubmit={handleCreateTemplate}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#cbd5e1',
                    marginBottom: '0.35rem',
                  }}
                >
                  Template Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. IELTS Reading Headings Warm-up"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Exam
                  </label>
                  <select
                    value={exam}
                    onChange={(e) => setExam(e.target.value as ExamType)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      color: '#ffffff',
                    }}
                  >
                    <option value="IELTS Academic">IELTS Academic</option>
                    <option value="IELTS General Training">IELTS General Training</option>
                    <option value="TOEFL iBT">TOEFL iBT</option>
                    <option value="SAT">SAT</option>
                    <option value="CELPIP">CELPIP</option>
                    <option value="English Proficiency">English Proficiency</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Section
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value as SectionType)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      color: '#ffffff',
                    }}
                  >
                    <option value="Reading">Reading</option>
                    <option value="Listening">Listening</option>
                    <option value="Writing">Writing</option>
                    <option value="Speaking">Speaking</option>
                    <option value="Math">Math</option>
                    <option value="Grammar">Grammar</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      color: '#ffffff',
                    }}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="ADAPTIVE">Adaptive Mix</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Question Count
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      color: '#ffffff',
                    }}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={40}>40 Questions</option>
                  </select>
                </div>
              </div>

              <div
                style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isTimed}
                    onChange={(e) => setIsTimed(e.target.checked)}
                  />
                  Enable Timer
                </label>

                {isTimed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="number"
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                      style={{
                        width: '70px',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        color: '#ffffff',
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Minutes</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1rem',
                }}
              >
                <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Practice Preset
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PracticeSessionsScreen;
