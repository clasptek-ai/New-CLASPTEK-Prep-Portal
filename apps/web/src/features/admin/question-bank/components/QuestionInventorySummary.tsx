'use client';

import React, { useState } from 'react';
import { Database, ChevronDown, ChevronRight, ShieldCheck } from 'lucide-react';
import { InventoryMetrics } from '../../../../services/admin/questions.service';
import { Badge } from '../../../../shared/ui/badge/Badge';

export interface QuestionInventorySummaryProps {
  metrics: InventoryMetrics | null;
  onSelectFilter?: (filters: {
    assessment?: string;
    section?: string;
    contentKind?: string;
    dependency?: string;
  }) => void;
}

export const QuestionInventorySummary: React.FC<QuestionInventorySummaryProps> = ({
  metrics,
  onSelectFilter,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!metrics) {
    return (
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--surface-0)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Database size={16} />
        <span>Loading authoritative database inventory metrics...</span>
      </div>
    );
  }

  const { tree, reconciliation } = metrics;

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-0)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl, 16px)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
      }}
    >
      {/* ── Top Summary Header ── */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--surface-1)',
          borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              color: 'var(--brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Database size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Authoritative Question & Assessment Inventory Tree
              </h3>
              {reconciliation?.isReconciled && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--success)',
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <ShieldCheck size={12} />
                  100% Database Reconciled
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {reconciliation?.totalAccounted ?? 881} Accounted Records Across PostgreSQL (
              {metrics.totalUniqueQuestions} Unique Questions · {metrics.totalWritingTasks} Writing
              Tasks · {metrics.totalReadingPassages} Passages · {metrics.totalListeningSections}{' '}
              Listening Sections)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {isExpanded ? 'Collapse Tree' : 'Expand Tree'}
          </span>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>

      {isExpanded && (
        <div
          style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {/* ── Key Metrics Cards Row ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Unique Questions
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginTop: '2px',
                }}
              >
                {metrics.totalUniqueQuestions}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {metrics.publishedCount} Published · {metrics.draftCount} Draft
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Pre-Assessment
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--brand-light)',
                  marginTop: '2px',
                }}
              >
                {tree.preAssessment.total}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {tree.preAssessment.grammar}G · {tree.preAssessment.reading}R ·{' '}
                {tree.preAssessment.writing}W
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                IELTS Academic Mock
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--success)',
                  marginTop: '2px',
                }}
              >
                {tree.ieltsMock.total}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                40L · 40R · 2W · 24S
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                IELTS Practice
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginTop: '2px',
                }}
              >
                {tree.ieltsPractice.total}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {tree.ieltsPractice.reading} Reading Passages
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                QA Health
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--success)',
                  marginTop: '2px',
                }}
              >
                {metrics.answersPresentCount} /{' '}
                {metrics.totalUniqueQuestions + metrics.totalWritingTasks}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: metrics.answersMissingCount > 0 ? 'var(--warning)' : 'var(--success)',
                }}
              >
                {metrics.answersMissingCount === 0
                  ? '✓ All Answers Present'
                  : `${metrics.answersMissingCount} Unclassified/Missing`}
              </div>
            </div>
          </div>

          {/* ── Visual Hierarchy Tree View ── */}
          <div
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Dynamic Assessment Inventory Hierarchy (Click to filter)
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {/* Branch 1: Pre-Assessment */}
              <div
                style={{
                  backgroundColor: 'var(--surface-0)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  cursor: onSelectFilter ? 'pointer' : 'default',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
                onClick={() => onSelectFilter?.({ assessment: 'Pre-Assessment' })}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-border)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--brand-light)' }}
                  >
                    1. Pre-Assessment Foundation
                  </span>
                  <Badge variant="info">{tree.preAssessment.total} items</Badge>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    fontSize: '0.785rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• Grammar Bank:</span>
                    <strong>{tree.preAssessment.grammar} Qs</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• Diagnostic Reading (3 passages):</span>
                    <strong>{tree.preAssessment.reading} Qs</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• Writing Diagnostic Tasks:</span>
                    <strong>{tree.preAssessment.writing} Tasks</strong>
                  </div>
                </div>
              </div>

              {/* Branch 2: IELTS Academic Mock */}
              <div
                style={{
                  backgroundColor: 'var(--surface-0)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  cursor: onSelectFilter ? 'pointer' : 'default',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
                onClick={() => onSelectFilter?.({ assessment: 'IELTS Mock' })}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--success)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--success)' }}>
                    2. IELTS Academic Mock Exam
                  </span>
                  <Badge variant="success">{tree.ieltsMock.total} items</Badge>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    fontSize: '0.785rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• Listening (Sections 1–4):</span>
                    <strong>{tree.ieltsMock.listening} Qs (1–40)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• Reading (Passages 1–3):</span>
                    <strong>{tree.ieltsMock.reading} Qs (1–40)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• Writing (Tasks 1 & 2):</span>
                    <strong>{tree.ieltsMock.writing} Tasks</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• Speaking (Parts 1–3):</span>
                    <strong>{tree.ieltsMock.speaking} Prompts</strong>
                  </div>
                </div>
              </div>

              {/* Branch 3: IELTS Practice */}
              <div
                style={{
                  backgroundColor: 'var(--surface-0)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  cursor: onSelectFilter ? 'pointer' : 'default',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
                onClick={() => onSelectFilter?.({ assessment: 'IELTS Practice' })}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)' }}
                  >
                    3. Practice Inventory
                  </span>
                  <Badge variant="secondary">{tree.ieltsPractice.total} items</Badge>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    fontSize: '0.785rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• Practice Reading Passages:</span>
                    <strong>{tree.ieltsPractice.reading} Qs</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• Diagnostic Reading Pool:</span>
                    <strong>{tree.ieltsPractice.diagnosticReading} Qs</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• Other / Test Records:</span>
                    <strong>{tree.otherUnclassified.total} items</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuestionInventorySummary;
