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
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (e) {
      console.error('Failed to load admin dashboard live data', e);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto-refresh live institutional telemetry every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  if (loading || !data || !adminProfile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        <Skeleton height="100px" width="100%" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <Skeleton height="90px" width="100%" />
          <Skeleton height="90px" width="100%" />
          <Skeleton height="90px" width="100%" />
          <Skeleton height="90px" width="100%" />
        </div>
        <Skeleton height="200px" width="100%" />
        <Skeleton height="240px" width="100%" />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Executive Command Center Header */}
      <div
        style={{
          padding: '1.25rem 1.75rem',
          borderRadius: '16px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              Executive Command Center
            </h1>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              PostgreSQL Live
            </span>
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: '#cbd5e1',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span>
              Welcome back, <strong>{adminProfile.name || 'Administrator'}</strong>
            </span>
            <span>•</span>
            <span
              style={{
                color: '#34d399',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Radio size={14} color="#34d399" /> System Status: Operational
            </span>
            {lastSynced && (
              <>
                <span>•</span>
                <span style={{ color: '#94a3b8' }}>Last Database Sync: {lastSynced}</span>
              </>
            )}
          </div>
        </div>

        {/* Sync Live Data Refresh Button */}
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '10px',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#f8fafc',
            fontSize: '0.825rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#38bdf8';
            e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.backgroundColor = '#0f172a';
          }}
        >
          <RefreshCw
            size={14}
            className={refreshing ? 'animate-spin' : ''}
            style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
          />
          {refreshing ? 'Syncing...' : 'Sync Live Data'}
        </button>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Row 1 & Row 2 Live KPI Grid */}
      <KPISummaryGrid stats={data.stats} />

      {/* Executive Command Actions */}
      <QuickActionsBar />

      {/* Executive Analytics Charts & Cohort Distributions */}
      <ExecutiveAnalytics charts={data.charts} />

      {/* Realtime Activity Stream, Pending Operations & Subsystem Health */}
      <AdminSectionsGrid
        notifications={data.notifications}
        recentActivity={data.recentActivity}
        pendingTasks={data.pendingTasks}
      />
    </div>
  );
}

export default AdminDashboardScreen;
