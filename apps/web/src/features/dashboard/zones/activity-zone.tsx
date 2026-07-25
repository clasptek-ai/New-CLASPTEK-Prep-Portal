import React from 'react';
import { Activity, Trophy, Bell, CheckCircle, Star, Zap } from 'lucide-react';
import { EmptyZone } from '../../../shared/ui/academic/empty-zone';

export interface ActivityZoneProps {
  notificationsCount?: number;
}

export const ActivityZone: React.FC<ActivityZoneProps> = ({ notificationsCount = 3 }) => {
  const activities = [
    {
      id: 'act-1',
      title: 'Completed IELTS Academic Writing Task 2 Drill',
      time: '2 hours ago',
      icon: CheckCircle,
      color: '#10b981',
    },
    {
      id: 'act-2',
      title: 'Achieved 8.5 Band in Reading Passage 3',
      time: 'Yesterday',
      icon: Star,
      color: '#f59e0b',
    },
    {
      id: 'act-3',
      title: 'Maintained 14-Day Consecutive Study Streak',
      time: '2 days ago',
      icon: Zap,
      color: '#3b82f6',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {/* Activity Timeline Card */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          backgroundColor: 'rgba(17, 24, 39, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Activity size={18} color="#3b82f6" />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
            Recent Activity Feed
          </h4>
        </div>

        {activities.length === 0 ? (
          <EmptyZone
            title="No Recent Activity"
            description="Start a practice drill to track your learning journey."
            height="140px"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {activities.map((act) => {
              const IconComponent = act.icon;
              return (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: `${act.color}20`,
                      color: act.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '2px',
                    }}
                  >
                    <IconComponent size={15} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        color: '#e2e8f0',
                        lineHeight: 1.3,
                      }}
                    >
                      {act.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                      {act.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achievement Showcase Card */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          backgroundColor: 'rgba(17, 24, 39, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Trophy size={18} color="#f59e0b" />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Milestone Achievements
            </h4>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>3 Unlocked</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              padding: '0.85rem 0.5rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Trophy size={20} color="#f59e0b" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
              Band 8 Master
            </span>
          </div>

          <div
            style={{
              padding: '0.85rem 0.5rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Zap size={20} color="#3b82f6" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
              14-Day Streak
            </span>
          </div>

          <div
            style={{
              padding: '0.85rem 0.5rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Star size={20} color="#10b981" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
              Top 5% Drill
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
