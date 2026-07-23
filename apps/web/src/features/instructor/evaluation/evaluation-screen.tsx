'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../../components/ui/ui-components';
import { BulkTable } from '../../../components/instructor/instructor-components';
import {
  instructorAssessmentService,
  SubmissionItem,
} from '../../../services/instructor/assessment.service';

export function EvaluationScreen() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [selectedSub, setSelectedSub] = useState<SubmissionItem | null>(null);
  const [overrideVal, setOverrideVal] = useState('');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    async function load() {
      const list = await instructorAssessmentService.getSubmissions();
      setSubmissions(list);
    }
    load();
  }, []);

  const [notification, setNotification] = useState<string | null>(null);

  async function handleOverride(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSub || !overrideVal) return;
    const scoreNum = parseFloat(overrideVal);
    const success = await instructorAssessmentService.overrideScore(
      selectedSub.id,
      scoreNum,
      commentText
    );
    if (success) {
      setNotification(`Score overridden to ${scoreNum} for ${selectedSub.studentName}!`);
      setTimeout(() => setNotification(null), 3000);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedSub.id ? { ...s, aiScore: scoreNum, evaluated: true } : s
        )
      );
      setSelectedSub(null);
      setOverrideVal('');
      setCommentText('');
    }
  }

  const columns = [
    {
      header: 'Student',
      render: (row: SubmissionItem) => <span>{row.studentName}</span>,
    },
    {
      header: 'Assessment Title',
      render: (row: SubmissionItem) => <span>{row.assessmentTitle}</span>,
    },
    {
      header: 'AI Evaluation Score',
      render: (row: SubmissionItem) => <span style={{ fontWeight: 700 }}>{row.aiScore}%</span>,
    },
    {
      header: 'Review Status',
      render: (row: SubmissionItem) => (
        <span style={{ color: row.evaluated ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
          {row.evaluated ? 'Reviewed' : 'Pending Review'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row: SubmissionItem) => (
        <Button
          onClick={() => {
            setSelectedSub(row);
            setOverrideVal(String(row.aiScore));
          }}
        >
          Calibrate Score
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>AI Evaluation Reviews</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Review grammar grading rubrics, essays, and apply overrides
        </p>
      </div>

      {notification && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#10b98120',
            border: '1px solid #10b98140',
            borderRadius: '8px',
            color: '#10b981',
            fontSize: '0.85rem',
          }}
        >
          {notification}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selectedSub ? '1fr 340px' : '1fr',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        <BulkTable data={submissions} columns={columns} />

        {selectedSub && (
          <Card title="Score Calibration Override">
            <form
              onSubmit={handleOverride}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <p>Student: **{selectedSub.studentName}**</p>
                <p>Original AI Score: **{selectedSub.aiScore}%**</p>
              </div>
              <Input
                label="New Score Value (%)"
                type="number"
                min="0"
                max="100"
                value={overrideVal}
                onChange={(e) => setOverrideVal(e.target.value)}
                required
              />
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    marginBottom: '0.5rem',
                  }}
                >
                  Comments / Justification
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Note the reasons for adjustment (e.g. valid vocabulary vocabulary nuance)..."
                  style={{
                    width: '100%',
                    height: '80px',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #232e48',
                    backgroundColor: '#0b0f19',
                    color: '#f8fafc',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setSelectedSub(null)}>
                  Cancel
                </Button>
                <Button type="submit">Approve & Release</Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
export default EvaluationScreen;
