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
  Modal,
  Input,
  Select,
  Textarea,
} from '@clasptek/design-system';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface EvaluationJob {
  id: string;
  studentId: string;
  submissionId: string;
  questionType: 'WRITING' | 'SPEAKING';
  status: string;
  score?: number;
  overrideScore?: number;
  feedback?: string;
  createdAt?: string;
}

interface OverrideFormState {
  open: boolean;
  jobId: string;
  currentScore: number | null;
  overrideScore: string;
  overrideReason: string;
  overrideFeedback: string;
  submitting: boolean;
  error: string | null;
}

interface ApproveState {
  submitting: boolean;
  error: string | null;
}

// ─── Status badge colors ───────────────────────────────────────────────────────

function statusVariant(status: string): 'success' | 'danger' | 'info' | 'warning' | 'neutral' {
  switch (status) {
    case 'COMPLETED':
    case 'APPROVED':
    case 'PUBLISHED':
      return 'success';
    case 'FAILED':
    case 'REJECTED':
      return 'danger';
    case 'RUNNING':
      return 'info';
    case 'QUEUED':
    case 'PENDING':
      return 'warning';
    default:
      return 'neutral';
  }
}

const INITIAL_OVERRIDE: OverrideFormState = {
  open: false,
  jobId: '',
  currentScore: null,
  overrideScore: '',
  overrideReason: '',
  overrideFeedback: '',
  submitting: false,
  error: null,
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ModerationPage() {
  const [jobs, setJobs] = useState<EvaluationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const [override, setOverride] = useState<OverrideFormState>(INITIAL_OVERRIDE);
  const [approveState, setApproveState] = useState<ApproveState>({
    submitting: false,
    error: null,
  });

  // ── Load evaluations ────────────────────────────────────────────────────────
  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterType) params.set('questionType', filterType);
      params.set('limit', '50');

      const res = await fetch(`/api/v1/ai/evaluations?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setJobs(data.jobs ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // ── Approve ─────────────────────────────────────────────────────────────────
  const handleApprove = useCallback(
    async (jobId: string) => {
      setApproveState({ submitting: true, error: null });
      try {
        const res = await fetch(`/api/v1/ai/evaluations/${jobId}/approve`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewNotes: 'Approved via moderator portal' }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        await loadJobs();
        setApproveState({ submitting: false, error: null });
      } catch (e: unknown) {
        setApproveState({
          submitting: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    },
    [loadJobs]
  );

  // ── Open override modal ──────────────────────────────────────────────────────
  const openOverride = useCallback((job: EvaluationJob) => {
    setOverride({
      open: true,
      jobId: job.id,
      currentScore: job.score ?? null,
      overrideScore: '',
      overrideReason: '',
      overrideFeedback: '',
      submitting: false,
      error: null,
    });
  }, []);

  // ── Submit override ──────────────────────────────────────────────────────────
  const submitOverride = useCallback(async () => {
    const scoreNum = Number(override.overrideScore);
    if (!override.overrideScore || isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      setOverride((p) => ({ ...p, error: 'Override score must be 0–100.' }));
      return;
    }
    if (override.overrideReason.trim().length < 10) {
      setOverride((p) => ({ ...p, error: 'Reason must be at least 10 characters.' }));
      return;
    }

    setOverride((p) => ({ ...p, submitting: true, error: null }));
    try {
      const res = await fetch(`/api/v1/ai/evaluations/${override.jobId}/override`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overrideScore: scoreNum,
          overrideReason: override.overrideReason.trim(),
          overrideFeedback: override.overrideFeedback.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setOverride(INITIAL_OVERRIDE);
      await loadJobs();
    } catch (e: unknown) {
      setOverride((p) => ({
        ...p,
        submitting: false,
        error: e instanceof Error ? e.message : String(e),
      }));
    }
  }, [override, loadJobs]);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Page>
      <Container>
        <Stack gap="lg">
          {/* ── Header ──────────────────────────────────────────────── */}
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Moderator Portal</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Review AI evaluations · Approve · Override scores
              </p>
            </div>
            <Inline gap="sm">
              <Button
                id="btn-back-ai-dashboard"
                size="sm"
                variant="outline"
                onClick={() => (window.location.href = '/admin/ai-dashboard')}
              >
                ← AI Dashboard
              </Button>
              <Button
                id="btn-refresh-moderation"
                size="sm"
                variant="primary"
                onClick={loadJobs}
                disabled={loading}
              >
                {loading ? 'Loading…' : 'Refresh'}
              </Button>
            </Inline>
          </Inline>

          {/* ── Filters ─────────────────────────────────────────────── */}
          <Card variant="bordered">
            <Inline gap="md" align="center">
              <span className="text-sm font-medium text-slate-400">Filter:</span>
              <Select
                id="filter-status"
                value={filterStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFilterStatus(e.target.value)
                }
                label="Status"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="APPROVED">Approved</option>
                <option value="QUEUED">Queued</option>
                <option value="RUNNING">Running</option>
                <option value="FAILED">Failed</option>
              </Select>
              <Select
                id="filter-type"
                value={filterType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFilterType(e.target.value)
                }
                label="Type"
              >
                <option value="">All Types</option>
                <option value="WRITING">Writing</option>
                <option value="SPEAKING">Speaking</option>
              </Select>
              <Button
                id="btn-clear-filters"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilterStatus('');
                  setFilterType('');
                }}
              >
                Clear
              </Button>
            </Inline>
          </Card>

          {/* ── Error ───────────────────────────────────────────────── */}
          {(error || approveState.error) && (
            <div className="rounded-lg bg-red-900/40 border border-red-700 px-4 py-3 text-sm text-red-300">
              ⚠ {error ?? approveState.error}
            </div>
          )}

          {/* ── Evaluation Table ─────────────────────────────────────── */}
          <Card variant="bordered">
            <h2 className="text-base font-semibold text-slate-100 mb-4">
              AI Evaluations{' '}
              {!loading && (
                <span className="text-xs font-normal text-slate-400">({jobs.length} records)</span>
              )}
            </h2>

            {loading ? (
              <Stack gap="sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} height="52px" />
                ))}
              </Stack>
            ) : jobs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No evaluations match the current filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-700 text-xs text-slate-400 uppercase">
                      <th className="pb-3 pr-4">Job ID</th>
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Student</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">AI Score</th>
                      <th className="pb-3 pr-4">Override</th>
                      <th className="pb-3 pr-4">Created</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr
                        key={job.id}
                        className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-slate-300">
                          {job.id.slice(-8)}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={job.questionType === 'WRITING' ? 'info' : 'warning'}>
                            {job.questionType}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-slate-400 text-xs font-mono">
                          {job.studentId?.slice(-8) ?? '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-slate-300 font-semibold">
                          {job.score != null ? job.score.toFixed(1) : '—'}
                        </td>
                        <td className="py-3 pr-4">
                          {job.overrideScore != null ? (
                            <span className="text-amber-400 font-semibold">
                              {job.overrideScore.toFixed(1)}{' '}
                              <span className="text-xs text-slate-500">(override)</span>
                            </span>
                          ) : (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-slate-500 text-xs">
                          {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3">
                          <Inline gap="xs">
                            {job.status === 'COMPLETED' && (
                              <Button
                                id={`btn-approve-${job.id}`}
                                size="sm"
                                variant="primary"
                                onClick={() => handleApprove(job.id)}
                                disabled={approveState.submitting}
                              >
                                Approve
                              </Button>
                            )}
                            {['COMPLETED', 'APPROVED'].includes(job.status) && (
                              <Button
                                id={`btn-override-${job.id}`}
                                size="sm"
                                variant="warning"
                                onClick={() => openOverride(job)}
                              >
                                Override
                              </Button>
                            )}
                          </Inline>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </Stack>
      </Container>

      {/* ── Override Score Modal ──────────────────────────────────────────────── */}
      {override.open && (
        <Modal
          id="modal-override-score"
          isOpen={override.open}
          title="Override AI Score"
          onClose={() => setOverride(INITIAL_OVERRIDE)}
          footer={
            <Inline gap="sm" className="justify-end">
              <Button
                id="btn-cancel-override"
                variant="ghost"
                onClick={() => setOverride(INITIAL_OVERRIDE)}
                disabled={override.submitting}
              >
                Cancel
              </Button>
              <Button
                id="btn-submit-override"
                variant="danger"
                onClick={submitOverride}
                disabled={override.submitting}
              >
                {override.submitting ? 'Saving…' : 'Apply Override'}
              </Button>
            </Inline>
          }
        >
          <Stack gap="md">
            {override.error && (
              <div className="rounded-lg bg-red-900/40 border border-red-700 px-3 py-2 text-sm text-red-300">
                {override.error}
              </div>
            )}

            <div>
              <p className="text-xs text-slate-400 mb-1">Evaluation ID</p>
              <p className="font-mono text-sm text-slate-300">{override.jobId}</p>
            </div>

            {override.currentScore !== null && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Current AI Score</p>
                <p className="text-2xl font-bold text-indigo-400">
                  {override.currentScore.toFixed(1)}
                </p>
              </div>
            )}

            <Input
              id="input-override-score"
              label="Override Score (0–100)"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={override.overrideScore}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setOverride((p) => ({ ...p, overrideScore: e.target.value }))
              }
              placeholder="e.g. 72.5"
              required
            />

            <Textarea
              id="input-override-reason"
              label="Override Reason (required)"
              value={override.overrideReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setOverride((p) => ({ ...p, overrideReason: e.target.value }))
              }
              placeholder="Explain why the AI score is being overridden…"
              rows={3}
              required
            />

            <Textarea
              id="input-override-feedback"
              label="Student-facing Feedback (optional)"
              value={override.overrideFeedback}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setOverride((p) => ({ ...p, overrideFeedback: e.target.value }))
              }
              placeholder="Feedback the student will see after the override…"
              rows={3}
            />
          </Stack>
        </Modal>
      )}
    </Page>
  );
}
