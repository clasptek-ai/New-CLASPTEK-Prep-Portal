'use client';

import React, { useState } from 'react';
import { Page, Container, Card, Button, DataTable, Stack, Inline } from '@clasptek/design-system';

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  stage: string;
  practiceUnlocked: boolean;
  mockUnlocked: boolean;
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<StudentRecord[]>([
    {
      id: 's-101',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      stage: 'DIAGNOSTIC_RESULTS',
      practiceUnlocked: false,
      mockUnlocked: false,
    },
    {
      id: 's-102',
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      stage: 'PRACTICE_COMPLETED',
      practiceUnlocked: true,
      mockUnlocked: false,
    },
    {
      id: 's-103',
      name: 'Michael Scott',
      email: 'michael@example.com',
      stage: 'MOCK_SUBMITTED',
      practiceUnlocked: true,
      mockUnlocked: true,
    },
  ]);

  const togglePractice = async (student: StudentRecord) => {
    try {
      const res = await fetch('/api/v1/admin/practice/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, currentStage: student.stage }),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === student.id ? { ...s, practiceUnlocked: true, stage: 'PRACTICE_UNLOCKED' } : s
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMock = async (student: StudentRecord) => {
    try {
      const res = await fetch('/api/v1/admin/mock/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, currentStage: student.stage }),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === student.id ? { ...s, mockUnlocked: true, stage: 'MOCK_UNLOCKED' } : s
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { header: 'Student Name', accessorKey: 'name' as const },
    { header: 'Email', accessorKey: 'email' as const },
    { header: 'Journey Stage', accessorKey: 'stage' as const },
    {
      header: 'Practice Unlock',
      cell: (row: StudentRecord) => (
        <Button
          size="sm"
          variant={row.practiceUnlocked ? 'secondary' : 'primary'}
          onClick={() => togglePractice(row)}
        >
          {row.practiceUnlocked ? 'Unlocked' : 'Unlock Practice'}
        </Button>
      ),
    },
    {
      header: 'Mock Unlock',
      cell: (row: StudentRecord) => (
        <Button
          size="sm"
          variant={row.mockUnlocked ? 'secondary' : 'primary'}
          onClick={() => toggleMock(row)}
        >
          {row.mockUnlocked ? 'Unlocked' : 'Unlock Mock'}
        </Button>
      ),
    },
  ];

  return (
    <Page>
      <Container>
        <Stack gap="lg">
          <Inline align="center" className="justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                Student Journey & Unlock Management
              </h1>
              <p className="text-xs text-slate-400">
                Control student stage progression and diagnostic/practice unlock gates
              </p>
            </div>
          </Inline>

          <Card variant="bordered">
            <DataTable data={students} columns={columns} keyExtractor={(s) => s.id} />
          </Card>
        </Stack>
      </Container>
    </Page>
  );
}
