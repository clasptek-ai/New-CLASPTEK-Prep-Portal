'use client';

import React from 'react';
import { Card } from '../../../../shared/ui/card/Card';
import { CheckCircle2, ArrowUpRight, Activity, AlertCircle } from 'lucide-react';
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
  const activities = recentActivity && recentActivity.length > 0 ? recentActivity : [];
  const tasks = pendingTasks && pendingTasks.length > 0 ? pendingTasks : [];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.25rem',
        width: '100%',
      }}
      className="admin-sections-grid"
    >
      {/* LEFT COLUMN: Today's Activity */}
      <Card
        style={{
          padding: '1.35rem 1.5rem',
          borderRadius: '16px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '0.01em',
              }}
            >
              Today&apos;s Activity
            </h3>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '2px' }}>
              Real-time operational audit log events
            </div>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              color: '#34d399',
              backgroundColor: 'rgba(52, 211, 153, 0.12)',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              fontWeight: 700,
            }}
          >
            Live Feed
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            maxHeight: '380px',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          {activities.length === 0 ? (
            <div
              style={{
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.875rem',
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: '1px dashed rgba(255,255,255,0.08)',
              }}
            >
              <Activity
                size={24}
                color="#64748b"
                style={{ margin: '0 auto 0.5rem', display: 'block' }}
              />
              <div style={{ fontWeight: 600, color: '#cbd5e1' }}>No activity recorded today.</div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px' }}>
                New student registrations, practice completions, diagnostic assessments, and
                published questions will appear here live.
              </div>
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                style={{
                  padding: '0.75rem 0.9rem',
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
                    padding: '0.3rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    color: '#38bdf8',
                    marginTop: '2px',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: '#f1f5f9',
                      wordBreak: 'break-word',
                    }}
                  >
                    {act.action}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '2px' }}>
                    {act.user} • {act.timestamp}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* RIGHT COLUMN: Pending Operations */}
      <Card
        style={{
          padding: '1.35rem 1.5rem',
          borderRadius: '16px',
          backgroundColor: '#151d30',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '0.01em',
              }}
            >
              Pending Operations
            </h3>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '2px' }}>
              Actionable items requiring administrative review
            </div>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              color: tasks.length > 0 ? '#fbbf24' : '#34d399',
              fontWeight: 700,
              backgroundColor:
                tasks.length > 0 ? 'rgba(251, 191, 36, 0.12)' : 'rgba(52, 211, 153, 0.12)',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
            }}
          >
            {tasks.length > 0 ? `${tasks.length} Pending` : 'Up to Date'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {tasks.length === 0 ? (
            <div
              style={{
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                color: '#34d399',
                fontSize: '0.875rem',
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: '1px dashed rgba(52, 211, 153, 0.2)',
              }}
            >
              <CheckCircle2
                size={24}
                color="#34d399"
                style={{ margin: '0 auto 0.5rem', display: 'block' }}
              />
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                All operations are up to date.
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                No questions under review, pending imports, or flagged assessment reviews.
              </div>
            </div>
          ) : (
            tasks.map((task, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: '10px',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  fontSize: '0.825rem',
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
                  <AlertCircle
                    size={15}
                    color={task.color || '#fbbf24'}
                    style={{ flexShrink: 0 }}
                  />
                  <span>{task.label}</span>
                </div>
                {task.actionUrl ? (
                  <Link
                    href={task.actionUrl}
                    style={{
                      color: task.color || '#38bdf8',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      backgroundColor: `${task.color || '#38bdf8'}15`,
                      padding: '0.25rem 0.55rem',
                      borderRadius: '6px',
                    }}
                  >
                    Resolve <ArrowUpRight size={13} />
                  </Link>
                ) : (
                  <strong style={{ color: task.color || '#fbbf24', fontSize: '0.725rem' }}>
                    {task.status}
                  </strong>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      <style>{`
        @media (max-width: 768px) {
          .admin-sections-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
