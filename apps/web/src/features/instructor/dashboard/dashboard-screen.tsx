'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { InstructorStatCard } from '../../../components/instructor/instructor-components';
import { DashboardLayout, Row, Column } from '../../../components/layouts/layout-engine';
import { instructorDashboardService, DashboardStats, RecentActivityItem, DashboardNotificationItem } from '../../../services/instructor/dashboard.service';

export function InstructorDashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await instructorDashboardService.getDashboardData();
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
        setNotifications(data.notifications);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading aggregated dashboard metrics...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Top Welcome Card */}
      <Card style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Welcome to the Instructor Workspace</h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8' }}>
              Facilitate student learning paths, verify readiness metrics, and review assignments submissions.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button onClick={() => router.push('/instructor/assignments')}>Create Assignment</Button>
            <Button variant="secondary" onClick={() => router.push('/instructor/resources')}>Upload Resource</Button>
          </div>
        </div>
      </Card>

      {/* KPI Stats widgets grid */}
      <DashboardLayout>
        <InstructorStatCard title="Assigned Programmes" value={stats.programmes} change="Active tracks" />
        <InstructorStatCard title="Assigned Students" value={stats.students} change="8 new this week" />
        <InstructorStatCard title="Active Assignments" value={stats.activeAssignments} change="In progress" />
        <InstructorStatCard title="Pending Submissions" value={stats.pendingSubmissions} change="Requires review" />
      </DashboardLayout>

      <DashboardLayout>
        <InstructorStatCard title="Average Practice Score" value={`${stats.avgPractice}%`} change="0.5% increase" />
        <InstructorStatCard title="Average Mock Score" value={`${stats.avgMock}%`} change="Core exams avg" />
        <InstructorStatCard title="Average Readiness Score" value={`${stats.avgReadiness}%`} change="Overall target" />
        <InstructorStatCard title="Students At Academic Risk" value={stats.atRisk} change="Requires attention" changeType="negative" />
      </DashboardLayout>

      <Row>
        {/* Recent Student Activity */}
        <Column span={6}>
          <Card title="Recent Student Activity">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentActivity.map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid #232e48' }}>
                  <Badge variant={act.type === 'INTERVENTION' ? 'danger' : act.type === 'MOCK' ? 'success' : 'info'}>
                    {act.type}
                  </Badge>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#f8fafc' }}>{act.msg}</p>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Column>

        {/* Notifications summary card */}
        <Column span={6}>
          <Card title="Dashboard Notifications Summary">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.map((n, i) => (
                <div key={i} style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#0b0f19', borderLeft: '3px solid #14b8a6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{n.text}</span>
                  <Badge>{n.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </Column>
      </Row>
    </div>
  );
}
export default InstructorDashboardScreen;
