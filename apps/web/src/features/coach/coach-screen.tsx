'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../components/ui/ui-components';
import { studentCoachService, CoachChatMessage } from '../../services/student/coach.service';

export function CoachScreen() {
  const [messages, setMessages] = useState<CoachChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const msgs = await studentCoachService.getChatHistory();
        setMessages(msgs);
        setHistory(['Session 1: Introduction', 'Session 2: Readiness check-in', 'Session 3: Practice goals analysis']);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  async function handleSend() {
    if (!inputMsg.trim()) return;
    const studentMessage: CoachChatMessage = {
      id: Math.random().toString(),
      sender: 'STUDENT',
      content: inputMsg,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, studentMessage]);
    setInputMsg('');

    try {
      const coachResponse = await studentCoachService.sendMessage(inputMsg);
      setMessages(prev => [...prev, coachResponse]);
    } catch (e) {
      console.error(e);
    }
  }

  async function triggerPlanGen() {
    setGenerating(true);
    try {
      const res = await studentCoachService.triggerPlanGeneration();
      if (res.success) {
        showBanner(res.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }

  function showBanner(msg: string) {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  }

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: '80vh', boxSizing: 'border-box' }}>
      {/* Sidebar conversation history */}
      <div style={{ width: '260px', borderRight: '1px solid #232e48', paddingRight: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>History Logs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
          {history.map((h, i) => (
            <div key={i} style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#151d30', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid #232e48' }}>
              {h}
            </div>
          ))}
        </div>
        <Card title="Motivation Card">
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
            &ldquo;Consistency beats intensity. 15 minutes of grammar review keeps the streak alive!&rdquo;
          </p>
        </Card>
      </div>

      {/* Main chat window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {banner && (
          <div style={{ padding: '1rem', backgroundColor: '#10b98120', border: '1px solid #10b98140', borderRadius: '8px', color: '#10b981', fontSize: '0.85rem' }}>
            {banner}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>AI Coach Conversation</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Session Active (GPT-4o Engine)</p>
          </div>
          <Button onClick={triggerPlanGen} disabled={generating}>
            {generating ? 'Generating Plan...' : 'Generate Study Plan'}
          </Button>
        </div>

        {/* Message stream */}
        <div style={{ flex: 1, border: '1px solid #232e48', borderRadius: '12px', padding: '1rem', backgroundColor: '#0b0f19', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {messages.map((m, i) => {
            const isCoach = m.sender === 'COACH';
            return (
              <div
                key={i}
                style={{
                  alignSelf: isCoach ? 'flex-start' : 'flex-end',
                  maxWidth: '70%',
                  backgroundColor: isCoach ? '#151d30' : '#2563eb',
                  border: isCoach ? '1px solid #232e48' : 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem'
                }}
              >
                <div style={{ fontSize: '0.7rem', color: isCoach ? '#94a3b8' : '#93c5fd', marginBottom: '0.25rem' }}>
                  {isCoach ? 'AI Coach' : 'You'}
                </div>
                <div>{m.content}</div>
              </div>
            );
          })}
        </div>

        {/* Input box */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Ask the AI coach regarding your study goals or mock assessments..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  );
}
export default CoachScreen;
