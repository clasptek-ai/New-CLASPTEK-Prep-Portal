import React from 'react';
import { Card } from '../../../shared/ui/card/Card';
import { Badge } from '../../../shared/ui/badge/Badge';

export interface DeadlineItem {
  title: string;
  due: string;
  type: 'ASSIGNMENT' | 'MOCK';
}

export interface UpcomingMockCardProps {
  deadlines: DeadlineItem[];
}

export function UpcomingMockCard({ deadlines }: UpcomingMockCardProps) {
  return (
    <Card className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white m-0">Upcoming Mock & Deadlines</h3>
          <p className="text-xs text-slate-400 m-0 mt-0.5">
            Scheduled assessments and assignment submission dates
          </p>
        </div>
        <Badge variant="outline" className="text-slate-300 border-slate-700">
          {deadlines.length} Scheduled
        </Badge>
      </div>

      <div className="space-y-3">
        {deadlines.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No upcoming mock exams or assignments.
          </p>
        ) : (
          deadlines.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/40 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant={item.type === 'MOCK' ? 'primary' : 'warning'}
                  className="text-xs uppercase font-bold px-2 py-0.5"
                >
                  {item.type}
                </Badge>
                <div>
                  <h4 className="text-sm font-semibold text-white m-0">{item.title}</h4>
                  <span className="text-xs text-slate-400">Due: {item.due}</span>
                </div>
              </div>

              <span className="text-xs font-semibold text-blue-400 hover:underline cursor-pointer">
                View Details
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
