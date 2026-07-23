'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../../../components/ui/ui-components';
import {
  instructorAnalyticsService,
  PracticeAnalyticsSummary,
} from '../../../services/instructor/analytics.service';

export function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<PracticeAnalyticsSummary | null>(null);

  useEffect(() => {
    async function load() {
      const data = await instructorAnalyticsService.getPracticeAnalytics();
      setAnalytics(data);
    }
    load();
  }, []);

  if (!analytics) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading practice analytics...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
          Practice Analytics Workspace
        </h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Track cohort syllabus completion rates, streaks, and speed performance
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <Card title="Completion Rate">
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
            {analytics.completionRate}%
          </div>
        </Card>
        <Card title="Average Attempts">
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6' }}>
            {analytics.averageAttempts}x
          </div>
        </Card>
        <Card title="Active Practice Streak">
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>
            {analytics.practiceStreak} days
          </div>
        </Card>
        <Card title="Time per Question">
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ec4899' }}>
            {analytics.timePerQuestionSeconds} seconds
          </div>
        </Card>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <Card title="Cohort Weakest Topics">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {analytics.weakestTopics.map((topic, i) => (
              <Badge key={i} variant="danger">
                {topic}
              </Badge>
            ))}
          </div>
        </Card>
        <Card title="Cohort Strongest Topics">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {analytics.strongestTopics.map((topic, i) => (
              <Badge key={i} variant="success">
                {topic}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
export default AnalyticsScreen;
