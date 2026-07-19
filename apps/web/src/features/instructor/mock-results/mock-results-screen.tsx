'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { instructorMockResultsService, MockExamResult } from '../../../services/instructor/mock-results.service';

export function MockResultsScreen() {
  const [mockResults, setMockResults] = useState<MockExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await instructorMockResultsService.getMockResults();
        setMockResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExport = (mockName: string) => {
    setNotification(`Successfully exported PDF report details for ${mockName}!`);
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading mock results diagnostic dashboard...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Mock Examinations Results</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Analyze section-wise test performance scoreboards and trigger PDF report summaries</p>
        </div>
      </div>

      {notification && (
        <div style={{ padding: '1rem', backgroundColor: '#10b98120', border: '1px solid #10b98140', borderRadius: '8px', color: '#10b981', fontSize: '0.85rem' }}>
          {notification}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {mockResults.map(mock => (
          <Card key={mock.id} title={`${mock.name} — ${mock.studentName}`} actions={<Button onClick={() => handleExport(mock.name)}>Export PDF Report</Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '0.75rem', backgroundColor: '#0b0f19', borderRadius: '6px' }}>
                <div>Overall Score: <strong>{mock.score}%</strong></div>
                <div>Percentile: <strong>{mock.percentile}th</strong></div>
                <div>Time Used: <strong>{mock.timeUsed}</strong></div>
                <div>Incorrect count: <strong>{mock.incorrectQuestions.length}</strong></div>
              </div>

              <div>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>Section Scores:</span>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem', color: '#94a3b8' }}>
                  <span>Listening: <strong>{mock.sectionScores.listening}</strong></span>
                  <span>Reading: <strong>{mock.sectionScores.reading}</strong></span>
                  <span>Writing: <strong>{mock.sectionScores.writing}</strong></span>
                  <span>Speaking: <strong>{mock.sectionScores.speaking}</strong></span>
                </div>
              </div>

              <div>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>Weak Objectives:</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {mock.weakObjectives.map((o, idx) => (
                    <Badge key={idx} variant="danger">{o}</Badge>
                  ))}
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderLeft: '3px solid #f59e0b', backgroundColor: '#0b0f19' }}>
                <span style={{ fontWeight: 600, color: '#f59e0b', display: 'block', marginBottom: '0.25rem' }}>AI Recommendation:</span>
                {mock.recommendations}
              </div>

              <div>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>Incorrect Questions:</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {mock.incorrectQuestions.map((q, idx) => (
                    <span key={idx} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ef444415', border: '1px solid #ef444430', color: '#ef4444', borderRadius: '4px', fontWeight: 600 }}>
                      Q{q}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default MockResultsScreen;
