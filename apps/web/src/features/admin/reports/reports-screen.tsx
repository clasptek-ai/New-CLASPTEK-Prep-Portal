'use client';

import React, { useState } from 'react';
import { Card, Button } from '../../../components/ui/ui-components';
import { ReportFilterOptions } from '../../../services/admin/reports.service';
import { adminDashboardService } from '../../../services/admin/dashboard.service';
import { useNotification } from '../../../providers/notification-provider';

export function ReportsScreen() {
  const { showSuccess, showError } = useNotification();
  const [filters, setFilters] = useState<ReportFilterOptions>({
    startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  const downloadFile = (title: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/csv;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/\s+/g, '_')}_export.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  async function handleGenerateQuestionAnalysis() {
    setLoading(true);
    try {
      const qbMetrics = await adminDashboardService.getQuestionBankMetrics();
      const timestamp = new Date().toISOString();
      const csvLines = [
        `"CLASPTEK PREP PORTAL - QUESTION BANK METRICS REPORT"`,
        `"Generated At","${timestamp}"`,
        `"Filter Start Date","${filters.startDate || 'N/A'}"`,
        `"Filter End Date","${filters.endDate || 'N/A'}"`,
        ``,
        `"Status","Item Count"`,
        `"Published","${qbMetrics.published}"`,
        `"Approved","${qbMetrics.approved}"`,
        `"Draft","${qbMetrics.draft}"`,
        `"Under Review","${qbMetrics.underReview}"`,
        `"Archived","${qbMetrics.archived}"`,
        `"Total Items","${qbMetrics.total}"`,
      ];
      downloadFile('Question_Analysis_Report', csvLines.join('\n'));
      showSuccess('Question Analysis Report exported successfully from live database data!');
    } catch (e: any) {
      showError(e.message || 'Failed to generate Question Analysis Report');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateProgrammeReadiness() {
    setLoading(true);
    try {
      const studentData = await adminDashboardService.getStudents();
      const timestamp = new Date().toISOString();
      const csvLines = [
        `"CLASPTEK PREP PORTAL - PROGRAMME CANDIDATE READINESS REPORT"`,
        `"Generated At","${timestamp}"`,
        `"Total Active Students","${studentData.totalStudents}"`,
        `"Institutional Avg Readiness","${studentData.averageReadiness}%"`,
        `"High Risk Students Count","${studentData.studentsAtRisk}"`,
        ``,
        `"Student ID","Name","Email","Registration Date","Readiness Score","Risk Level","Practice Attempts"`,
      ];

      studentData.students.forEach((s) => {
        csvLines.push(
          `"${s.id}","${s.name}","${s.email}","${s.registrationDate}","${s.readinessScore}%","${s.riskLevel}","${s.practiceCount}"`
        );
      });

      downloadFile('Programme_Readiness_Report', csvLines.join('\n'));
      showSuccess('Programme Readiness Report exported successfully from live database data!');
    } catch (e: any) {
      showError(e.message || 'Failed to generate Programme Readiness Report');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
          Platform Operational Reports & Data Exports
        </h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Query live PostgreSQL student records and question item statistics to export CSV reports.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Available Live Database Reports">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                marginTop: '1rem',
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#0b0f19',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                }}
              >
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#f8fafc',
                    display: 'block',
                  }}
                >
                  Question Analysis Report
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: '#64748b',
                    marginTop: '0.25rem',
                    marginBottom: '1rem',
                  }}
                >
                  Audits question bank status counts, approval breakdown, and item counts directly
                  from PostgreSQL.
                </span>
                <Button onClick={handleGenerateQuestionAnalysis} disabled={loading}>
                  {loading ? 'Exporting...' : 'Export Question Analysis CSV'}
                </Button>
              </div>

              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#0b0f19',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                }}
              >
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#f8fafc',
                    display: 'block',
                  }}
                >
                  Programme Readiness Report
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: '#64748b',
                    marginTop: '0.25rem',
                    marginBottom: '1rem',
                  }}
                >
                  Exports student candidate readiness scores, risk indicators, practice attempt counts,
                  and registration dates.
                </span>
                <Button onClick={handleGenerateProgrammeReadiness} disabled={loading}>
                  {loading ? 'Exporting...' : 'Export Programme Readiness CSV'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Report Query Filters">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginTop: '0.5rem',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    marginBottom: '0.25rem',
                  }}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#0b0f19',
                    color: '#cbd5e1',
                    border: '1px solid #232e48',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    marginBottom: '0.25rem',
                  }}
                >
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: '#0b0f19',
                    color: '#cbd5e1',
                    border: '1px solid #232e48',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ReportsScreen;
