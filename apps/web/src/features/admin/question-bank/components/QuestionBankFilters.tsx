'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { ExamType, SectionType, DifficultyLevel, QuestionWorkflowStatus } from '../../../../services/admin/questions.service';

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
  'ALL', 'DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED',
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
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            flex: 1,
            minWidth: '240px',
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
            placeholder="Search by text, code (e.g. IELTS-RD-001), skill or tags…"
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

        {/* Dropdown filters row */}
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <select
            value={selectedExam}
            onChange={(e) => onExamChange(e.target.value as ExamType | 'ALL')}
            style={SELECT_STYLE}
            aria-label="Filter by exam"
          >
            <option value="ALL">All Exams</option>
            <option value="IELTS Academic">IELTS Academic</option>
            <option value="IELTS General Training">IELTS General</option>
            <option value="TOEFL iBT">TOEFL iBT</option>
            <option value="SAT">SAT</option>
            <option value="CELPIP">CELPIP</option>
            <option value="English Proficiency">English Proficiency</option>
          </select>

          <select
            value={selectedSection}
            onChange={(e) => onSectionChange(e.target.value as SectionType | 'ALL')}
            style={SELECT_STYLE}
            aria-label="Filter by section"
          >
            <option value="ALL">All Sections</option>
            <option value="Reading">Reading</option>
            <option value="Listening">Listening</option>
            <option value="Writing">Writing</option>
            <option value="Speaking">Speaking</option>
            <option value="Math">Math</option>
            <option value="Grammar">Grammar</option>
          </select>

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
          </select>
        </div>
      </div>
    </div>
  );
};
