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
  const router = useRouter();
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Banner & Profile Overview Header */}
      <div
        style={{
          padding: '2rem',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(21, 29, 48, 0.95), rgba(15, 23, 42, 0.98))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              textTransform: 'uppercase',
            }}
          >
            ACADEMIC OPERATIONS CENTER
          </span>
          <h1 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.95rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Enterprise Administration Console
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '640px' }}>
            Operational telemetry, admissions management, assessment runtime controls, and multi-programme analytics for {academicTerm}.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(52, 211, 153, 0.1)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
              System Status
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              {systemHealth}
            </div>
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
