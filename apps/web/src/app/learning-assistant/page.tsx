'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function LearningAssistantPage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(56, 189, 248, 0.2))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <Sparkles size={36} color="#8b5cf6" />
      </div>

      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
          background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        AI Learning Coach
      </h1>

      <p
        style={{
          fontSize: '1rem',
          color: '#94a3b8',
          maxWidth: '440px',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}
      >
        Your personalized AI-powered learning assistant is coming soon.
        Complete your diagnostic assessment first to unlock tailored coaching.
      </p>

      <button
        onClick={() => router.push('/dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '10px',
          color: '#a78bfa',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
    </div>
  );
}
