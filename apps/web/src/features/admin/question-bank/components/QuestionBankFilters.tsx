'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import {
  ExamType,
  SectionType,
  DifficultyLevel,
  QuestionWorkflowStatus,
} from '../../../../services/admin/questions.service';

export interface QuestionBankFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedExam: ExamType | 'ALL';
  onExamChange: (v: ExamType | 'ALL') => void;
  selectedSection: SectionType | 'ALL';
  onSectionChange: (v: SectionType | 'ALL') => void;
  selectedDifficulty: DifficultyLevel | 'ALL';
  onDifficultyChange: (v: DifficultyLevel | 'ALL') => void;
  selectedStatus: QuestionWorkflowStatus | 'ALL';
  onStatusChange: (v: QuestionWorkflowStatus | 'ALL') => void;
  /** Map of status → count for the workflow tabs */
  statusCounts: Record<string, number>;
  selectedAssessment?: string;
  onAssessmentChange?: (v: string) => void;
  selectedContentKind?: string;
  onContentKindChange?: (v: string) => void;
  selectedQuestionType?: string;
  onQuestionTypeChange?: (v: string) => void;
  selectedDependency?: string;
  onDependencyChange?: (v: string) => void;
}

const SELECT_STYLE: React.CSSProperties = {
  appearance: 'none',
  backgroundColor: 'var(--surface-input)',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius-md)',
  padding: '0.45rem 0.75rem',
  color: 'var(--text-primary)',
  fontSize: '0.8125rem',
  fontFamily: 'var(--font-sans)',
  cursor: 'pointer',
  outline: 'none',
  minHeight: 'var(--touch-target-min)',
  transition: 'border-color var(--transition-fast)',
};

const WORKFLOW_STATUSES: (QuestionWorkflowStatus | 'ALL')[] = [
  'ALL',
  'DRAFT',
  'UNDER_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED',
];

export const QuestionBankFilters: React.FC<QuestionBankFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedExam,
  onExamChange,
  selectedSection,
  onSectionChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedStatus,
  onStatusChange,
  statusCounts,
  selectedAssessment = 'ALL',
  onAssessmentChange,
  selectedContentKind = 'ALL',
  onContentKindChange,
  selectedQuestionType = 'ALL',
  onQuestionTypeChange,
  selectedDependency = 'ALL',
  onDependencyChange,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* ── Workflow Status Tabs ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.375rem',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        {WORKFLOW_STATUSES.map((st) => {
          const isActive = selectedStatus === st;
          return (
            <button
              key={st}
              onClick={() => onStatusChange(st)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.875rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: isActive ? 'var(--brand-border)' : 'var(--border)',
                backgroundColor: isActive ? 'var(--brand-subtle)' : 'transparent',
                color: isActive ? 'var(--brand-light)' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <span>{st === 'ALL' ? 'All' : st.replace('_', ' ')}</span>
              <span
                style={{
                  padding: '0.05rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? 'rgba(59,130,246,0.2)' : 'var(--surface-2)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  minWidth: '20px',
                  textAlign: 'center',
                }}
              >
                {statusCounts[st] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search + Dropdown Filters ── */}
      <div
        className="card card--compact"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          padding: '0.875rem 1rem',
          backgroundColor: 'var(--surface-0)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Row 1: Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            width: '100%',
            backgroundColor: 'var(--surface-input)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '0 0.875rem',
            minHeight: 'var(--touch-target-min)',
          }}
        >
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search questions by text, code (e.g. IELTS-L1-001, ENG-WRIT-LETTER-01), skill or tags…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Row 2: Comprehensive Dropdowns (Assessment, Content Kind, Section, Question Type, QA Dependencies, Difficulty) */}
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Assessment Filter */}
          {onAssessmentChange && (
            <select
              value={selectedAssessment}
              onChange={(e) => onAssessmentChange(e.target.value)}
              style={SELECT_STYLE}
              aria-label="Filter by assessment"
            >
              <option value="ALL">All Assessments</option>
              <option value="Pre-Assessment">Pre-Assessment (Grammar, Reading, Writing)</option>
              <option value="IELTS Mock">IELTS Academic Mock Exam (40L, 40R, 2W, 24S)</option>
              <option value="IELTS Practice">IELTS Practice Inventory</option>
              <option value="Other / Unclassified">Other / Unclassified</option>
            </select>
          )}

          {/* Content Kind Filter */}
          {onContentKindChange && (
            <select
              value={selectedContentKind}
              onChange={(e) => onContentKindChange(e.target.value)}
              style={SELECT_STYLE}
              aria-label="Filter by content kind"
            >
              <option value="ALL">All Content Kinds</option>
              <option value="QUESTION">Objective Questions</option>
              <option value="WRITING_TASK">Writing Tasks</option>
              <option value="SPEAKING_PROMPT">Speaking Prompts</option>
            </select>
          )}

          {/* Section Filter */}
          <select
            value={selectedSection}
            onChange={(e) => onSectionChange(e.target.value as SectionType | 'ALL')}
            style={SELECT_STYLE}
            aria-label="Filter by section"
          >
            <option value="ALL">All Sections</option>
            <option value="Grammar">Grammar</option>
            <option value="Reading">Reading</option>
            <option value="Listening">Listening</option>
            <option value="Writing">Writing</option>
            <option value="Speaking">Speaking</option>
            <option value="Math">Math</option>
          </select>

          {/* Question Type Filter */}
          {onQuestionTypeChange && (
            <select
              value={selectedQuestionType}
              onChange={(e) => onQuestionTypeChange(e.target.value)}
              style={SELECT_STYLE}
              aria-label="Filter by question type"
            >
              <option value="ALL">All Question Types</option>
              <option value="MCQ">Multiple Choice (MCQ)</option>
              <option value="SHORT_ANSWER">Short Answer</option>
              <option value="COMPLETION">Completion</option>
              <option value="SENTENCE_COMPLETION">Sentence Completion</option>
              <option value="NOTE_COMPLETION">Note Completion</option>
              <option value="SUMMARY_COMPLETION">Summary Completion</option>
              <option value="TRUE_FALSE_NOT_GIVEN">True / False / Not Given</option>
              <option value="YES_NO_NOT_GIVEN">Yes / No / Not Given</option>
              <option value="MATCHING">Matching</option>
              <option value="MATCHING_HEADINGS">Matching Headings</option>
              <option value="MATCHING_INFORMATION">Matching Information</option>
              <option value="WRITING_TASK_1">Writing Task 1</option>
              <option value="WRITING_TASK_2">Writing Task 2</option>
              <option value="SPEAKING">Speaking Prompt</option>
            </select>
          )}

          {/* QA Content Dependency Filter */}
          {onDependencyChange && (
            <select
              value={selectedDependency}
              onChange={(e) => onDependencyChange(e.target.value)}
              style={{
                ...SELECT_STYLE,
                borderColor:
                  selectedDependency !== 'ALL' ? 'var(--brand-border)' : 'var(--border-strong)',
                backgroundColor:
                  selectedDependency !== 'ALL' ? 'var(--brand-subtle)' : 'var(--surface-input)',
                fontWeight: selectedDependency !== 'ALL' ? 700 : 500,
              }}
              aria-label="Filter by content dependency"
            >
              <option value="ALL">QA: All Dependencies</option>
              <option value="hasAnswer">✓ Has Authoritative Answer</option>
              <option value="missingAnswer">⚠️ Missing Authoritative Answer</option>
              <option value="hasPassage">✓ Has Reading Passage</option>
              <option value="missingPassage">⚠️ Missing Reading Passage</option>
              <option value="hasMedia">✓ Has Audio / Image Media</option>
            </select>
          )}

          {/* Exam Filter */}
          <select
            value={selectedExam}
            onChange={(e) => onExamChange(e.target.value as ExamType | 'ALL')}
            style={SELECT_STYLE}
            aria-label="Filter by exam"
          >
            <option value="ALL">All Exams</option>
            <option value="IELTS Academic">IELTS Academic</option>
            <option value="IELTS General Training">IELTS General</option>
            <option value="English Proficiency">English Proficiency</option>
            <option value="TOEFL iBT">TOEFL iBT</option>
            <option value="SAT">SAT</option>
            <option value="CELPIP">CELPIP</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value as DifficultyLevel | 'ALL')}
            style={SELECT_STYLE}
            aria-label="Filter by difficulty"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
            <option value="FOUNDATION">Foundation</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>
    </div>
  );
};
