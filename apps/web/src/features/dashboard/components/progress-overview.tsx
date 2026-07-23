import React from 'react';
import { Card } from '../../../shared/ui/card/Card';
import { Badge } from '../../../shared/ui/badge/Badge';

export interface ProgressOverviewStats {
  learningProgress: number;
  practiceAccuracy: number;
  mockAverage: number;
  readinessScore: number;
  estimatedWeeksLeft?: number;
  targetScore?: number;
}

export interface ProgressOverviewProps {
  stats: ProgressOverviewStats;
}

export function ProgressOverview({ stats }: ProgressOverviewProps) {
  const cards = [
    {
      title: 'Learning Progress',
      value: `${stats.learningProgress}%`,
      subtitle: `Est. ${stats.estimatedWeeksLeft ?? 4} weeks remaining`,
      badgeText: 'On Track',
      badgeVariant: 'success' as const,
      icon: (
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      progressColor: 'bg-blue-500',
      percentage: stats.learningProgress,
    },
    {
      title: 'Practice Accuracy',
      value: `${stats.practiceAccuracy}%`,
      subtitle: 'Based on last 50 questions',
      badgeText: 'Steady',
      badgeVariant: 'success' as const,
      icon: (
        <svg
          className="w-5 h-5 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      progressColor: 'bg-emerald-500',
      percentage: stats.practiceAccuracy,
    },
    {
      title: 'Mock Average',
      value: `${stats.mockAverage}%`,
      subtitle: `Target: ${stats.targetScore ?? 75}%`,
      badgeText: '+4% vs Last Month',
      badgeVariant: 'primary' as const,
      icon: (
        <svg
          className="w-5 h-5 text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      progressColor: 'bg-indigo-500',
      percentage: stats.mockAverage,
    },
    {
      title: 'Readiness Score',
      value: `${stats.readinessScore}%`,
      subtitle: 'Predicted Exam Mastery',
      badgeText: 'Low Risk',
      badgeVariant: 'info' as const,
      icon: (
        <svg
          className="w-5 h-5 text-cyan-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      progressColor: 'bg-cyan-500',
      percentage: stats.readinessScore,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, idx) => (
        <Card
          key={idx}
          className="p-5 bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 rounded-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {card.title}
            </span>
            <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/50">
              {card.icon}
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-2 pt-1">
            <span className="text-3xl font-black text-white tracking-tight">{card.value}</span>
            <Badge variant={card.badgeVariant} className="text-xs">
              {card.badgeText}
            </Badge>
          </div>

          <p className="text-xs text-slate-400">{card.subtitle}</p>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${card.progressColor}`}
              style={{ width: `${Math.min(100, Math.max(0, card.percentage))}%` }}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
