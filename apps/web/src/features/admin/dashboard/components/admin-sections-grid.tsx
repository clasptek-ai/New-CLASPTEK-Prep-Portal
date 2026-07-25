import React from 'react';
import { Card } from '../../../../shared/ui/card/Card';
import { Timeline, TimelineItem } from '../../../../shared/ui/timeline/Timeline';
import { CheckCircle2, AlertTriangle, ShieldCheck, UserPlus, Bell, FileText } from 'lucide-react';

export interface AdminSectionsGridProps {
  notifications: Array<{ id: string; title: string; message: string; severity: string }>;
  recentActivity: Array<{ id: string; action: string; user: string; timestamp: string }>;
}

export const AdminSectionsGrid: React.FC<AdminSectionsGridProps> = ({
  notifications,
  recentActivity,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        width: '100%',
      }}
    >
      {/* Panel 1: Operational Platform Status */}
      <Card
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
            Platform Node Telemetry
          </h3>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(52, 211, 153, 0.15)',
              color: '#34d399',
            }}
          >
            OPERATIONAL
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#0f172a',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: '#cbd5e1' }}>Concurrent Active Students:</span>
            <strong style={{ color: '#34d399' }}>1,842 Active Sessions</strong>
          </div>
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#0f172a',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: '#cbd5e1' }}>Mock Examination Server:</span>
            <strong style={{ color: '#38bdf8' }}>4 Full Mocks In Progress</strong>
          </div>
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#0f172a',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: '#cbd5e1' }}>Diagnostic Submissions Queue:</span>
            <strong style={{ color: '#fbbf24' }}>14 Pending Evaluations</strong>
          </div>
        </div>
      </Card>

      {/* Panel 2: System Announcements */}
      <Card
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
            System Announcements
          </h3>
          <Bell size={18} color="#38bdf8" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: '#0f172a',
                  borderLeft: `3px solid ${n.severity === 'CRITICAL' ? '#f87171' : '#fbbf24'}`,
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '0.775rem', color: '#cbd5e1', marginTop: '3px' }}>
                  {n.message}
                </div>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>No system notifications.</div>
          )}
        </div>
      </Card>

      {/* Panel 3: Recent Administrative Audit Logs */}
      <Card
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
            Audit & Event Stream
          </h3>
          <ShieldCheck size={18} color="#34d399" />
        </div>

        <Timeline>
          {recentActivity.map((act) => (
            <TimelineItem
              key={act.id}
              date={new Date(act.timestamp).toLocaleTimeString()}
              title={act.action}
              description={`Actor: ${act.user}`}
              icon={<CheckCircle2 size={15} color="#38bdf8" />}
              isCompleted={true}
            />
          ))}
        </Timeline>
      </Card>
    </div>
  );
};
