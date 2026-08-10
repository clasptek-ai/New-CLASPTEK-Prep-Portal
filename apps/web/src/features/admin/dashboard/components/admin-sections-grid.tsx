'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../../../../shared/ui/card/Card';
import { CheckCircle2 } from 'lucide-react';
import { adminDashboardService } from '@/services/admin/dashboard.service';
import { InfrastructureHealthDto } from '@/services/admin/analytics.dto';

export interface AdminSectionsGridProps {
  notifications?: Array<{ id: string; title: string; message: string; severity: string }>;
  recentActivity?: Array<{ id: string; action: string; user: string; timestamp: string }>;
  pendingTasks?: Array<{ label: string; status: string; color: string }>;
}

export const AdminSectionsGrid: React.FC<AdminSectionsGridProps> = ({
  recentActivity,
  pendingTasks,
}) => {
  const [health, setHealth] = useState<InfrastructureHealthDto | null>(null);

  useEffect(() => {
    adminDashboardService.getHealth().then(setHealth).catch(console.error);
  }, []);

  const activities = recentActivity && recentActivity.length > 0 ? recentActivity : [];
  const tasks = pendingTasks && pendingTasks.length > 0 ? pendingTasks : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          width: '100%',
        }}
      >
        {/* Recent Activity Feed Panel */}
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
              Today's Activity Feed
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time Audit Stream</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {activities.length === 0 ? (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '0.85rem',
                }}
              >
                No audit activity recorded yet today.
              </div>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.35rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      marginTop: '2px',
                    }}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
                      {act.action}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      {act.user} • {act.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Operational Pending Tasks Panel */}
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
              Pending Operations & Reviews
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>
              {tasks.length} Operational Tasks
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.length === 0 ? (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  color: '#34d399',
                  fontSize: '0.85rem',
                }}
              >
                All operations clean & fully reviewed!
              </div>
            ) : (
              tasks.map((task, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    backgroundColor: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      color: '#cbd5e1',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: task.color,
                      }}
                    />
                    {task.label}
                  </div>
                  <strong style={{ color: task.color, fontSize: '0.75rem' }}>{task.status}</strong>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Compact Platform Health Status Card */}
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
              Platform Infrastructure Health
            </h3>
            <span
              style={{
                fontSize: '0.75rem',
                color: health?.status === 'CRITICAL' ? '#f87171' : '#34d399',
                fontWeight: 700,
                backgroundColor:
                  health?.status === 'CRITICAL'
                    ? 'rgba(248, 113, 113, 0.15)'
                    : 'rgba(52, 211, 153, 0.15)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
              }}
            >
              {health?.status === 'CRITICAL' ? '🔴 SYSTEM WARNING' : '🟢 ALL SYSTEMS HEALTHY'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {(health?.services || []).map(
              (srv: { name: string; status: string; detail: string }, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    backgroundColor: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: srv.status === 'Healthy' ? '#34d399' : '#f87171',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                      {srv.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{srv.detail}</div>
                  </div>
                </div>
              )
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
