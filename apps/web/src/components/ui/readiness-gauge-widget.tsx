'use client';

import React from 'react';

export type ReadinessLevel = 'HIGH_RISK' | 'NEEDS_IMPROVEMENT' | 'NEARLY_READY' | 'EXAM_READY';

interface ReadinessGaugeWidgetProps {
  readinessScore?: number;
  readinessLevel?: ReadinessLevel;
  lastUpdated?: string | Date;
  onRecalculate?: () => void;
}

const LEVEL_COLORS: Record<ReadinessLevel, { text: string; bg: string; border: string }> = {
  HIGH_RISK: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  NEEDS_IMPROVEMENT: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  NEARLY_READY: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  EXAM_READY: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
};

const LEVEL_LABELS: Record<ReadinessLevel, string> = {
  HIGH_RISK: 'High Risk (0–39)',
  NEEDS_IMPROVEMENT: 'Needs Improvement (40–59)',
  NEARLY_READY: 'Nearly Ready (60–79)',
  EXAM_READY: 'Exam Ready (80–100)',
};

export const ReadinessGaugeWidget: React.FC<ReadinessGaugeWidgetProps> = ({
  readinessScore = 74,
  readinessLevel = 'NEARLY_READY',
  lastUpdated,
  onRecalculate,
}) => {
  const styles = LEVEL_COLORS[readinessLevel];

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Exam Readiness Engine</h3>
        <button
          onClick={onRecalculate}
          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300 transition-colors"
        >
          Recalculate
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-800/80 p-4">
        <div>
          <span className="text-xs text-slate-400">Readiness Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{readinessScore}%</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold border ${styles.bg} ${styles.text} ${styles.border}`}
            >
              {LEVEL_LABELS[readinessLevel]}
            </span>
          </div>
        </div>

        {/* Circular Gauge Progress Representation */}
        <div className="relative h-16 w-16 flex items-center justify-center rounded-full border-4 border-slate-700">
          <span className={`text-sm font-bold ${styles.text}`}>{readinessScore}%</span>
        </div>
      </div>

      {lastUpdated && (
        <p className="mt-3 text-xs text-slate-500">
          Last evaluated: {new Date(lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  );
};
