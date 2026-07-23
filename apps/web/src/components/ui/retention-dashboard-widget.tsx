'use client';

import React from 'react';
import { Card, Badge } from './ui-components';

export interface RetentionProfileData {
  id: string;
  competencyId: string;
  retentionScore: number;
  nextReviewDate: string;
  reviewPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export function RetentionDashboardWidget({ profiles }: { profiles: RetentionProfileData[] }) {
  return (
    <Card title="Knowledge Retention Engine (Spaced Repetition)">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {profiles.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            No active retention profiles recorded.
          </p>
        ) : (
          profiles.map((p) => {
            let badgeVar: 'success' | 'warning' | 'danger' = 'success';
            if (p.reviewPriority === 'HIGH') badgeVar = 'warning';
            if (p.reviewPriority === 'CRITICAL') badgeVar = 'danger';

            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: '#0b0f19',
                  borderRadius: '6px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                    Competency: {p.competencyId}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      marginTop: '0.2rem',
                    }}
                  >
                    Retention: {p.retentionScore}% | Next Review:{' '}
                    {new Date(p.nextReviewDate).toLocaleDateString()}
                  </span>
                </div>
                <Badge variant={badgeVar}>Priority: {p.reviewPriority}</Badge>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
