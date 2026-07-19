'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Table } from '../../../components/ui/ui-components';
import { adminAssessmentsService, AdminAssessmentConfig } from '../../../services/admin/assessments.service';

export function AssessmentsScreen() {
  const [assessments, setAssessments] = useState<AdminAssessmentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminAssessmentsService.getAssessments();
        setAssessments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handlePublish(id: string) {
    const success = await adminAssessmentsService.publishAssessment(id);
    if (success) {
      setAssessments(prev => prev.map(a => a.id === id ? { ...a, status: 'PUBLISHED' } : a));
      showBanner('Assessment successfully published to study portals!');
    }
  }

  async function handleSchedule(id: string) {
    const success = await adminAssessmentsService.scheduleAssessment(id, '2026-08-01T00:00:00Z', '2026-12-31T23:59:59Z');
    if (success) {
      setAssessments(prev =>
        prev.map(a =>
          a.id === id
            ? { ...a, availableFrom: '2026-08-01T00:00:00Z', availableUntil: '2026-12-31T23:59:59Z' }
            : a
        )
      );
      showBanner('Assessment dates rescheduled successfully!');
    }
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Loading assessments schedule controls...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Mock Exams Scheduling & Controls</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Define mock exams properties, configure availability dates, and manage duration rules</p>
      </div>

      {banner && (
        <div style={{ padding: '1rem', backgroundColor: '#10b98120', border: '1px solid #10b98140', borderRadius: '8px', color: '#10b981', fontSize: '0.85rem' }}>
          {banner}
        </div>
      )}

      <Table
        data={assessments}
        columns={[
          { header: 'Assessment Title', render: row => <span style={{ fontWeight: 600 }}>{row.title}</span> },
          { header: 'Type', render: row => <Badge>{row.type}</Badge> },
          { header: 'Duration', render: row => <span>{row.durationMinutes} mins</span> },
          { header: 'Questions', render: row => <span>{row.questionCount}</span> },
          {
            header: 'Available Window',
            render: row => (
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                {row.availableFrom ? `${new Date(row.availableFrom).toLocaleDateString()} - ${new Date(row.availableUntil!).toLocaleDateString()}` : 'Unsched'}
              </span>
            )
          },
          { header: 'Status', render: row => <Badge variant={row.status === 'PUBLISHED' ? 'success' : 'warning'}>{row.status}</Badge> },
          {
            header: 'Actions',
            render: row => (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {row.status === 'DRAFT' && (
                  <Button onClick={() => handlePublish(row.id)}>Publish</Button>
                )}
                <Button variant="secondary" onClick={() => handleSchedule(row.id)}>Reschedule</Button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
export default AssessmentsScreen;
