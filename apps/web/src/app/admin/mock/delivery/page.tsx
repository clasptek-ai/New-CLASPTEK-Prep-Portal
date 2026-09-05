import React from 'react';
import { MockMonitor } from '@/features/mock-monitor/mock-monitor';
import { getDiagnosticContext } from '@/lib/diagnostic-context';
import { PostgresCanonicalMockRepository } from '@clasptek/persistence';

export const dynamic = 'force-dynamic';

export default async function AdminMockDeliveryPage() {
  let activeSessions: Array<{
    sessionId: string;
    studentId: string;
    status: string;
    warningCount: number;
  }> = [];

  try {
    const { dbPool } = await getDiagnosticContext();
    const mockRepo = new PostgresCanonicalMockRepository(dbPool.getPool());
    const realSessions = await mockRepo.getAdminMockSessions();

    activeSessions = realSessions.map((s) => ({
      sessionId: s.sessionId,
      studentId: s.studentEmail || s.studentName || s.studentId,
      status: s.status || 'IN_PROGRESS',
      warningCount: 0,
    }));
  } catch (err) {
    console.error('Failed to load active mock sessions for delivery page:', err);
  }

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <MockMonitor sessions={activeSessions} />
    </div>
  );
}
