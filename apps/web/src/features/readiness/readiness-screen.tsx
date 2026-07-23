'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../../components/ui/ui-components';
import { LineChart } from '../../components/charts/svg-charts';
import {
  studentReadinessService,
  StudentReadinessInfo,
} from '../../services/student/readiness.service';

export function ReadinessScreen() {
  const [readiness, setReadiness] = useState<StudentReadinessInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Addendum states
  const [timelineTrend, setTimelineTrend] = useState<{
    trendDirection: string;
    slope: number;
    velocity: number;
  } | null>(null);
  const [stabilityData, setStabilityData] = useState<{
    score: number;
    state: string;
    variance: number;
    trend: string;
  } | null>(null);
  const [contributions, setContributions] = useState<Array<{
    skillName: string;
    percentage: number;
  }> | null>(null);
  const [explanationText, setExplanationText] = useState<string>('');
  const [priorityAdvice, setPriorityAdvice] = useState<string>('');
  const [confidenceReport, setConfidenceReport] = useState<{
    score: number;
    level: string;
    quality: number;
    coverage: number;
    recs: string[];
  } | null>(null);
  const [scenarioInput, setScenarioInput] = useState<{ code: string; hours: number }>({
    code: 'WRITING_IMPROVEMENT',
    hours: 5,
  });
  const [scenarioResult, setScenarioResult] = useState<{
    projected: number;
    band: number;
    targetDate: string;
    prob: number;
  } | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<{
    avgReadiness: number;
    totalStudents: number;
    cohorts: Array<{ code: string; avg: number; rank: string }>;
  } | null>(null);

  useEffect(() => {
    async function loadAllData() {
      try {
        const data = await studentReadinessService.getReadiness();
        setReadiness(data);

        // Fetch Timeline Trend
        const tlRes = await fetch('/api/v1/readiness/timeline');
        if (tlRes.ok) {
          const tlData = await tlRes.json();
          if (tlData.trend) {
            setTimelineTrend({
              trendDirection: tlData.trend.trendDirection?.value ?? 'PLATEAU',
              slope: tlData.trend.slope ?? 0,
              velocity: tlData.trend.learningVelocity?.rate ?? 0,
            });
          }
        }

        // Fetch Stability
        const stabRes = await fetch('/api/v1/readiness/stability');
        if (stabRes.ok) {
          const sData = await stabRes.json();
          if (sData.stability) {
            setStabilityData({
              score: sData.stability.stabilityScore?.score ?? 85,
              state: sData.stability.volatilityState ?? 'STABLE',
              variance: sData.stability.variance?.value ?? 0,
              trend: sData.stability.confidenceTrend ?? 'STABLE',
            });
          }
        }

        // Fetch Skill Contributions
        const contribRes = await fetch('/api/v1/readiness/contribution');
        if (contribRes.ok) {
          const cData = await contribRes.json();
          if (cData?.contributions) {
            setContributions(
              cData.contributions.map((c: any) => ({
                skillName: c.skillName,
                percentage: c.contribution?.percentage ?? 15,
              }))
            );
            setExplanationText(cData.explanation?.explanationText ?? '');
            setPriorityAdvice(cData.explanation?.advice ?? '');
          }
        }

        // Fetch Confidence Assessment Report
        const confRes = await fetch('/api/v1/readiness/confidence');
        if (confRes.ok) {
          const confData = await confRes.json();
          if (confData.report) {
            setConfidenceReport({
              score: confData.report.confidence?.confidence ?? 88,
              level: confData.report.level ?? 'RELIABLE',
              quality: confData.report.evidenceQuality ?? 90,
              coverage: confData.report.coverageScore ?? 80,
              recs: confData.report.recommendations ?? [],
            });
          }
        }

        // Fetch Benchmarks
        const benchRes = await fetch('/api/v1/readiness/benchmark');
        if (benchRes.ok) {
          const bData = await benchRes.json();
          if (bData.benchmark) {
            setBenchmarkData({
              avgReadiness: bData.benchmark.avgReadinessScore ?? 82,
              totalStudents: bData.benchmark.totalStudents ?? 45,
              cohorts:
                bData.benchmark.cohortsRankings?.map((c: any) => ({
                  code: c.cohortCode,
                  avg: c.avgReadiness,
                  rank: c.expectedRank,
                })) ?? [],
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  const handleSimulateScenario = async () => {
    try {
      const res = await fetch('/api/v1/readiness/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioName: 'Interactive Forecast Plan',
          scenarioCode: scenarioInput.code,
          currentReadiness: readiness?.overallReadiness ?? 75,
          hoursSimulated: scenarioInput.hours,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.projections && data.projections.length > 0) {
          const latest = data.projections[data.projections.length - 1];
          setScenarioResult({
            projected: latest.projectedReadiness,
            band: latest.predictedOfficialScore,
            targetDate: new Date(latest.estimatedAchievementDate).toLocaleDateString(),
            prob: Math.round(latest.goalProbability * 100),
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !readiness) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading dynamic readiness score predictions...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
          Student Readiness Tracker (Sprint 2.9 Enhancements)
        </h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Monitor AI-driven exam success probability metrics, timeline acceleration, prediction
          stability, and peer benchmarking.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main metric card */}
          <Card
            title="Current Readiness Score Indicator"
            actions={
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Badge variant={readiness.riskLevel === 'LOW' ? 'success' : 'danger'}>
                  {readiness.riskLevel} RISK
                </Badge>
                {stabilityData && (
                  <Badge variant={stabilityData.state === 'STABLE' ? 'success' : 'warning'}>
                    STABILITY: {stabilityData.state}
                  </Badge>
                )}
              </div>
            }
          >
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '1rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#2563eb' }}>
                {readiness.overallReadiness}%
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                  Target Success Score: <strong>{readiness.targetScore}%</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Confidence Interval: {readiness.confidenceRange.min}% -{' '}
                  {readiness.confidenceRange.max}%
                </div>
                {stabilityData && (
                  <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '0.25rem' }}>
                    Stability Index: {stabilityData.score}/100 (Variance:{' '}
                    {stabilityData.variance.toFixed(2)})
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Readiness Timeline & Trend Classifier */}
          <Card
            title="Readiness Timeline & Acceleration"
            actions={
              timelineTrend && (
                <Badge
                  variant={
                    timelineTrend.trendDirection === 'ACCELERATING' ||
                    timelineTrend.trendDirection === 'IMPROVING'
                      ? 'success'
                      : 'neutral'
                  }
                >
                  TREND: {timelineTrend.trendDirection}
                </Badge>
              )
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LineChart
                  data={readiness.readinessTrend}
                  labels={['M1', 'M2', 'M3', 'M4', 'M5', 'M6']}
                />
              </div>
              {timelineTrend && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    borderTop: '1px solid #1e293b',
                    paddingTop: '0.75rem',
                  }}
                >
                  <div>
                    Velocity Slope:{' '}
                    <strong style={{ color: '#f8fafc' }}>{timelineTrend.slope.toFixed(2)}</strong>
                  </div>
                  <div>
                    Learning Velocity:{' '}
                    <strong style={{ color: '#f8fafc' }}>
                      {timelineTrend.velocity.toFixed(2)} %/wk
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Skill Contribution Breakdown */}
          <Card title="Skill Contribution Breakdown (Sum 100%)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {contributions &&
                contributions.map((item, idx) => (
                  <div
                    key={idx}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        color: '#cbd5e1',
                      }}
                    >
                      <span>{item.skillName}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#1e293b',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${item.percentage * 3}%`,
                          height: '100%',
                          backgroundColor: idx % 2 === 0 ? '#3b82f6' : '#10b981',
                        }}
                      />
                    </div>
                  </div>
                ))}
              {explanationText && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: '#0f172a',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                  }}
                >
                  <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '0.25rem' }}>
                    AI Explainability Note:
                  </strong>
                  {explanationText}
                  {priorityAdvice && (
                    <p style={{ margin: '0.5rem 0 0 0', color: '#fbbf24', fontWeight: 600 }}>
                      {priorityAdvice}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Interactive Scenario Planner */}
          <Card title="Target Achievement Scenario Planner ('What-if' Simulation)">
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.25rem' }}>
                    Simulation Scenario
                  </label>
                  <select
                    value={scenarioInput.code}
                    onChange={(e) => setScenarioInput({ ...scenarioInput, code: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="WRITING_IMPROVEMENT">Improve Writing Band (+0.5)</option>
                    <option value="MOCK_EXAMS">Complete Additional Mock Exams (+2 Mocks)</option>
                    <option value="STUDY_CONSISTENCY">Increase Study Consistency (+15%)</option>
                    <option value="READING_ACCURACY">Improve Reading Accuracy (+10%)</option>
                    <option value="STUDY_TIME">Increase Weekly Study Hours</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.25rem' }}>
                    Study Hours Simulated
                  </label>
                  <input
                    type="number"
                    value={scenarioInput.hours}
                    onChange={(e) =>
                      setScenarioInput({ ...scenarioInput, hours: parseInt(e.target.value) || 0 })
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>
              <button
                onClick={handleSimulateScenario}
                style={{
                  padding: '0.6rem 1rem',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Run Scenario Projection
              </button>

              {scenarioResult && (
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#0284c715',
                    borderLeft: '3px solid #0284c7',
                    borderRadius: '4px',
                    marginTop: '0.5rem',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#38bdf8' }}>Forecast Results:</div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      color: '#e2e8f0',
                    }}
                  >
                    <div>
                      Projected Readiness: <strong>{scenarioResult.projected}%</strong>
                    </div>
                    <div>
                      Predicted Official Score: <strong>Band {scenarioResult.band}</strong>
                    </div>
                    <div>
                      Estimated Target Date: <strong>{scenarioResult.targetDate}</strong>
                    </div>
                    <div>
                      Goal Probability: <strong>{scenarioResult.prob}%</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Confidence Assessment Indicator */}
          {confidenceReport && (
            <Card title="Prediction Confidence Report">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.85rem',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>Reliability Level:</span>
                  <Badge
                    variant={
                      confidenceReport.level === 'HIGHLY_RELIABLE' ||
                      confidenceReport.level === 'RELIABLE'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {confidenceReport.level} ({confidenceReport.score}%)
                  </Badge>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  <div>
                    Evidence Quality:{' '}
                    <strong style={{ color: '#cbd5e1' }}>{confidenceReport.quality}%</strong>
                  </div>
                  <div>
                    Competency Coverage:{' '}
                    <strong style={{ color: '#cbd5e1' }}>{confidenceReport.coverage}%</strong>
                  </div>
                </div>
                {confidenceReport.recs.length > 0 && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      borderTop: '1px solid #1e293b',
                      paddingTop: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Recommended Actions:
                    </span>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: '1.2rem',
                        color: '#fbbf24',
                        fontSize: '0.8rem',
                      }}
                    >
                      {confidenceReport.recs.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Institutional Benchmarking & Peer Ranks */}
          {benchmarkData && (
            <Card title="Institutional Peer Benchmarking">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Institutional Avg Readiness:</span>
                  <strong style={{ color: '#38bdf8' }}>{benchmarkData.avgReadiness}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Anonymized Sample Size:</span>
                  <span>{benchmarkData.totalStudents} students</span>
                </div>
                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.5rem' }}>
                  <span style={{ color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                    Cohort Rankings:
                  </span>
                  {benchmarkData.cohorts.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.25rem 0',
                      }}
                    >
                      <span>
                        Cohort {c.code}: {c.avg}%
                      </span>
                      <Badge variant="neutral">Rank {c.rank}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Recommended study actions */}
          <Card title="Focus Directions">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                fontSize: '0.85rem',
                color: '#cbd5e1',
              }}
            >
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#0b0f19',
                  borderLeft: '3px solid #f59e0b',
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: '#f59e0b',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Suggested Action:
                </span>
                {readiness.priorityStudyPlan}
              </div>
              <div>
                <span>Suggested Next Mock:</span>
                <strong style={{ display: 'block', color: '#f8fafc', marginTop: '0.25rem' }}>
                  {readiness.suggestedMockDate}
                </strong>
              </div>
              <div>
                <span>Daily Practice target:</span>
                <strong style={{ display: 'block', color: '#f8fafc', marginTop: '0.25rem' }}>
                  {readiness.suggestedPracticePlan}
                </strong>
              </div>
            </div>
          </Card>

          {/* Strong / weak competency areas */}
          <Card title="Domains Breakdown">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.8rem',
              }}
            >
              <div>
                <span style={{ display: 'block', color: '#64748b', marginBottom: '0.25rem' }}>
                  Strong Competencies:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {readiness.strongDomains.map((d, i) => (
                    <Badge key={i} variant="success">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
                <span style={{ display: 'block', color: '#64748b', marginBottom: '0.25rem' }}>
                  Weak Focus Areas:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {readiness.weakDomains.map((d, i) => (
                    <Badge key={i} variant="danger">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default ReadinessScreen;
