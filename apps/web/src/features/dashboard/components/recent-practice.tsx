import React from 'react';
import { Card } from '../../../shared/ui/card/Card';
import { Badge } from '../../../shared/ui/badge/Badge';

export interface ActivityItem {
  id: string;
  title: string;
  type: string;
  time: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface RecentPracticeProps {
  activities: ActivityItem[];
  notifications: NotificationItem[];
}

export function RecentPractice({ activities, notifications }: RecentPracticeProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity Log */}
      <Card className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white m-0">Recent Practice & Lessons</h3>
          <Badge variant="outline" className="text-slate-400">
            Activity Stream
          </Badge>
        </div>

        <div className="space-y-3">
          {activities.map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/30"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white m-0">{act.title}</h4>
                  <span className="text-xs text-slate-400">{act.type}</span>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">{act.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Notifications & System Updates */}
      <Card className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white m-0">Notifications & Alerts</h3>
          <Badge variant="info">System Updates</Badge>
        </div>

        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30 space-y-1"
            >
              <h4 className="text-sm font-semibold text-blue-400 m-0">{notif.title}</h4>
              <p className="text-xs text-slate-300 m-0 leading-relaxed">{notif.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
