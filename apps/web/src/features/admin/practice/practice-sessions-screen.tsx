'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../../components/ui/ui-components';

interface DbPracticeSession {
  id: string;
  studentId: string;
  studentEmail: string;
  exam: string;
  section: string;
  skill: string;
  status: string;
  totalQuestions: number;
  accuracy: number;
  durationSeconds: number;
  createdAt: string;
  completedAt?: string;
}

export function PracticeSessionsScreen() {
  const [sessions, setSessions] = useState<DbPracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterExam, setFilterExam] = useState<string>('ALL');

  useEffect(() => {
    async function loadAdminSessions() {
      setLoading(true);
      try {
        const url = filterExam !== 'ALL'
          ? `/api/v1/admin/practice/sessions?exam=${encodeURIComponent(filterExam)}`
          : '/api/v1/admin/practice/sessions';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && Array.isArray(data.sessions)) {
          setSessions(data.sessions);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadAdminSessions();
  }, [filterExam]);

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400 font-bold text-lg">
              📚
            </span>
            <h1 className="text-2xl font-extrabold text-white">Admin Practice Sessions Monitor</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time inspection of candidate practice sessions, accuracy rates, and question bank snapshots.
          </p>
        </div>

        {/* Exam Filter Selector */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold px-2">Filter Exam:</span>
          <select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Programmes</option>
            <option value="English Proficiency">English Proficiency</option>
            <option value="IELTS Academic">IELTS Academic</option>
            <option value="IELTS General Training">IELTS General Training</option>
            <option value="TOEFL iBT">TOEFL iBT</option>
            <option value="SAT">Digital SAT</option>
            <option value="CELPIP">CELPIP</option>
          </select>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Total DB Sessions</div>
          <div className="text-2xl font-black text-white mt-1">{sessions.length}</div>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Active Sessions</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {sessions.filter((s) => s.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Completed Sessions</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {sessions.filter((s) => s.status === 'COMPLETED').length}
          </div>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Avg Accuracy</div>
          <div className="text-2xl font-black text-sky-400 mt-1">
            {sessions.length > 0
              ? `${Math.round(sessions.reduce((a, b) => a + b.accuracy, 0) / sessions.length)}%`
              : '0%'}
          </div>
        </div>
      </div>

      {/* Candidate Sessions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-200">Candidate Practice Sessions</h2>
          <span className="text-xs font-mono text-slate-400">Live DB Stream</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading DB Sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-2xl">📭</div>
            <div className="text-sm font-bold text-white">No Practice Sessions Found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Candidate practice sessions will appear here as students complete targeted practice drills.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono">
                <tr>
                  <th className="p-3.5">Candidate Email</th>
                  <th className="p-3.5">Exam Product</th>
                  <th className="p-3.5">Section / Skill</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Accuracy</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Started At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-semibold text-white">{s.studentEmail}</td>
                    <td className="p-3.5">{s.exam}</td>
                    <td className="p-3.5">
                      <span className="text-sky-400 font-medium">{s.section}</span> / {s.skill}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white">{s.accuracy}%</td>
                    <td className="p-3.5 font-mono">{s.durationSeconds}s</td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PracticeSessionsScreen;
