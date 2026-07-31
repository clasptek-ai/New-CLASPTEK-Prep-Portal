import React from 'react';
import { EvaluationDashboard } from '@/features/evaluation-dashboard/evaluation-dashboard';

export default function StudentEvaluationPage() {
  return (
    <div className="bg-slate-950 min-h-screen text-white p-8 space-y-6">
      <EvaluationDashboard />
    </div>
  );
}
