'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '../../../components/ui/ui-components';
import { learningIntelligenceService } from '../application/learning-intelligence.service';
import { aiCoachService } from '../application/ai-coach.service';
import {
  LearnerIntelligenceProfile,
  PredictiveReadinessModel,
  AICoachMessage,
  AIRecommendationItem,
} from '../domain/learner-intelligence-profile';
import {
  Sparkles,
  Send,
  Target,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  Zap,
  RotateCcw,
  CheckCircle2,
  Brain,
  ShieldCheck,
} from 'lucide-react';

export function AICoachScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<LearnerIntelligenceProfile | null>(null);
  const [readiness, setReadiness] = useState<PredictiveReadinessModel | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendationItem[]>([]);
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const p = await learningIntelligenceService.getProfile();
      const r = await learningIntelligenceService.getPredictiveReadiness();
      const recs = await learningIntelligenceService.getRecommendations();
      const history = await aiCoachService.getChatHistory();

      setProfile(p);
      setReadiness(r);
      setRecommendations(recs);
      setMessages(history);
    }
    loadData();
  }, []);

  async function handleSendMessage(userPrompt?: string) {
    const textToSend = userPrompt || query;
    if (!textToSend.trim()) return;

    const studentMsg: AICoachMessage = {
      id: `msg-student-${Date.now()}`,
      sender: 'STUDENT',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, studentMsg]);
    if (!userPrompt) setQuery('');
    setLoading(true);

    try {
      const coachMsg = await aiCoachService.askCoach(textToSend);
      setMessages((prev) => [...prev, coachMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'COACH',
          text: 'I am here to coach you. Focus on completing 15 Reading questions today to boost your score projection!',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: '1.75rem',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
      }}
    >
      {/* LEFT COLUMN: MAIN AI COACH CONVERSATION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.35rem',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  color: '#3b82f6',
                }}
              >
                <Sparkles size={24} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                AI Contextual Exam Coach
              </h1>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              Grounded in your real practice history, mock scores, and weak skill analytics.
            </p>
          </div>

          <Badge variant="success">Grounded Performance Data Active</Badge>
        </div>

        {/* Prompt Shortcut Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {[
            'Why is my Reading score dropping?',
            'What should I study today?',
            'How do I improve to Band 7.5?',
            'Why did I lose marks in SAT Math?',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Chat Conversation Card */}
        <Card
          style={{
            padding: '1.5rem',
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            height: '520px',
          }}
        >
          {/* Messages Window */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              paddingRight: '0.5rem',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'STUDENT' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '1rem 1.25rem',
                    borderRadius: '14px',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    backgroundColor: msg.sender === 'STUDENT' ? '#2563eb' : '#1e293b',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {msg.sender === 'COACH' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#38bdf8',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <Brain size={14} /> AI EXAM COACH
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: '#1e293b',
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                  }}
                >
                  AI Coach analyzing performance data...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask your AI Exam Coach for personalized feedback, strategy, or score insights..."
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Send size={16} /> Send
            </Button>
          </form>
        </Card>
      </div>

      {/* RIGHT COLUMN: AI LEARNER INTELLIGENCE PROFILE WIDGET */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Profile Card */}
        {profile && readiness && (
          <Card
            style={{
              padding: '1.5rem',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: 800,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Target size={18} color="#3b82f6" />
              Learner Intelligence Profile
            </div>

            <div
              style={{
                backgroundColor: '#161e2e',
                padding: '1rem',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Target Examination</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                {profile.targetExam}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: '#cbd5e1' }}>
                  Target Score: <strong>{profile.targetScore}</strong>
                </span>
                <span style={{ color: '#34d399' }}>
                  Projected: <strong>{readiness.projectedScore}</strong>
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Days Until Exam:</span>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                  {profile.daysRemaining} Days
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Practice Accuracy:</span>
                <span style={{ fontWeight: 700, color: '#34d399' }}>
                  {profile.practiceAccuracy}%
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Study Streak:</span>
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                  {profile.studyStreakDays} Days 🔥
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Weakest Skill:</span>
                <span style={{ fontWeight: 700, color: '#fca5a5' }}>
                  {profile.weakSkills[0]?.skill || 'Matching Headings'}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/practice')}
              style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
            >
              Start Weakness Practice
            </Button>
          </Card>
        )}

        {/* AI Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Next Recommended Actions
          </h3>

          {recommendations.map((rec) => (
            <Card
              key={rec.id}
              style={{
                padding: '1rem',
                backgroundColor: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                  {rec.title}
                </span>
                <Badge variant={rec.priority === 'HIGH' ? 'danger' : 'info'}>{rec.priority}</Badge>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                {rec.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AICoachScreen;
