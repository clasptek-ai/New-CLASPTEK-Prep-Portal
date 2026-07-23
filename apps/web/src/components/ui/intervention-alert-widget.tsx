'use client';

import React from 'react';

export interface InterventionAlertItem {
  id: string;
  ruleCode: string;
  interventionType: string;
  status: string;
  title: string;
  description: string;
  triggerReason: string;
  actionRecommended: string;
  createdAt: string | Date;
}

interface InterventionAlertWidgetProps {
  interventions?: InterventionAlertItem[];
  onAcknowledge?: (id: string) => void;
}

export const InterventionAlertWidget: React.FC<InterventionAlertWidgetProps> = ({
  interventions = [],
  onAcknowledge,
}) => {
  if (!interventions.length) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white">Academic Status</h3>
        <p className="mt-2 text-sm text-emerald-400 font-medium">
          ✓ No active academic interventions. Study progress is on track!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-amber-300">
          Active Interventions ({interventions.length})
        </h3>
        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30">
          Action Required
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {interventions.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="mt-1 text-xs text-slate-300">{item.description}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="font-semibold text-amber-400">Trigger:</span>
                  <span className="text-slate-400">{item.triggerReason}</span>
                  <span className="ml-2 font-semibold text-emerald-400">Action:</span>
                  <span className="text-slate-300">{item.actionRecommended}</span>
                </div>
              </div>

              {item.status === 'ACTIVE' && onAcknowledge && (
                <button
                  onClick={() => onAcknowledge(item.id)}
                  className="rounded-md bg-amber-600 hover:bg-amber-500 px-3 py-1 text-xs font-semibold text-white transition-colors"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
