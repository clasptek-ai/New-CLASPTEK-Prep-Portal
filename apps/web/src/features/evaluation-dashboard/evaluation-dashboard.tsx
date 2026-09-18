'use client';

import React from 'react';

export function EvaluationDashboard() {
  return (
    <div className="bg-(--surface-0) border border-(--border) rounded-xl p-6 md:p-8 space-y-4">
      <div>
        <span className="text-xs font-bold text-(--brand-light) uppercase tracking-wider">
          Diagnostic &amp; AI Analysis
        </span>
        <h1 className="text-2xl font-bold text-(--text-primary) mt-1">AI Evaluation Dashboard</h1>
      </div>
      <p className="text-sm text-(--text-secondary) max-w-2xl leading-relaxed">
        Comprehensive automated scoring, CEFR mapping, and personalised learning recommendations
        for your diagnostic assessments and practice attempts.
      </p>
    </div>
  );
}
