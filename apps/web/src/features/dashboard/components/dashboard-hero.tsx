import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../shared/ui/card/Card';
import { Button } from '../../../shared/ui/button/Button';
import { Badge } from '../../../shared/ui/badge/Badge';

export interface DashboardHeroProps {
  studentName: string;
  programmeName: string;
  currentModule: string;
  learningProgress: number;
  targetScore: number;
  daysRemaining?: number;
}

export function DashboardHero({
  studentName,
  programmeName,
  currentModule,
  learningProgress,
  targetScore,
  daysRemaining = 95,
}: DashboardHeroProps) {
  const router = useRouter();

  return (
    <Card className="relative overflow-hidden bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 p-6 md:p-8 rounded-2xl shadow-xl">
      {/* Subtle decorative radial light blur overlay */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Left Column: Greeting & Programme Meta */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="primary"
              className="bg-blue-500/20 text-blue-300 border-blue-400/30 px-3 py-1"
            >
              Active Enrolment
            </Badge>
            <Badge variant="outline" className="text-slate-300 border-slate-700">
              {daysRemaining} Days to Target Exam
            </Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {studentName} 👋
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Enrolled in <strong className="text-blue-400 font-semibold">{programmeName}</strong> •
            Current Module: <strong className="text-white font-semibold">{currentModule}</strong>
          </p>

          {/* Progress bar indicator */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Overall Course Completion</span>
              <span className="text-blue-400 font-bold">{learningProgress}%</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
              <div
                className="bg-linear-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, learningProgress))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Key Target Band Pill & Primary CTAs */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-4 w-full lg:w-auto">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Target Score
            </span>
            <span className="text-lg font-bold text-emerald-400 bg-emerald-500/10 px-3 py-0.5 rounded-lg border border-emerald-500/30">
              Band {targetScore}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/learning')}
              className="flex-1 sm:flex-initial shadow-lg shadow-blue-500/20"
            >
              Continue Learning
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => router.push('/practice')}
              className="flex-1 sm:flex-initial"
            >
              Resume Practice
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
