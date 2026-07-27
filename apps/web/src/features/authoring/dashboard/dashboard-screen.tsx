'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '../../../components/ui/ui-components';
import { InstructorStatCard } from '../../../components/instructor/instructor-components';
import { DashboardLayout, Row, Column } from '../../../components/layouts/layout-engine';

export function AuthoringDashboardScreen() {
  const router = useRouter();
  const stats = {
    drafts: 8,
    published: 42,
    pendingReviews: 3,
    questionsCount: 412,
  };

  const auditLogs = [
    { user: 'Jane Doe', action: 'Created question Draft #201', time: '10m ago' },
    { user: 'Bob Smith', action: 'Approved Module Sequence B', time: '1h ago' },
    { user: 'System', action: 'Scheduled release of IELTS Mock Test B', time: '3h ago' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Welcome Banner */}
      <Card style={{ background: 'linear-gradient(135deg, #020617, #0f172a)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>
              Academic Authoring Studio
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8' }}>
              Create, version control, audit review, and publish courses and assessment test
              modules.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button onClick={() => router.push('/authoring/drafts')}>My Drafts Box</Button>
            <Button variant="secondary" onClick={() => router.push('/authoring/question-bank')}>
              New Question Draft
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Stats widgets grid */}
      <DashboardLayout>
        <InstructorStatCard
          title="Active Working Drafts"
          value={stats.drafts}
          change="2 new drafts today"
        />
        <InstructorStatCard
          title="Total Published Assets"
          value={stats.published}
          change="4 modules added this week"
        />
        <InstructorStatCard
          title="Reviews in Approval Queue"
          value={stats.pendingReviews}
          change="1 high priority assignment"
          changeType="negative"
        />
        <InstructorStatCard
          title="Question Bank Index Size"
          value={stats.questionsCount}
          change="15 diagnostic tasks added"
        />
      </DashboardLayout>

      <Row>
        {/* Audit Events */}
        <Column span={6}>
          <Card title="Workspace Change History Log">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {auditLogs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #1e293b',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <strong>{log.user}</strong>: {log.action}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </Column>

        {/* Quick Authoring Checklist */}
        <Column span={6}>
          <Card title="Critical Tasks checklist">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.85rem',
                color: '#cbd5e1',
              }}
            >
              <p>✔ Verify IELTS Outcomes Mapping prerequisites alignment.</p>
              <p>✔ Approve Essay evaluation calibration stubs.</p>
              <p>⚠ Resolve conflict flags in CSV Questions imports queue.</p>
            </div>
          </Card>
        </Column>
      </Row>
    </div>
  );
}
export default AuthoringDashboardScreen;
