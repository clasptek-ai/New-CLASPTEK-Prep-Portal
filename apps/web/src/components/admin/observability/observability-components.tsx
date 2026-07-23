'use client';

import React from 'react';
import { Card, Badge } from '../../ui/ui-components';
import { TraceSpan } from '../../../services/admin/observability/trace.service';

// ─── Metric Card ────────────────────────────────────────────────────
export function MetricCard({
  name,
  value,
  unit,
  status,
}: {
  name: string;
  value: number | string;
  unit?: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
}) {
  const color = status === 'HEALTHY' ? '#10b981' : status === 'DEGRADED' ? '#f59e0b' : '#ef4444';
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {name}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{value}</span>
          {unit && <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{unit}</span>}
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}
        >
          <span
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }}
          />
          Status: {status}
        </span>
      </div>
    </Card>
  );
}

// ─── Recursive Trace Tree Span ──────────────────────────────────────
export function TraceSpanNode({ span, depth = 0 }: { span: TraceSpan; depth?: number }) {
  return (
    <div
      style={{
        paddingLeft: `${depth * 1.5}rem`,
        borderLeft: depth > 0 ? '1px dashed #1e293b' : 'none',
        marginTop: '0.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#020617',
          padding: '0.5rem',
          borderRadius: '6px',
          border: '1px solid #1e293b',
          fontSize: '0.8rem',
        }}
      >
        <span>
          <strong style={{ color: '#60a5fa' }}>{span.name}</strong>{' '}
          <span style={{ color: '#64748b' }}>({span.service})</span>
        </span>
        <Badge>{span.durationMs} ms</Badge>
      </div>
      {span.children &&
        span.children.map((child) => (
          <TraceSpanNode key={child.id} span={child} depth={depth + 1} />
        ))}
    </div>
  );
}

// ─── Trace Tree Timeline ────────────────────────────────────────────
export function TraceTimeline({ rootSpan }: { rootSpan: TraceSpan }) {
  return (
    <Card title="Distributed Trace Tree Timeline">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <TraceSpanNode span={rootSpan} />
      </div>
    </Card>
  );
}

// ─── Service Dependency Graph Node Maps ─────────────────────────────
export function ServiceDependencyGraph({
  nodes,
}: {
  nodes: { id: string; latencyMs: number; status: string }[];
}) {
  return (
    <Card title="Service Dependency Graph Node Topology">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-around',
          padding: '1rem 0',
        }}
      >
        {nodes.map((n) => (
          <div
            key={n.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              backgroundColor: '#020617',
              minWidth: '100px',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{n.id}</span>
            <Badge variant={n.status === 'HEALTHY' ? 'success' : 'danger'}>{n.latencyMs}ms</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Alert Card ─────────────────────────────────────────────────────
export function AlertCard({
  severity,
  category,
  message,
  timestamp,
}: {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: string;
  message: string;
  timestamp: string;
}) {
  const color =
    severity === 'CRITICAL' ? '#ef4444' : severity === 'WARNING' ? '#f59e0b' : '#3b82f6';
  return (
    <div
      style={{
        borderLeft: `4px solid ${color}`,
        padding: '0.75rem 1rem',
        borderRadius: '4px',
        backgroundColor: '#0b0f19',
        border: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.85rem',
      }}
    >
      <div>
        <div
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}
        >
          <strong style={{ color }}>{severity}</strong>
          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>[{category}]</span>
        </div>
        <p style={{ margin: 0, color: '#cbd5e1' }}>{message}</p>
      </div>
      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{timestamp}</span>
    </div>
  );
}
export default MetricCard;
