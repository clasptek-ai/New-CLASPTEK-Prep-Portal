'use client';

import React, { useState } from 'react';
import { Card } from '../../../../shared/ui/card/Card';
import { TrendingUp, Users, PieChart, Layers } from 'lucide-react';

export interface ExecutiveAnalyticsProps {
  charts: {
    registrationTrend: Array<{ month: string; count: number }>;
    practiceActivityTrend: Array<{ day: string; count: number }>;
    readinessDistribution: { high: number; medium: number; low: number };
    programmeDistribution: Array<{ name: string; count: number }>;
    questionDistribution: {
      byExam: Array<{ name: string; count: number }>;
      bySkill: Array<{ name: string; count: number }>;
      byDifficulty: Array<{ name: string; count: number }>;
    };
  };
}

export const ExecutiveAnalytics: React.FC<ExecutiveAnalyticsProps> = ({ charts }) => {
  const [questionTab, setQuestionTab] = useState<'byExam' | 'bySkill' | 'byDifficulty'>('byExam');

  const regTrend =
    charts.registrationTrend && charts.registrationTrend.length > 0
      ? charts.registrationTrend
      : [
          { month: 'Jan', count: 0 },
          { month: 'Feb', count: 0 },
          { month: 'Mar', count: 0 },
          { month: 'Apr', count: 0 },
          { month: 'May', count: 0 },
          { month: 'Jun', count: 0 },
        ];

  const practiceTrend =
    charts.practiceActivityTrend && charts.practiceActivityTrend.length > 0
      ? charts.practiceActivityTrend
      : [
          { day: 'Mon', count: 0 },
          { day: 'Tue', count: 0 },
          { day: 'Wed', count: 0 },
          { day: 'Thu', count: 0 },
          { day: 'Fri', count: 0 },
          { day: 'Sat', count: 0 },
          { day: 'Sun', count: 0 },
        ];

  const maxReg = Math.max(...regTrend.map((r) => r.count), 1);
  const maxPractice = Math.max(...practiceTrend.map((p) => p.count), 1);

  const { high, medium, low } = charts.readinessDistribution || { high: 0, medium: 0, low: 0 };
  const totalReadinessCandidates = high + medium + low;
  const highPct =
    totalReadinessCandidates > 0 ? Math.round((high / totalReadinessCandidates) * 100) : 0;
  const medPct =
    totalReadinessCandidates > 0 ? Math.round((medium / totalReadinessCandidates) * 100) : 0;
  const lowPct =
    totalReadinessCandidates > 0 ? Math.round((low / totalReadinessCandidates) * 100) : 0;

  const progDist =
    charts.programmeDistribution && charts.programmeDistribution.length > 0
      ? charts.programmeDistribution
      : [
          { name: 'IELTS Academic', count: 0 },
          { name: 'TOEFL iBT', count: 0 },
          { name: 'SAT Prep', count: 0 },
          { name: 'CELPIP', count: 0 },
          { name: 'English Proficiency', count: 0 },
        ];
  const maxProg = Math.max(...progDist.map((p) => p.count), 1);

  const currentQuestions = charts.questionDistribution?.[questionTab] || [];
  const maxQuest = Math.max(...currentQuestions.map((q) => q.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 800,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Executive Analytics & Cohort Distribution
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.25rem',
          width: '100%',
        }}
      >
        {/* Candidate Registration Trend Chart */}
        <Card
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            backgroundColor: '#151d30',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                Candidate Registration Trend
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Monthly student sign-ups (Past 6 Months)
              </div>
            </div>
            <div
              style={{
                padding: '0.4rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
              }}
            >
              <TrendingUp size={18} color="#38bdf8" />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '0.75rem',
              height: '140px',
              paddingTop: '1rem',
            }}
          >
            {regTrend.map((item, idx) => {
              const heightPct = Math.max(12, Math.round((item.count / maxReg) * 100));
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    height: '100%',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: item.count > 0 ? '#38bdf8' : '#64748b',
                    }}
                  >
                    {item.count}
                  </span>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPct}%`,
                        borderRadius: '6px 6px 2px 2px',
                        backgroundImage: 'linear-gradient(180deg, #38bdf8, #1e40af)',
                        transition: 'height 0.3s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Practice Activity Trend Chart */}
        <Card
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            backgroundColor: '#151d30',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                Daily Practice Activity
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Candidate sessions executed (Past 7 Days)
              </div>
            </div>
            <div
              style={{
                padding: '0.4rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(52, 211, 153, 0.12)',
              }}
            >
              <Layers size={18} color="#34d399" />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '0.6rem',
              height: '140px',
              paddingTop: '1rem',
            }}
          >
            {practiceTrend.map((item, idx) => {
              const heightPct = Math.max(12, Math.round((item.count / maxPractice) * 100));
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    height: '100%',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: item.count > 0 ? '#34d399' : '#64748b',
                    }}
                  >
                    {item.count}
                  </span>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPct}%`,
                        borderRadius: '6px 6px 2px 2px',
                        backgroundImage: 'linear-gradient(180deg, #34d399, #065f46)',
                        transition: 'height 0.3s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
          width: '100%',
        }}
      >
        {/* Readiness Distribution Donut Visual */}
        <Card
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            backgroundColor: '#151d30',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                Readiness Distribution
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Candidate readiness score breakdown
              </div>
            </div>
            <div
              style={{
                padding: '0.4rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(168, 85, 247, 0.12)',
              }}
            >
              <PieChart size={18} color="#a855f7" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                  marginBottom: '0.25rem',
                }}
              >
                <span>High Readiness (≥70%)</span>
                <strong style={{ color: '#34d399' }}>
                  {high} ({highPct}%)
                </strong>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#0f172a',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${highPct}%`,
                    height: '100%',
                    backgroundColor: '#34d399',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                  marginBottom: '0.25rem',
                }}
              >
                <span>Medium Readiness (50-69%)</span>
                <strong style={{ color: '#fbbf24' }}>
                  {medium} ({medPct}%)
                </strong>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#0f172a',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${medPct}%`,
                    height: '100%',
                    backgroundColor: '#fbbf24',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                  marginBottom: '0.25rem',
                }}
              >
                <span>At Risk / Low (&lt;50%)</span>
                <strong style={{ color: '#f87171' }}>
                  {low} ({lowPct}%)
                </strong>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#0f172a',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${lowPct}%`,
                    height: '100%',
                    backgroundColor: '#f87171',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Programme Distribution */}
        <Card
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            backgroundColor: '#151d30',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                Programme Enrollment
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Candidates grouped by academic target
              </div>
            </div>
            <div
              style={{
                padding: '0.4rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
              }}
            >
              <Users size={18} color="#38bdf8" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {progDist.map((item, idx) => {
              const widthPct = Math.max(8, Math.round((item.count / maxProg) * 100));
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      color: '#cbd5e1',
                    }}
                  >
                    <span>{item.name}</span>
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>{item.count}</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: '#0f172a',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${widthPct}%`,
                        height: '100%',
                        backgroundColor: '#38bdf8',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Question Bank Asset Distribution */}
        <Card
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            backgroundColor: '#151d30',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                Question Inventory
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Asset breakdown by category
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={() => setQuestionTab('byExam')}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: questionTab === 'byExam' ? '#2563eb' : '#0f172a',
                  color: questionTab === 'byExam' ? '#ffffff' : '#94a3b8',
                }}
              >
                Exam
              </button>
              <button
                onClick={() => setQuestionTab('bySkill')}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: questionTab === 'bySkill' ? '#2563eb' : '#0f172a',
                  color: questionTab === 'bySkill' ? '#ffffff' : '#94a3b8',
                }}
              >
                Skill
              </button>
              <button
                onClick={() => setQuestionTab('byDifficulty')}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: questionTab === 'byDifficulty' ? '#2563eb' : '#0f172a',
                  color: questionTab === 'byDifficulty' ? '#ffffff' : '#94a3b8',
                }}
              >
                Difficulty
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {currentQuestions.length === 0 ? (
              <div
                style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '0.8rem',
                }}
              >
                No question inventory items found for this filter.
              </div>
            ) : (
              currentQuestions.map((item, idx) => {
                const widthPct = Math.max(8, Math.round((item.count / maxQuest) * 100));
                return (
                  <div
                    key={idx}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        color: '#cbd5e1',
                      }}
                    >
                      <span>{item.name}</span>
                      <span style={{ fontWeight: 700, color: '#f8fafc' }}>{item.count}</span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        backgroundColor: '#0f172a',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${widthPct}%`,
                          height: '100%',
                          backgroundColor: '#c084fc',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
