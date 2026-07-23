'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Page,
  Container,
  Grid,
  Card,
  Button,
  Stack,
  Inline,
  Skeleton,
  Badge,
} from '@clasptek/design-system';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueueMetrics {
  queued: number;
  running: number;
  completed: number;
  failed: number;
  total: number;
}

interface AccuracyMetrics {
  agreementRate: number | null;
  calibrationAccuracy: number | null;
  overrideRate: number | null;
}

interface CostMetrics {
  totalUsdAllTime: number;
  avgCostPerEvaluation: number | null;
  currency: string;
}

interface LatencyMetrics {
  avgMs: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
}

interface RegressionSummary {
  total: number;
  critical: number;
  warning: number;
}

interface AIDashboardData {
  queue: QueueMetrics;
  accuracy: AccuracyMetrics;
  cost: CostMetrics;
  latency: LatencyMetrics;
  regressions: RegressionSummary;
  recentRuns: any[];
  generatedAt: string;
}

// ─── Helper formatters ────────────────────────────────────────────────────────

function fmt(val: number | null | undefined, digits = 1, suffix = ''): string {
  if (val === null || val === undefined) return '—';
  return `${val.toFixed(digits)}${suffix}`;
}

function fmtUsd(val: number | null | undefined): string {
  if (val === null || val === undefined) return '—';
  return `$${val.toFixed(4)}`;
}

function fmtPct(val: number | null | undefined): string {
  if (val === null || val === undefined) return '—';
  return `${(val * 100).toFixed(1)}%`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  color = 'text-indigo-400',
  sub,
}: {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}) {
  return (
    <Card variant="bordered" id={`kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className={`text-3xl font-extrabold mt-1 ${color}`}>{value}</div>
      {sub && <span className="text-xs text-slate-500 mt-1 block">{sub}</span>}
    </Card>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-slate-100 mb-4 border-b border-slate-700 pb-2">
      {children}
    </h2>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AIDashboardPage() {
  const [data, setData] = useState<AIDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/ai-dashboard');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setLastRefreshed(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh every 60 seconds
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <Page>
      <Container>
        <Stack gap="lg">
          {/* ── Header ─────────────────────────────────────────────── */}
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">AI Evaluation Dashboard</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time monitoring of AI writing & speaking evaluations
                {lastRefreshed && (
                  <span className="ml-2 text-slate-500">
                    · Last refreshed {lastRefreshed.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <Inline gap="sm">
              <Button
                id="btn-refresh-ai-dashboard"
                size="sm"
                variant="outline"
                onClick={load}
                disabled={loading}
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </Button>
              <Button
                id="btn-goto-moderation"
                size="sm"
                variant="primary"
                onClick={() => (window.location.href = '/admin/moderation')}
              >
                Moderator Portal →
              </Button>
            </Inline>
          </Inline>

          {/* ── Error banner ───────────────────────────────────────── */}
          {error && (
            <div className="rounded-lg bg-red-900/40 border border-red-700 px-4 py-3 text-sm text-red-300">
              ⚠ {error}
            </div>
          )}

          {/* ── Queue Status ───────────────────────────────────────── */}
          <section aria-labelledby="section-queue">
            <SectionHeading>Queue Status</SectionHeading>
            {loading && !data ? (
              <Grid cols={4} gap="md">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height="80px" />
                ))}
              </Grid>
            ) : (
              <Grid cols={4} gap="md">
                <KpiCard label="Queued" value={data?.queue.queued ?? 0} color="text-amber-400" />
                <KpiCard label="Running" value={data?.queue.running ?? 0} color="text-blue-400" />
                <KpiCard
                  label="Completed"
                  value={data?.queue.completed ?? 0}
                  color="text-emerald-400"
                />
                <KpiCard label="Failed" value={data?.queue.failed ?? 0} color="text-red-400" />
                <KpiCard label="Total Jobs" value={data?.queue.total ?? 0} color="text-slate-300" />
              </Grid>
            )}
          </section>

          {/* ── Accuracy Metrics ───────────────────────────────────── */}
          <section aria-labelledby="section-accuracy">
            <SectionHeading>Model Accuracy</SectionHeading>
            {loading && !data ? (
              <Grid cols={3} gap="md">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height="80px" />
                ))}
              </Grid>
            ) : (
              <Grid cols={3} gap="md">
                <KpiCard
                  label="Agreement Rate"
                  value={fmtPct(data?.accuracy.agreementRate)}
                  color="text-indigo-400"
                  sub="AI vs human alignment"
                />
                <KpiCard
                  label="Calibration Accuracy"
                  value={fmtPct(data?.accuracy.calibrationAccuracy)}
                  color="text-violet-400"
                  sub="Band score precision"
                />
                <KpiCard
                  label="Override Rate"
                  value={fmtPct(data?.accuracy.overrideRate)}
                  color="text-orange-400"
                  sub="Examiner corrections"
                />
              </Grid>
            )}
          </section>

          {/* ── Cost & Latency ─────────────────────────────────────── */}
          <Grid cols={2} gap="md">
            <section aria-labelledby="section-cost">
              <Card variant="bordered">
                <SectionHeading>Cost Analytics</SectionHeading>
                {loading && !data ? (
                  <Stack gap="sm">
                    <Skeleton height="24px" />
                    <Skeleton height="24px" />
                  </Stack>
                ) : (
                  <Stack gap="sm">
                    <Inline className="justify-between">
                      <span className="text-sm text-slate-400">Total (all time)</span>
                      <span className="text-lg font-bold text-emerald-400">
                        {data?.cost.totalUsdAllTime !== undefined
                          ? `$${data.cost.totalUsdAllTime.toFixed(2)}`
                          : '—'}
                      </span>
                    </Inline>
                    <Inline className="justify-between">
                      <span className="text-sm text-slate-400">Avg per evaluation</span>
                      <span className="text-lg font-bold text-emerald-300">
                        {fmtUsd(data?.cost.avgCostPerEvaluation)}
                      </span>
                    </Inline>
                    <Inline className="justify-between">
                      <span className="text-sm text-slate-400">Currency</span>
                      <Badge variant="neutral">{data?.cost.currency ?? 'USD'}</Badge>
                    </Inline>
                  </Stack>
                )}
              </Card>
            </section>

            <section aria-labelledby="section-latency">
              <Card variant="bordered">
                <SectionHeading>Latency</SectionHeading>
                {loading && !data ? (
                  <Stack gap="sm">
                    <Skeleton height="24px" />
                    <Skeleton height="24px" />
                    <Skeleton height="24px" />
                  </Stack>
                ) : (
                  <Stack gap="sm">
                    <Inline className="justify-between">
                      <span className="text-sm text-slate-400">Average</span>
                      <span className="text-lg font-bold text-blue-400">
                        {fmt(data?.latency.avgMs, 0, 'ms')}
                      </span>
                    </Inline>
                    <Inline className="justify-between">
                      <span className="text-sm text-slate-400">P95</span>
                      <span className="text-lg font-bold text-blue-300">
                        {fmt(data?.latency.p95Ms, 0, 'ms')}
                      </span>
                    </Inline>
                    <Inline className="justify-between">
                      <span className="text-sm text-slate-400">P99</span>
                      <span className="text-lg font-bold text-blue-200">
                        {fmt(data?.latency.p99Ms, 0, 'ms')}
                      </span>
                    </Inline>
                  </Stack>
                )}
              </Card>
            </section>
          </Grid>

          {/* ── Regression Health ──────────────────────────────────── */}
          <section aria-labelledby="section-regressions">
            <Card variant="bordered">
              <SectionHeading>Regression Health</SectionHeading>
              {loading && !data ? (
                <Grid cols={3} gap="md">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} height="60px" />
                  ))}
                </Grid>
              ) : (
                <Grid cols={3} gap="md">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-slate-300">
                      {data?.regressions.total ?? 0}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Total Regressions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-red-400">
                      {data?.regressions.critical ?? 0}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Critical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-amber-400">
                      {data?.regressions.warning ?? 0}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Warning</div>
                  </div>
                </Grid>
              )}
            </Card>
          </section>

          {/* ── Recent Benchmark Runs ──────────────────────────────── */}
          <section aria-labelledby="section-recent-runs">
            <Card variant="bordered">
              <SectionHeading>Recent Benchmark Runs</SectionHeading>
              {loading && !data ? (
                <Stack gap="sm">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} height="40px" />
                  ))}
                </Stack>
              ) : data?.recentRuns && data.recentRuns.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-700 text-xs text-slate-400 uppercase">
                      <th className="pb-2 pr-4">Run ID</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Trigger</th>
                      <th className="pb-2 pr-4">Agreement</th>
                      <th className="pb-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentRuns.map((run: any) => (
                      <tr key={run.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                        <td className="py-2 pr-4 font-mono text-xs text-slate-300">
                          {run.id?.slice(-8) ?? '—'}
                        </td>
                        <td className="py-2 pr-4">
                          <Badge
                            variant={
                              run.status === 'COMPLETED'
                                ? 'success'
                                : run.status === 'FAILED'
                                  ? 'danger'
                                  : run.status === 'RUNNING'
                                    ? 'info'
                                    : 'neutral'
                            }
                          >
                            {run.status ?? '—'}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4 text-slate-400 text-xs">
                          {run.triggerType ?? '—'}
                        </td>
                        <td className="py-2 pr-4 text-slate-300">
                          {run.agreementRate?.rate != null
                            ? `${(run.agreementRate.rate * 100).toFixed(1)}%`
                            : '—'}
                        </td>
                        <td className="py-2 text-slate-500 text-xs">
                          {run.createdAt ? new Date(run.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">
                  No benchmark runs yet. Run a benchmark from the prompt lab.
                </p>
              )}
            </Card>
          </section>

          {/* ── Quick Links ────────────────────────────────────────── */}
          <Card variant="bordered">
            <SectionHeading>Quick Navigation</SectionHeading>
            <Grid cols={4} gap="sm">
              <Button
                id="btn-nav-moderation"
                variant="secondary"
                size="sm"
                onClick={() => (window.location.href = '/admin/moderation')}
              >
                Moderator Portal
              </Button>
              <Button
                id="btn-nav-prompts"
                variant="secondary"
                size="sm"
                onClick={() => (window.location.href = '/admin/ai/prompt')}
              >
                Prompt Lab
              </Button>
              <Button
                id="btn-nav-benchmark"
                variant="secondary"
                size="sm"
                onClick={() => (window.location.href = '/admin/ai/benchmark')}
              >
                Benchmarks
              </Button>
              <Button
                id="btn-nav-deployment"
                variant="secondary"
                size="sm"
                onClick={() => (window.location.href = '/admin/ai/deployment')}
              >
                Deployment Decisions
              </Button>
            </Grid>
          </Card>
        </Stack>
      </Container>
    </Page>
  );
}
