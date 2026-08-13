'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';

export function ReportsScreen() {
  const [reports, setReports] = useState([
    {
      id: 'rep1',
      name: 'Cohort Progress Summary (English Class A)',
      format: 'PDF',
      status: 'COMPLETED',
      date: '2026-07-16',
    },
    {
      id: 'rep2',
      name: 'Assessments Diagnostics (IELTS Intensive)',
      format: 'CSV',
      status: 'COMPLETED',
      date: '2026-07-15',
    },
  ]);
  const [generating, setGenerating] = useState(false);

  function triggerGenerate() {
    setGenerating(true);
    setTimeout(() => {
      setReports((prev) => [
        {
          id: Math.random().toString(),
          name: 'Manual Classroom Readiness Report (Cohort A)',
          format: 'PDF',
          status: 'COMPLETED',
          date: new Date().toISOString().split('T')[0],
        },
        ...prev,
      ]);
      setGenerating(false);
      alert('Report generated successfully!');
    }, 1000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Generated Reports</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Download classroom metrics summaries and assessments audits
          </p>
        </div>
        <Button onClick={triggerGenerate} disabled={generating}>
          {generating ? 'Generating...' : 'Generate New Report'}
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {reports.map((rep, idx) => (
          <Card key={idx} title={rep.name} actions={<Badge>{rep.format}</Badge>}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1rem',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Date: {rep.date}</span>
              <Button onClick={() => alert(`Downloading ${rep.name} in ${rep.format} format...`)}>
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default ReportsScreen;
