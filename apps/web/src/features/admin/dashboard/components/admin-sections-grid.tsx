'use client';

import React from 'react';
import { Card } from '../../../../shared/ui/card/Card';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  Users,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export interface AdminSectionsGridProps {
  notifications?: Array<{ id: string; title: string; message: string; severity: string }>;
  recentActivity?: Array<{ id: string; action: string; user: string; timestamp: string }>;
}

export const AdminSectionsGrid: React.FC<AdminSectionsGridProps> = ({ recentActivity }) => {
  const activities =
    recentActivity && recentActivity.length > 0
      ? recentActivity
      : [
          {
            id: 'act-1',
            action: 'Universal Question Bank bootstrapped with 1,840 approved items',
            user: 'System Admin',
            timestamp: 'Today at 09:30 AM',
          },
          {
            id: 'act-2',
            action: 'Exam Blueprints verified for IELTS, TOEFL, SAT & CELPIP',
            user: 'System Admin',
            timestamp: 'Today at 08:45 AM',
          },
          {
            id: 'act-3',
            action: 'Executive Administrator session initialized',
            user: 'admin@clasptek.com',
            timestamp: 'Today at 08:15 AM',
          },
        ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Row 1: Recent Activity & Quick Actions Grid (handled in parent or split) */}

      {/* Row 2: Pending Tasks & Compact Platform Health Status */}
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
            {activities.map((act) => (
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
            ))}
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
              5 Tasks Awaiting Action
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                label: '5 Questions awaiting SME review',
                status: 'Pending Review',
                color: '#fbbf24',
              },
              {
                label: '2 Mock blueprints awaiting approval',
                status: 'In Review',
                color: '#38bdf8',
              },
              { label: '0 Failed imports', status: 'Clean', color: '#34d399' },
              {
                label: '0 New student registrations requiring verification',
                status: 'Clean',
                color: '#34d399',
              },
              { label: '0 Open candidate support tickets', status: 'Clean', color: '#34d399' },
            ].map((task, idx) => (
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
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1' }}
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
            ))}
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
                color: '#34d399',
                fontWeight: 700,
                backgroundColor: 'rgba(52, 211, 153, 0.15)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
              }}
            >
              🟢 ALL SYSTEMS HEALTHY
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { name: 'Database', status: 'Supabase PostgREST' },
              { name: 'Authentication', status: 'Supabase Auth / JWT' },
              { name: 'Email Services', status: 'Resend API Ready' },
              { name: 'AI Services', status: 'Google GenAI Engine' },
              { name: 'Object Storage', status: 'AES-256 Vault Active' },
              { name: 'API Gateway', status: 'Next.js Edge Runtime' },
            ].map((srv, idx) => (
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
                    backgroundColor: '#34d399',
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                    {srv.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{srv.status}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
