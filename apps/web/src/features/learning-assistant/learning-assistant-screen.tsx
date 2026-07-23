'use client';

import React, { useState } from 'react';
import { Card } from '../../shared/ui/card/Card';
import { Button } from '../../shared/ui/button/Button';
import { Badge } from '../../shared/ui/badge/Badge';

export function LearningAssistantScreen() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: 'Hello! I am your Clasptek AI Academic Assistant. How can I help with your IELTS or TOEFL preparation today?',
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setQuery('');

    // Simulated AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Here is guidance for your query: "${userText}". To improve your score, focus on sentence variety, cohesion devices, and precise vocabulary.`,
        },
      ]);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white m-0">AI Learning Assistant</h1>
          <p className="text-xs text-slate-400 m-0 mt-1">
            24/7 Academic guidance, essay feedback, and grammar assistance
          </p>
        </div>
        <Badge variant="primary" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
          AI Online
        </Badge>
      </div>

      <Card className="p-6 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[500px]">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3.5 rounded-xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input prompt */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-3 pt-4 border-t border-slate-800 mt-4"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your exam or request essay evaluation..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <Button type="submit" variant="primary" size="md">
            Send Prompt
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default LearningAssistantScreen;
