'use client';

import React, { useState } from 'react';
import { Card } from '../ui/ui-components';

// ─── System Health Card ─────────────────────────────────────────────
export function SystemHealthCard({
  title,
  value,
  status,
  trend,
}: {
  title: string;
  value: string | number;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  trend?: string;
}) {
  const statusColor =
    status === 'HEALTHY' ? '#10b981' : status === 'DEGRADED' ? '#f59e0b' : '#ef4444';
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#94a3b8',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </span>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: statusColor,
            }}
          />
        </div>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>{value}</span>
        {trend && (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{trend}</span>
        )}
      </div>
    </Card>
  );
}

// ─── Environment Badge ──────────────────────────────────────────────
export function EnvironmentBadge({ env }: { env: 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT' }) {
  const colors = {
    PRODUCTION: {
      bg: 'rgba(239, 68, 68, 0.15)',
      border: '1px solid rgba(239, 68, 68, 0.25)',
      text: '#ef4444',
    },
    STAGING: {
      bg: 'rgba(245, 158, 11, 0.15)',
      border: '1px solid rgba(245, 158, 11, 0.25)',
      text: '#f59e0b',
    },
    DEVELOPMENT: {
      bg: 'rgba(59, 130, 246, 0.15)',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      text: '#3b82f6',
    },
  };
  const current = colors[env] || colors.DEVELOPMENT;

  return (
    <span
      style={{
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        backgroundColor: current.bg,
        border: current.border,
        color: current.text,
        fontSize: '0.7rem',
        fontWeight: 700,
      }}
    >
      {env}
    </span>
  );
}

// ─── Interactive Permission Matrix Grid ─────────────────────────────
interface PermissionCapability {
  id: string;
  name: string;
  category: string;
}

interface PermissionRole {
  id: string;
  name: string;
}

export function PermissionMatrix({
  capabilities,
  roles,
}: {
  capabilities: PermissionCapability[];
  roles: PermissionRole[];
}) {
  const [bindings, setBindings] = useState<Record<string, Set<string>>>({
    INSTRUCTOR: new Set(['VIEW_ANALYTICS', 'MANAGE_ASSESSMENTS']),
    STUDENT: new Set(['STUDY_PRACTICE']),
  });

  const togglePermission = (roleId: string, capId: string) => {
    const next = { ...bindings };
    const set = new Set(next[roleId] || []);
    if (set.has(capId)) {
      set.delete(capId);
    } else {
      set.add(capId);
    }
    next[roleId] = set;
    setBindings(next);
  };

  return (
    <Card title="Effective Permissions Matrix Simulator">
      <div style={{ overflowX: 'auto', border: '1px solid #1e293b', borderRadius: '8px' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#0b0f19',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b', backgroundColor: '#020617' }}>
              <th
                style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}
              >
                Capability / Scope
              </th>
              <th
                style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}
              >
                Category
              </th>
              {roles.map((r) => (
                <th
                  key={r.id}
                  style={{
                    padding: '1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    textAlign: 'center',
                  }}
                >
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {capabilities.map((cap) => (
              <tr key={cap.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td
                  style={{
                    padding: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                  }}
                >
                  {cap.name}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                  {cap.category}
                </td>
                {roles.map((role) => {
                  const active = bindings[role.id]?.has(cap.id);
                  return (
                    <td key={role.id} style={{ padding: '1rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!active}
                        onChange={() => togglePermission(role.id, cap.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        aria-label={`Toggle ${cap.name} for ${role.name}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
