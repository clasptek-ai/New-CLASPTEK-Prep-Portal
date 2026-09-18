'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminWorkspace } from '../../../workspace/AdminWorkspaceContext';
import {
  adminDashboardService,
  AdminDashboardAggregatedData,
} from '../../../services/admin/dashboard.service';
import { KPISummaryGrid } from './components/kpi-summary-grid';
import { QuickActionsBar } from './components/quick-actions-bar';
import { ExecutiveAnalytics } from './components/executive-analytics';
import { AdminSectionsGrid } from './components/admin-sections-grid';
import { Skeleton } from '../../../shared/ui/skeleton/Skeleton';
import { RefreshCw, Radio } from 'lucide-react';

export function AdminDashboardScreen() {
  const { adminProfile } = useAdminWorkspace();
  const [data, setData] = useState<AdminDashboardAggregatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('');

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await adminDashboardService.getDashboardData();
      setData(res);
      setLastSynced(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    } catch (e) {
      console.error('Failed to load admin dashboard data', e);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh live institutional telemetry every 30 seconds
    const interval = setInterval(() => loadData(), 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading || !data || !adminProfile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        <Skeleton height="76px" width="100%" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height="110px" width="100%" />
          ))}
        </div>
        <Skeleton height="200px" width="100%" />
        <Skeleton height="240px" width="100%" />
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        width: '100%',
      }}
    >
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--surface-0)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-surface)',
        }}
      >
        {/* Left: Title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(1.125rem, 3vw, 1.375rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
              }}
            >
              Admin Dashboard
            </h1>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--brand-subtle)',
                color: 'var(--brand-light)',
                border: '1px solid var(--brand-border)',
              }}
            >
              Live
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span>
              Welcome back,{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {adminProfile.name || 'Administrator'}
              </strong>
            </span>
            <span aria-hidden="true" style={{ color: 'var(--border-strong)' }}>
              ·
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--success)',
                fontWeight: 600,
              }}
            >
              <Radio size={12} aria-hidden="true" /> Operational
            </span>
            {lastSynced && (
              <>
                <span aria-hidden="true" style={{ color: 'var(--border-strong)' }}>
                  ·
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {today} · Synced at {lastSynced}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Refresh button */}
        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={refreshing}
          aria-label="Refresh dashboard data"
          className="btn btn--secondary"
          style={{ minWidth: '130px' }}
        >
          <RefreshCw
            size={14}
            style={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
            }}
            aria-hidden="true"
          />
          {refreshing ? 'Syncing…' : 'Refresh Data'}
        </button>
      </div>

      {/* ── KPI Grid ── */}
      <KPISummaryGrid stats={data.stats} />

      {/* ── Quick Actions ── */}
      <QuickActionsBar />

      {/* ── Activity, Notifications, Pending Tasks ── */}
      <AdminSectionsGrid
        notifications={data.notifications}
        recentActivity={data.recentActivity}
        pendingTasks={data.pendingTasks}
      />

      {/* ── Executive Analytics Charts ── */}
      <ExecutiveAnalytics charts={data.charts} />

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default AdminDashboardScreen;
