'use client';

import React, { useState } from 'react';
import {
  Page,
  Container,
  Card,
  Button,
  Form,
  FormField,
  FormLabel,
  Textarea,
  Select,
  Stack,
  Inline,
} from '@clasptek/design-system';

export default function BulkImportPage() {
  const [fileType, setFileType] = useState<'xlsx' | 'csv' | 'json'>('json');
  const [rawContent, setRawContent] = useState('');
  const [report, setReport] = useState<any>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/questions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType, rawContent }),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Bulk Question Import Engine</h1>
            <p className="text-xs text-slate-400">
              Import questions in Excel, CSV, or JSON format with atomic validation
            </p>
          </div>

          <Card variant="bordered">
            <Form onSubmit={handleImport}>
              <FormField>
                <FormLabel>File Format</FormLabel>
                <Select value={fileType} onChange={(e) => setFileType(e.target.value as any)}>
                  <option value="json">JSON Format</option>
                  <option value="csv">CSV Format</option>
                  <option value="xlsx">Excel (.xlsx)</option>
                </Select>
              </FormField>

              <FormField>
                <FormLabel>Raw File / Data Content</FormLabel>
                <Textarea
                  rows={8}
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  placeholder={`[{"code": "Q-001", "questionText": "Sample question text", "skill": "Grammar", "difficulty": "MEDIUM"}]`}
                />
              </FormField>

              <Button type="submit">Validate & Process Import</Button>
            </Form>
          </Card>

          {report && (
            <Card variant="bordered">
              <h3 className="text-base font-semibold text-slate-100 mb-4">
                Import Validation Report
              </h3>
              <Inline gap="md" className="mb-4">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-xs text-slate-400">Total Records</span>
                  <div className="text-xl font-bold text-slate-100">{report.totalRecords}</div>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-xs text-slate-400">Valid</span>
                  <div className="text-xl font-bold text-emerald-400">{report.validCount}</div>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-xs text-slate-400">Duplicates</span>
                  <div className="text-xl font-bold text-amber-400">{report.duplicateCount}</div>
                </div>
              </Inline>
            </Card>
          )}
        </Stack>
      </Container>
    </Page>
  );
}
