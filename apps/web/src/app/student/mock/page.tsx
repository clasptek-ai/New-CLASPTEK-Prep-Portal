'use client';

import React from 'react';
import { MockDashboard } from '@/features/mock-dashboard/mock-dashboard';

export default function StudentMockPage() {
  const templates = [
    { id: 'tmpl-ielts-acad', title: 'IELTS Academic Full Official Mock', durationMinutes: 165 },
    { id: 'tmpl-toefl-iBT', title: 'TOEFL iBT Full Official Mock', durationMinutes: 120 },
  ];

  return <MockDashboard availableTemplates={templates} onStart={() => {}} />;
}
