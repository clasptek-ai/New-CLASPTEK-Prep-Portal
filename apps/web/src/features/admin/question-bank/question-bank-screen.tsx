'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Table } from '../../../components/ui/ui-components';
import { adminQuestionsService, AdminQuestion } from '../../../services/admin/questions.service';

export function QuestionBankScreen() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminQuestionsService.getPendingQuestions();
        setQuestions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleApprove(id: string) {
    const success = await adminQuestionsService.approveQuestion(id);
    if (success) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      showBanner('Question successfully approved and published to candidate banks!');
    }
  }

  async function handleReject(id: string) {
    const success = await adminQuestionsService.rejectQuestion(
      id,
      'Fails curriculum modifiers specifications.'
    );
    if (success) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      showBanner('Question rejected successfully.');
    }
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading pending question bank imports...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
          Question Bank Approval Hub
        </h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Audit imported questions, verify answers structures, and assign difficulty objectives
        </p>
      </div>

      {banner && (
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
          {banner}
        </div>
      )}

      <Table
        data={questions}
        columns={[
          {
            header: 'Question Prompt',
            render: (row) => <span style={{ fontWeight: 500 }}>{row.text}</span>,
          },
          { header: 'Type', render: (row) => <Badge>{row.type}</Badge> },
          {
            header: 'Difficulty',
            render: (row) => (
              <Badge
                variant={
                  row.difficulty === 'HARD'
                    ? 'danger'
                    : row.difficulty === 'MEDIUM'
                      ? 'warning'
                      : 'success'
                }
              >
                {row.difficulty}
              </Badge>
            ),
          },
          { header: 'Topic', render: (row) => <span>{row.topic}</span> },
          { header: 'Status', render: (row) => <Badge variant="warning">{row.status}</Badge> },
          {
            header: 'Actions',
            render: (row) => (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button onClick={() => handleApprove(row.id)}>Approve</Button>
                <Button variant="secondary" onClick={() => handleReject(row.id)}>
                  Reject
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
export default QuestionBankScreen;
