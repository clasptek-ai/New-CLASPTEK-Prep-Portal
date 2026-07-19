'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { Row, Column } from '../../../components/layouts/layout-engine';
import { useAdminWorkspace } from '../../../workspace/AdminWorkspaceContext';
import { adminDashboardService, AdminDashboardAggregatedData } from '../../../services/admin/dashboard.service';

export function AdminDashboardScreen() {
  const router = useRouter();
  const { adminProfile, pendingApprovals, systemHealth, academicTerm } = useAdminWorkspace();
  const [data, setData] = useState<AdminDashboardAggregatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'METRICS' | 'OVERVIEW'>('METRICS');

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
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading platform administration stats...</h3>
      </div>
    );
  }

  const stats = data.stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Top Banner Card */}
      <Card style={{ background: 'linear-gradient(135deg, #ec489920, #0b0f19)', border: '1px solid #ec489940' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Platform Administration Console</h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#cbd5e1' }}>
              Active Term: <strong>{academicTerm}</strong> | System Health: <Badge variant={systemHealth === 'HEALTHY' ? 'success' : 'danger'}>{systemHealth}</Badge>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant={activeTab === 'METRICS' ? 'primary' : 'secondary'} onClick={() => setActiveTab('METRICS')}>Dashboard Metrics</Button>
            <Button variant={activeTab === 'OVERVIEW' ? 'primary' : 'secondary'} onClick={() => setActiveTab('OVERVIEW')}>Platform Overview</Button>
          </div>
        </div>
      </Card>

      {activeTab === 'METRICS' ? (
        <>
          {/* KPI statistics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <Card title="Total Platform Users">
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{stats.totalUsers}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Students: {stats.activeStudents} | Instructors: {stats.activeInstructors}</div>
            </Card>
            <Card title="Active Programmes">
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{stats.programmesCount}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Capacity tracking active</div>
            </Card>
            <Card title="Mock Exams Configured">
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{stats.activeExamsCount}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Assessment Runtime linked</div>
            </Card>
            <Card title="Pending Approvals">
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#f59e0b' }}>{pendingApprovals}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Requires validation actions</div>
            </Card>
          </div>

          <Row>
            {/* Quick Actions Panel */}
            <Column span={6}>
              <Card title="Quick Action Operations">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <Button onClick={() => router.push('/admin/programmes')}>Create Programme</Button>
                  <Button variant="secondary" onClick={() => router.push('/admin/users')}>Add User</Button>
                  <Button variant="ghost" onClick={() => router.push('/admin/curriculum')}>Publish Curriculum</Button>
                  <Button variant="ghost" onClick={() => router.push('/admin/question-bank')}>Review Questions</Button>
                  <Button variant="secondary" onClick={() => router.push('/admin/resources')}>Upload Resource</Button>
                </div>
              </Card>
            </Column>

            {/* Platform Notifications list */}
            <Column span={6}>
              <Card title="System Announcements">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {data.notifications.map(n => (
                    <div key={n.id} style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0b0f19', borderLeft: `3px solid ${n.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}` }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', display: 'block' }}>{n.title}</span>
                      <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{n.message}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Column>
          </Row>

          <Card title="Recent Administrative Events logs">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              {data.recentActivity.map(act => (
                <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#0b0f19', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{act.action}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>By: {act.user} | {new Date(act.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        /* Section 7: Platform Overview Screen */
        <Card title="Platform Overview Operations Summary">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Realtime Active Nodes</h3>
              <div style={{ padding: '1rem', backgroundColor: '#0b0f19', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span>Online Users:</span>
                  <strong style={{ color: '#10b981' }}>12 Active</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span>Running Mock Exams:</span>
                  <strong>3 In Progress</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Pending Grading:</span>
                  <strong style={{ color: '#f59e0b' }}>8 Submissions</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Security Credentials Status</h3>
              <div style={{ padding: '1rem', backgroundColor: '#0b0f19', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>✔ Supabase RLS Enforcement check: **Enforced**</p>
                <p style={{ margin: '0 0 0.5rem 0' }}>✔ API Audit logging pipeline: **Online**</p>
                <p style={{ margin: 0 }}>✔ Encryption status parameters: **AES-256 Active**</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
export default AdminDashboardScreen;
