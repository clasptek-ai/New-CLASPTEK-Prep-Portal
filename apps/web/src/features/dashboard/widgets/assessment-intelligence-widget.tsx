'use client';

import React from 'react';
import Link from 'next/link';
import { Target, TrendingUp, Award, ArrowRight, AlertCircle } from 'lucide-react';
import { CandidateIntelligenceProfile } from '../../intelligence/assessment-intelligence';
import { WidgetState } from '../../../shared/ui/academic/dashboard-widget';

export interface AssessmentIntelligenceWidgetProps {
  intelligence: CandidateIntelligenceProfile;
  state?: WidgetState;
}

export const AssessmentIntelligenceWidget: React.FC<AssessmentIntelligenceWidgetProps> = ({
  intelligence,
  state = 'SUCCESS',
}) => {
  const {
    examType,
    hasDiagnostic,
    strongestSkill,
    priorityDevelopmentArea,
    priorityEvidence,
    comparison,
    chronologicalProgression,
  } = intelligence;

  if (state === 'LOADING') {
    return (
      <div
        style={{
          borderRadius: '1rem',
          backgroundColor: 'var(--surface-0)',
          border: '1px solid var(--border)',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            height: '1.25rem',
            backgroundColor: 'var(--surface-1)',
            borderRadius: '4px',
            width: '33%',
            marginBottom: '1rem',
          }}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          <div
            style={{ height: '6rem', backgroundColor: 'var(--surface-1)', borderRadius: '12px' }}
          />
          <div
            style={{ height: '6rem', backgroundColor: 'var(--surface-1)', borderRadius: '12px' }}
          />
        </div>
      </div>
    );
  }

  // If candidate has not completed a diagnostic, show encouraging calibration notice
  if (!hasDiagnostic) {
    return (
      <div
        style={{
          borderRadius: '1rem',
          backgroundColor: 'var(--surface-0)',
          border: '1px solid var(--border)',
          padding: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
          className="sm:flex-row sm:items-center"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--brand-primary)',
              }}
            >
              Assessment Calibration
            </span>
            <h2
              style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}
            >
              No Diagnostic Baseline Established
            </h2>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: '42rem',
                margin: 0,
              }}
            >
              Complete your Diagnostic Pre-Assessment to establish your baseline for {examType}.
              Skill gap analytics and progression tracking activate automatically after calibration.
            </p>
          </div>
          <Link
            href="/student/assessments"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--brand-primary)',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 700,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              alignSelf: 'flex-start',
            }}
            className="sm:self-auto"
          >
            Take Pre-Assessment <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: '1rem',
        backgroundColor: 'var(--surface-0)',
        border: '1px solid var(--border)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* ── Widget Header ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1rem',
        }}
        className="sm:flex-row sm:items-center"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--brand-primary)',
              }}
            >
              Performance Intelligence
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {examType}
            </span>
          </div>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0.125rem 0 0',
            }}
          >
            Preparation Guidance &amp; Progression
          </h2>
        </div>

        <Link
          href="/student/results"
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--brand-primary)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
          className="hover:underline self-start sm:self-auto"
        >
          View Full Performance Ledger <ArrowRight size={13} />
        </Link>
      </div>

      {/* ── Skill Insights Grid (Strongest vs. Priority Development Area) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Card 1: Priority Development Area */}
        <div
          style={{
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--warning)',
                }}
              >
                Priority Development Area
              </span>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                {priorityDevelopmentArea
                  ? priorityDevelopmentArea.skillName
                  : 'Balanced Performance'}
              </h3>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {priorityEvidence}
              </p>
            </div>
            <div
              style={{
                padding: '0.625rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: 'var(--warning)',
                flexShrink: 0,
              }}
            >
              <Target size={18} />
            </div>
          </div>

          {priorityDevelopmentArea && (
            <div
              style={{
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Measured:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {priorityDevelopmentArea.scorePercentage}%
                </strong>
              </span>
              <Link
                href={`/practice?skill=${encodeURIComponent(priorityDevelopmentArea.skillName)}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--brand-primary)',
                  textDecoration: 'none',
                }}
                className="hover:underline"
              >
                Practice {priorityDevelopmentArea.skillName} →
              </Link>
            </div>
          )}
        </div>

        {/* Card 2: Highest Measured Competency */}
        <div
          style={{
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--success)',
                }}
              >
                Current Measured Strength
              </span>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                {strongestSkill ? strongestSkill.skillName : 'All Skills Balanced'}
              </h3>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {strongestSkill
                  ? `${strongestSkill.skillName} is currently your highest measured comparable skill.`
                  : 'Your measured assessment skills show even performance across active sections.'}
              </p>
            </div>
            <div
              style={{
                padding: '0.625rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--success)',
                flexShrink: 0,
              }}
            >
              <Award size={18} />
            </div>
          </div>

          {strongestSkill && (
            <div
              style={{
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Measured:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {strongestSkill.scorePercentage}%
                </strong>
              </span>
              <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700 }}>
                Strongest Section
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Baseline vs Mock Comparison ── */}
      {comparison ? (
        <div
          style={{
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} style={{ color: 'var(--brand-primary)' }} />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--brand-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Baseline vs. Mock Progression
              </span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {comparison.mockDate}
            </span>
          </div>

          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {comparison.summaryStatement}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
              paddingTop: '0.25rem',
            }}
          >
            <div
              style={{
                padding: '0.625rem',
                backgroundColor: 'var(--surface-0)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  display: 'block',
                }}
              >
                Diagnostic Baseline
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {comparison.baselineBand || `${comparison.baselineOverallScore}%`}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginTop: '2px',
                }}
              >
                {comparison.baselineDate}
              </span>
            </div>

            <div
              style={{
                padding: '0.625rem',
                backgroundColor: 'var(--surface-0)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  display: 'block',
                }}
              >
                Latest Mock
              </span>
              <span
                style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-primary)' }}
              >
                {comparison.mockBand || `${comparison.mockOverallScore}%`}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginTop: '2px',
                }}
              >
                {comparison.mockDate}
              </span>
            </div>

            <div
              style={{
                padding: '0.625rem',
                backgroundColor: 'var(--surface-0)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  display: 'block',
                }}
              >
                Net Delta
              </span>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color:
                    (comparison.bandDelta ?? comparison.scoreDelta) >= 0
                      ? 'var(--success)'
                      : 'var(--warning)',
                }}
              >
                {(comparison.bandDelta ?? comparison.scoreDelta) > 0 ? '+' : ''}
                {comparison.bandDelta !== undefined
                  ? `${comparison.bandDelta} Bands`
                  : `${comparison.scoreDelta}%`}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginTop: '2px',
                }}
              >
                Authoritative measurement
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <AlertCircle
            size={18}
            style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <h4
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Progression Tracking Available
            </h4>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Complete a comparable Mock Examination to track your score delta against your
              diagnostic baseline.
            </p>
            <div style={{ paddingTop: '0.25rem' }}>
              <Link
                href="/student/mock"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--brand-primary)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                className="hover:underline"
              >
                Launch Mock Examination →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Chronological Progression Ledger ── */}
      {chronologicalProgression.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
            }}
          >
            Chronological Assessment Ledger ({chronologicalProgression.length} completed)
          </span>

          <div
            style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}
          >
            <table
              style={{
                width: '100%',
                textAlign: 'left',
                borderCollapse: 'collapse',
                fontSize: '0.75rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--surface-1)',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <th
                    style={{
                      padding: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '10px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Assessment
                  </th>
                  <th
                    style={{
                      padding: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '10px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Category
                  </th>
                  <th
                    style={{
                      padding: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '10px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '10px',
                      letterSpacing: '0.05em',
                      textAlign: 'right',
                    }}
                  >
                    Result
                  </th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text-primary)' }}>
                {chronologicalProgression.map((item, idx) => (
                  <tr
                    key={item.resultId || idx}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      transition: 'background-color 0.15s ease',
                    }}
                    className="hover:bg-(--surface-1)"
                  >
                    <td
                      style={{
                        padding: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--brand-primary)',
                        }}
                      />
                      {item.assessmentType}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        color: 'var(--text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      {item.category}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.formattedDate}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700 }}>
                      {item.predictedBand ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(4, 94, 173, 0.1)',
                            color: 'var(--brand-primary)',
                            fontWeight: 700,
                          }}
                        >
                          {item.predictedBand}
                        </span>
                      ) : (
                        `${item.overallScore}%`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentIntelligenceWidget;
