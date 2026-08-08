'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Play, Clock, ArrowRight, Zap, Target } from 'lucide-react';

interface LearningModule {
  id: string;
  title: string;
  category: string;
  durationMins: number;
  progress: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
}

interface StudentLearningData {
  studentName: string;
  enrolledProgramme: string;
  recommendedPathway: string;
  cefrLevel: string;
  overallScore: number;
  studyDuration: string;
  completedPercentage: number;
  nextLesson: {
    id: string;
    title: string;
    category: string;
    estimatedMins: number;
  };
  learningModules: LearningModule[];
}

export default function StudentLearningDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentLearningData | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [res, profRes] = await Promise.all([
          fetch('/api/v1/assessment/result').catch(() => null),
          fetch('/api/v1/student/profile').catch(() => null),
        ]);

        const resData = res ? await res.json().catch(() => ({})) : {};
        const profData = profRes ? await profRes.json().catch(() => ({})) : {};

        let progName = 'English Proficiency Core Foundation';
        let cefr = 'B1';
        let score = 65;
        let duration = '5 Weeks';

        if (resData.recommendedNextStep) {
          progName = resData.recommendedNextStep;
          cefr = resData.cefrLevel || 'B1';
          score = resData.overallScore || 65;
          duration = resData.recommendedDuration || '5 Weeks';
        }

        const studentName = profData.name || 'Candidate';

        setData({
          studentName,
          enrolledProgramme: progName,
          recommendedPathway: `${progName} (${duration})`,
          cefrLevel: cefr,
          overallScore: score,
          studyDuration: duration,
          completedPercentage: 15,
          nextLesson: {
            id: 'lesson-1',
            title: 'Grammar Modifier Syntax & Structural Inferences',
            category: 'Grammar & Syntax',
            estimatedMins: 20,
          },
          learningModules: [
            {
              id: 'mod-1',
              title: 'Grammar Modifier Syntax & Foundations',
              category: 'Grammar',
              durationMins: 45,
              progress: 40,
              status: 'IN_PROGRESS',
            },
            {
              id: 'mod-2',
              title: 'Academic Reading Passage Speed & Inferences',
              category: 'Reading',
              durationMins: 60,
              progress: 10,
              status: 'IN_PROGRESS',
            },
            {
              id: 'mod-3',
              title: 'Audio Listening & Accent Comprehension',
              category: 'Listening',
              durationMins: 40,
              progress: 0,
              status: 'LOCKED',
            },
            {
              id: 'mod-4',
              title: 'Writing Task 1 & Task 2 Essay Cohesion',
              category: 'Writing',
              durationMins: 90,
              progress: 0,
              status: 'LOCKED',
            },
          ],
        });
      } catch (err) {
        console.error('Failed to load learning dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-300">
            Loading Student Learning Dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-6 p-6 md:p-8 text-white space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-sky-900/40 via-slate-900 to-purple-900/30 border border-sky-500/20 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-md text-[10px] font-bold uppercase tracking-wider">
              Enrolled Pathway
            </span>
            <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md text-[10px] font-bold font-mono">
              CEFR {data?.cefrLevel}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            {data?.enrolledProgramme}
          </h1>
          <p className="text-xs text-slate-300">
            Assigned study timeline: <strong className="text-sky-400">{data?.studyDuration}</strong>{' '}
            • Baseline proficiency score:{' '}
            <strong className="text-emerald-400">{data?.overallScore}%</strong>
          </p>
        </div>

        <Link
          href="/student/assessments/player?examType=English%20Proficiency"
          className="px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center space-x-2.5 shadow-lg shadow-sky-500/20 shrink-0"
        >
          <Play size={16} className="fill-slate-950" />
          <span>Resume Learning →</span>
        </Link>
      </div>

      {/* Grid: Next Lesson & Progress Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Lesson Card */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Zap size={14} />
              <span>Next Recommended Activity</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
              <Clock size={12} />
              <span>{data?.nextLesson.estimatedMins} Mins</span>
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">{data?.nextLesson.title}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Target competency drill addressing diagnostic grammar syntax gaps.
            </p>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-slate-800/80">
            <span className="text-xs text-slate-300 font-medium">
              Category: {data?.nextLesson.category}
            </span>
            <Link
              href="/student/assessments"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1"
            >
              <span>Start Activity</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Overall Progress Tracker Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Target size={14} />
              <span>Pathway Progress</span>
            </span>
            <div className="text-3xl font-black text-white mt-1">{data?.completedPercentage}%</div>
            <div className="text-xs text-slate-400">Target Completion: {data?.studyDuration}</div>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${data?.completedPercentage}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 text-right font-mono">
              1 of 4 Modules Active
            </div>
          </div>
        </div>
      </div>

      {/* Learning Modules Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <BookOpen size={18} className="text-sky-400" />
            <span>Assigned Curriculum Modules ({data?.learningModules.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.learningModules.map((mod) => (
            <div
              key={mod.id}
              className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="px-2 py-0.5 bg-slate-800 text-sky-400 rounded text-[10px] font-bold">
                    {mod.category}
                  </span>
                  <span
                    className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                      mod.status === 'IN_PROGRESS'
                        ? 'bg-sky-500/20 text-sky-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {mod.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white">{mod.title}</h3>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Module Progress</span>
                  <span className="font-mono text-sky-400 font-bold">{mod.progress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-sky-500 h-full rounded-full"
                    style={{ width: `${mod.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Grid: Practice Sessions & Mock Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Practice Question Bank
            </span>
            <h3 className="text-lg font-bold text-white">Targeted Practice Sessions</h3>
            <p className="text-xs text-slate-400">25,000+ items with AI rationale hints.</p>
          </div>
          <Link
            href="/student/assessments"
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0"
          >
            Launch Practice →
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Official Simulations
            </span>
            <h3 className="text-lg font-bold text-white">Full-Length Mock Examinations</h3>
            <p className="text-xs text-slate-400">Timed proctored exam conditions.</p>
          </div>
          <Link
            href="/student/assessments"
            className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
          >
            Take Mock Exam →
          </Link>
        </div>
      </div>
    </div>
  );
}
