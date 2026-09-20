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
          backgroundColor: 'var(--surface-0)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
          boxShadow: 'var(--shadow-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '0.01em',
              }}
            >
              Today&apos;s Activity
            </h3>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Real-time operational audit log events
            </div>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--success)',
              backgroundColor: 'var(--success-subtle)',
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
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                backgroundColor: 'var(--surface-1)',
                borderRadius: '12px',
                border: '1px dashed var(--border)',
              }}
            >
              <Activity
                size={24}
                color="var(--text-muted)"
                style={{ margin: '0 auto 0.5rem', display: 'block' }}
              />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                No activity recorded today.
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
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
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    padding: '0.3rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--brand-subtle)',
                    color: 'var(--brand)',
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
                      color: 'var(--text-primary)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {act.action}
                  </div>
                  <div
                    style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}
                  >
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
          backgroundColor: 'var(--surface-0)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
          boxShadow: 'var(--shadow-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '0.01em',
              }}
            >
              Pending Operations
            </h3>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Actionable items requiring administrative review
            </div>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              color: tasks.length > 0 ? 'var(--warning)' : 'var(--success)',
              fontWeight: 700,
              backgroundColor: tasks.length > 0 ? 'var(--warning-subtle)' : 'var(--success-subtle)',
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
                color: 'var(--success)',
                fontSize: '0.875rem',
                backgroundColor: 'var(--surface-1)',
                borderRadius: '12px',
                border: '1px dashed var(--border)',
              }}
            >
              <CheckCircle2
                size={24}
                color="var(--success)"
                style={{ margin: '0 auto 0.5rem', display: 'block' }}
              />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                All operations are up to date.
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
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
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
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
                    color: 'var(--text-primary)',
                    flex: 1,
                  }}
                >
                  <AlertCircle
                    size={15}
                    color={task.color || 'var(--warning)'}
                    style={{ flexShrink: 0 }}
                  />
                  <span>{task.label}</span>
                </div>
                {task.actionUrl ? (
                  <Link
                    href={task.actionUrl}
                    style={{
                      color: 'var(--brand)',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      backgroundColor: 'var(--brand-subtle)',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '6px',
                    }}
                  >
                    Resolve <ArrowUpRight size={13} />
                  </Link>
                ) : (
                  <strong style={{ color: task.color || 'var(--warning)', fontSize: '0.725rem' }}>
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
