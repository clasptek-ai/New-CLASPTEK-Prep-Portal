import React from 'react';
import { WidgetProps } from './WidgetRegistry';

export const ExecutiveInsightWidget: React.FC<WidgetProps> = ({ title, data }) => {
  const insight = data?.insight ?? {
    title: 'Programme Readiness Acceleration',
    narrative: 'Cohort readiness increased 12.4% following targeted mock exam remediation.',
    confidence: '95%',
  };

  return (
    <div className="p-5 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-xl shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
          {title}
        </span>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
          Confidence {insight.confidence}
        </span>
      </div>
      <h4 className="text-base font-bold text-white mb-2">{insight.title}</h4>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">{insight.narrative}</p>
      <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 flex justify-between">
        <span>Source: AnalyticsSnapshot v2.1.1</span>
        <span className="text-indigo-400 hover:underline cursor-pointer font-medium">
          Drill down evidence →
        </span>
      </div>
    </div>
  );
};
