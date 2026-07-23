import React from 'react';
import { MockMonitor } from '@/features/mock-monitor/mock-monitor';

export default function AdminMockDeliveryPage() {
  const activeSessions = [
    { sessionId: 'ses-101', studentId: 'std-201', status: 'IN_PROGRESS', warningCount: 0 },
    { sessionId: 'ses-102', studentId: 'std-202', status: 'PAUSED', warningCount: 1 },
  ];

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <MockMonitor sessions={activeSessions} />
    </div>
  );
}
