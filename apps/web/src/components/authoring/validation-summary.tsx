'use client';

import React from 'react';
import { Card, Badge } from '../ui/ui-components';

export interface ValidationIssue {
  id: string;
  severity: 'WARNING' | 'ERROR';
  message: string;
  field?: string;
}

export function ValidationSummary({ issues }: { issues: ValidationIssue[] }) {
  const errorsCount = issues.filter((i) => i.severity === 'ERROR').length;
  const warningsCount = issues.filter((i) => i.severity === 'WARNING').length;

  return (
    <Card title="Pre-Publish Integrity Diagnostics">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Badge variant={errorsCount > 0 ? 'danger' : 'success'}>{errorsCount} Errors</Badge>
          <Badge variant={warningsCount > 0 ? 'warning' : 'success'}>
            {warningsCount} Warnings
          </Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {issues.length === 0 ? (
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#10b981' }}>
              ✔ Content conforms to academic validation requirements.
            </p>
          ) : (
            issues.map((issue) => (
              <div
                key={issue.id}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                }}
              >
                <span
                  style={{
                    color: issue.severity === 'ERROR' ? '#ef4444' : '#f59e0b',
                    fontWeight: 700,
                  }}
                >
                  [{issue.severity}]
                </span>
                <span>
                  {issue.message}{' '}
                  {issue.field && <span style={{ color: '#64748b' }}>({issue.field})</span>}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
export default ValidationSummary;
