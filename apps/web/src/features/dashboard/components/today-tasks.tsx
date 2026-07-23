import React from 'react';
import { Card } from '../../../shared/ui/card/Card';
import { Badge } from '../../../shared/ui/badge/Badge';
import { Button } from '../../../shared/ui/button/Button';

export interface TodayTasksProps {
  recommendations: string[];
  onAction?: (actionText: string) => void;
}

export function TodayTasks({ recommendations, onAction }: TodayTasksProps) {
  return (
    <Card className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white m-0">Today's Recommended Actions</h3>
          <p className="text-xs text-slate-400 m-0 mt-0.5">
            Personalized AI learning targets for maximum score gain
          </p>
        </div>
        <Badge variant="primary" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
          {recommendations.length} Tasks Pending
        </Badge>
      </div>

      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No recommended actions for today. Great job!
          </p>
        ) : (
          recommendations.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/50 rounded-xl transition-all duration-150"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white m-0">{item}</h4>
                  <span className="text-xs text-slate-400">
                    Est. 15-20 mins • Adaptive Grammar Focus
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction?.(item)}
                className="self-end sm:self-center shrink-0 border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
              >
                Start Session
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
