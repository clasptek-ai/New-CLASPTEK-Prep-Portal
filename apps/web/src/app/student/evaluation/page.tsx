import React from 'react';
import { EvaluationDashboard } from '@/features/evaluation-dashboard/evaluation-dashboard';
import { EvaluationStatus } from '@/features/evaluation-status/evaluation-status';
import { EvaluationResults } from '@/features/evaluation-results/evaluation-results';

export default function StudentEvaluationPage() {
  return (
    <div className="bg-slate-950 min-h-screen text-white p-8 space-y-6">
      <EvaluationDashboard />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <EvaluationStatus status="QUEUED" attempts={1} remainingSeconds={30} />
        <EvaluationResults
          bandScore="7.5"
          rawScore={8.0}
          maxScore={9.0}
          feedbackText="Coherent arguments and good lexical resource."
        />
      </div>
    </div>
  );
}
