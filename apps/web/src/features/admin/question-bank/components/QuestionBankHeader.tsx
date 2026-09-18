'use client';

import React from 'react';
import { Database, Upload, Plus } from 'lucide-react';
import { Button } from '../../../../shared/ui/button/Button';

export interface QuestionBankHeaderProps {
  totalCount: number;
  loading: boolean;
  onImport: () => void;
  onAddQuestion: () => void;
}

export const QuestionBankHeader: React.FC<QuestionBankHeaderProps> = ({
  totalCount,
  loading,
  onImport,
  onAddQuestion,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      {/* Left: Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--brand-subtle)',
            border: '1px solid var(--brand-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-light)',
            flexShrink: 0,
          }}
        >
          <Database size={20} />
        </div>

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              flexWrap: 'wrap',
            }}
          >
            Question Bank
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {loading ? '…' : totalCount.toLocaleString()} items
            </span>
          </h1>
          <p
            style={{
              margin: '0.3rem 0 0',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
            }}
          >
            Curate, review, and publish exam items for IELTS, TOEFL, SAT, CELPIP &amp; English
            Proficiency.
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button
          variant="secondary"
          size="md"
          onClick={onImport}
          leftIcon={<Upload size={15} />}
        >
          Bulk Import
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={onAddQuestion}
          leftIcon={<Plus size={15} />}
        >
          Add Question
        </Button>
      </div>
    </div>
  );
};
