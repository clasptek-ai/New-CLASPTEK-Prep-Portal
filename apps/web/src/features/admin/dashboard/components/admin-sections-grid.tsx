'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../../../../shared/ui/card/Card';
import {
  CheckCircle2,
  ArrowUpRight,
  Activity,
  Database,
  Server,
  Mail,
  Cpu,
  HardDrive,
  Shield,
} from 'lucide-react';
import { adminDashboardService } from '@/services/admin/dashboard.service';
import { InfrastructureHealthDto } from '@/services/admin/analytics.dto';
import Link from 'next/link';

export interface AdminSectionsGridProps {
  notifications?: Array<{ id: string; title: string; message: string; severity: string }>;
  recentActivity?: Array<{ id: string; action: string; user: string; timestamp: string }>;
  pendingTasks?: Array<{ label: string; status: string; color: string; actionUrl?: string }>;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.25rem',
          width: '100%',
        }}
      >
        {/* Real-Time Institutional Activity Stream Panel */}
        <Card
          style={{
            padding: '1.5rem',
            borderRadius: '16px',
            backgroundColor: '#151d30',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Institutional Activity Stream
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Live audit trail events (Max 20)
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#34d399',
                backgroundColor: 'rgba(52, 211, 153, 0.12)',
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              🟢 Realtime Stream
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              maxHeight: '420px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}
          >
            {activities.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '0.875rem',
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: '1px dashed rgba(255,255,255,0.08)',
                }}
              >
                <Activity
                  size={28}
                  color="#64748b"
                  style={{ margin: '0 auto 0.5rem', display: 'block' }}
                />
                No institutional activity recorded yet today.
                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>
                  Student registrations, practice completions, and administrative events will appear
                  here live.
                </div>
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
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#f1f5f9',
                        wordBreak: 'break-word',
                      }}
                    >
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

        {/* Operational Pending Operations Panel */}
        <Card
          style={{
            padding: '1.5rem',
            borderRadius: '16px',
            backgroundColor: '#151d30',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Pending Operations & Queue
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Tasks requiring administrative intervention
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: tasks.length > 0 ? '#fbbf24' : '#34d399',
                fontWeight: 700,
              }}
            >
              {tasks.length > 0 ? `${tasks.length} Action Items` : '0 Action Items'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#34d399',
                  fontSize: '0.875rem',
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: '1px dashed rgba(52, 211, 153, 0.2)',
                }}
              >
                <CheckCircle2
                  size={28}
                  color="#34d399"
                  style={{ margin: '0 auto 0.5rem', display: 'block' }}
                />
                All operations clean & fully reviewed!
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                  No pending question approvals, unassigned students, or orphaned sessions.
                </div>
              </div>
            ) : (
              tasks.map((task, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      color: '#cbd5e1',
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: task.color,
                        flexShrink: 0,
                      }}
                    />
                    <span>{task.label}</span>
                  </div>
                  {task.actionUrl ? (
                    <Link
                      href={task.actionUrl}
                      style={{
                        color: task.color,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        backgroundColor: `${task.color}15`,
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                      }}
                    >
                      Resolve <ArrowUpRight size={14} />
                    </Link>
                  ) : (
                    <strong style={{ color: task.color, fontSize: '0.75rem' }}>
                      {task.status}
                    </strong>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Infrastructure & Subsystem Health Panel */}
        <Card
          style={{
            padding: '1.5rem',
            borderRadius: '16px',
            backgroundColor: '#151d30',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Infrastructure Subsystem Health
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Real-time telemetry and service status
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: health?.status === 'CRITICAL' ? '#f87171' : '#34d399',
                fontWeight: 700,
                backgroundColor:
                  health?.status === 'CRITICAL'
                    ? 'rgba(248, 113, 113, 0.15)'
                    : 'rgba(52, 211, 153, 0.15)',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
              }}
            >
              {health?.status === 'CRITICAL' ? '🔴 CRITICAL WARNING' : '🟢 100% OPERATIONAL'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {(health?.services || []).map(
              (srv: { name: string; status: string; detail: string }, idx: number) => {
                const getIcon = (name: string) => {
                  if (name.includes('Database')) return <Database size={16} color="#38bdf8" />;
                  if (name.includes('Auth')) return <Shield size={16} color="#34d399" />;
                  if (name.includes('Email')) return <Mail size={16} color="#fbbf24" />;
                  if (name.includes('AI')) return <Cpu size={16} color="#a855f7" />;
                  if (name.includes('Storage')) return <HardDrive size={16} color="#38bdf8" />;
                  return <Server size={16} color="#818cf8" />;
                };

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {getIcon(srv.name)}
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: srv.status === 'Healthy' ? '#34d399' : '#f87171',
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                        {srv.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#94a3b8',
                          marginTop: '2px',
                          lineHeight: 1.3,
                        }}
                      >
                        {srv.detail}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
