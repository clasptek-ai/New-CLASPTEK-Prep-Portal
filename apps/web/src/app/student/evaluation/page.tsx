import React from 'react';
import { EvaluationDashboard } from '@/features/evaluation-dashboard/evaluation-dashboard';

export default function StudentEvaluationPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-6">
      <EvaluationDashboard />
    </div>
  );
}
