'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminWorkspace } from '../../../workspace/AdminWorkspaceContext';
import {
  adminDashboardService,
  AdminDashboardAggregatedData,
} from '../../../services/admin/dashboard.service';
import { KPISummaryGrid } from './components/kpi-summary-grid';
import { QuickActionsBar } from './components/quick-actions-bar';
import { AdminSectionsGrid } from './components/admin-sections-grid';
import { Skeleton } from '../../../shared/ui/skeleton/Skeleton';

export function AdminDashboardScreen() {
  const _router = useRouter();
  const { adminProfile, pendingApprovals, systemHealth, academicTerm } = useAdminWorkspace();
  const [data, setData] = useState<AdminDashboardAggregatedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminDashboardService.getDashboardData();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !data || !adminProfile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
        <Skeleton height="140px" width="100%" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <Skeleton height="100px" width="100%" />
          <Skeleton height="100px" width="100%" />
          <Skeleton height="100px" width="100%" />
          <Skeleton height="100px" width="100%" />
        </div>
        <Skeleton height="120px" width="100%" />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Compact Enterprise Header */}
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
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            Good Morning, Administrator
          </h1>
          <div
            style={{
              fontSize: '0.85rem',
              color: '#cbd5e1',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <span>{academicTerm}</span>
            <span>•</span>
            <span style={{ color: '#34d399', fontWeight: 600 }}>System Status: Healthy 🟢</span>
            <span>•</span>
            <span>
              Last Sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Top Operational KPI Summary Grid */}
      <KPISummaryGrid stats={data.stats} pendingApprovals={pendingApprovals} />

      {/* Quick Administrative Workflows */}
      <QuickActionsBar />

      {/* Admin Operations Grid (Telemetry, Announcements, Audit Stream) */}
      <AdminSectionsGrid notifications={data.notifications} recentActivity={data.recentActivity} />
    </div>
  );
}

export default AdminDashboardScreen;
