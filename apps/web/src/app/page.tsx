'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LogoBadge } from '../shared/ui/logo/LogoBadge';
import {
  BookOpen,
  Award,
  Zap,
  Target,
  Sparkles,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  FileText,
  Users,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export default function HomePage() {
  const [selectedProgrammeTab, setSelectedProgrammeTab] = useState<
    'ALL' | 'IELTS' | 'TOEFL' | 'SAT' | 'CELPIP'
  >('ALL');

  // Quick Stats
  const STATS = [
    {
      label: 'Students Enrolled',
      value: '15,000+',
      sub: 'Candidates in 45+ Countries',
      icon: <Users size={22} color="#38bdf8" />,
    },
    {
      label: 'Mock Tests Completed',
      value: '85,000+',
      sub: 'Full-Length Timed Simulations',
      icon: <Award size={22} color="#a78bfa" />,
    },
    {
      label: 'Practice Questions',
      value: '25,000+',
      sub: 'Curated Bank with AI Feedback',
      icon: <FileText size={22} color="#34d399" />,
    },
    {
      label: 'Success Rate',
      value: '98.4%',
      sub: 'Target Band Score Achievement',
      icon: <TrendingUp size={22} color="#fbbf24" />,
    },
  ];

  // Programmes Data
  const PROGRAMMES = [
    {
      id: 'ielts-academic',
      cat: 'IELTS',
      title: 'IELTS Academic',
      desc: 'Comprehensive preparation for university admissions, medical licensing, and professional registration worldwide.',
      duration: '5 Weeks',
      modules: '24 Modules',
      target: 'Band 7.5 - 9.0',
      skills: ['Academic Reading', 'Audio Listening', 'Task 1 & 2 Writing', 'Speaking Masterclass'],
    },
    {
      id: 'ielts-general',
      cat: 'IELTS',
      title: 'IELTS General Training',
      desc: 'Tailored coaching for immigration, secondary education, work visas, and citizenship requirements.',
      duration: '5 Weeks',
      modules: '20 Modules',
      target: 'Band 7.0 - 8.5',
      skills: ['General Reading', 'Letter Writing Syntax', 'Audio Listening', 'Fluency Drills'],
    },
    {
      id: 'toefl-ibt',
      cat: 'TOEFL',
      title: 'TOEFL iBT Mastery',
      desc: 'Integrated test prep for US & international higher education institutions with real audio diagnostics.',
      duration: '5 Weeks',
      modules: '22 Modules',
      target: 'Score 100 - 120',
      skills: [
        'Integrated Speaking',
        'Keyboard Essay Eval',
        'Passage Diagnostics',
        'Note-Taking Strategy',
      ],
    },
    {
      id: 'sat-academic',
      cat: 'SAT',
      title: 'SAT Academic Prep',
      desc: 'Evidence-Based Reading, Writing, and Mathematics diagnostics for top global university entrance.',
      duration: '8 Weeks',
      modules: '28 Modules',
      target: 'Score 1400 - 1600',
      skills: ['Text Inferences', 'Advanced Algebra', 'Grammar Modifiers', 'Data Analysis'],
    },
    {
      id: 'celpip-general',
      cat: 'CELPIP',
      title: 'CELPIP General Coaching',
      desc: 'Specialized Canadian English Language Proficiency Index Program training for permanent residency.',
      duration: '5 Weeks',
      modules: '18 Modules',
      target: 'Level 9 - 12',
      skills: ['Canadian Accent Listening', 'Workplace Writing', 'Audio Response', 'Task Timing'],
    },
    {
      id: 'english-core',
      cat: 'ALL',
      title: 'English Proficiency Core',
      desc: 'Foundation & advanced grammar syntax, modifier logic, vocabulary expansion, and discourse cohesion.',
      duration: '8 Weeks',
      modules: '32 Modules',
      target: 'CEFR B2 - C2',
      skills: ['Modifier Syntax', 'Lexical Variety', 'Cohesive Devices', 'Spoken Naturalness'],
    },
  ];

  // Why Choose Clasptek Features
  const FEATURES = [
    {
      title: 'AI Learning Coach',
      desc: '24/7 intelligent tutor evaluating grammar modifiers, vocabulary syntax, and essay coherence with instant actionable feedback.',
      icon: <BrainCircuit size={24} color="#38bdf8" />,
    },
    {
      title: 'Personalized Study Plans',
      desc: 'Dynamic schedules automatically tailored to your baseline diagnostic gaps, target score, and exam deadline.',
      icon: <Target size={24} color="#34d399" />,
    },
    {
      title: 'Diagnostic Assessments',
      desc: 'Adaptive baseline proficiency testing pinpointing your exact skill profile and weakness areas in under 20 minutes.',
      icon: <Zap size={24} color="#fbbf24" />,
    },
    {
      title: 'Practice Question Bank',
      desc: '25,000+ curated items with step-by-step rationale explanations, official scoring rubrics, and difficulty sizing.',
      icon: <BookOpen size={24} color="#a78bfa" />,
    },
    {
      title: 'Mock Examinations',
      desc: 'Full-length timed test simulations replicating official test interface, countdown rules, and proctoring integrity.',
      icon: <Award size={24} color="#f87171" />,
    },
    {
      title: 'Performance Analytics',
      desc: 'Real-time readiness prediction algorithms mapping your score progression with 95% statistical confidence intervals.',
      icon: <BarChart3 size={24} color="#38bdf8" />,
    },
  ];

  const filteredProgrammes = PROGRAMMES.filter(
    (p) => selectedProgrammeTab === 'ALL' || p.cat === selectedProgrammeTab
  );

  return (
    <div
      style={{
        backgroundColor: '#090d16',
        color: '#f8fafc',
        fontFamily: 'Inter, sans-serif',
        width: '100%',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      {/* 1. STICKY ENTERPRISE NAVIGATION BAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(11, 15, 25, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.85rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <LogoBadge size="sm" />
            </div>
          </Link>

          <nav
            style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <a href="#hero" style={{ color: '#f8fafc', textDecoration: 'none' }}>
              Home
            </a>
            <a href="#programmes" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Programmes
            </a>
            <a href="#why-choose-clasptek" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              Why Choose Us
            </a>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/login"
            style={{
              color: '#cbd5e1',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>

          <Link href="/register">
            <button
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.55rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              <span>Start Assessment</span>
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section
        id="hero"
        style={{
          position: 'relative',
          padding: '5rem 2rem 4rem',
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Trust Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#60a5fa',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
          }}
        >
          <Sparkles size={14} color="#60a5fa" />
          <span>AI-POWERED PREPARATION FOR IELTS, TOEFL, SAT & CELPIP</span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
            margin: '0 0 1.25rem 0',
            color: '#ffffff',
          }}
        >
          Prepare Smarter. <span style={{ color: '#38bdf8' }}>Achieve Higher Scores.</span>
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#94a3b8',
            maxWidth: '740px',
            lineHeight: 1.6,
            margin: '0 0 2.5rem 0',
          }}
        >
          Master IELTS, TOEFL, SAT, CELPIP, and English Proficiency with AI-powered learning,
          personalized study plans, realistic mock examinations, and expert guidance.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '3rem',
          }}
        >
          <Link href="/register">
            <button
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
              }}
            >
              <span>Start Your Diagnostic Assessment</span>
              <ArrowRight size={18} />
            </button>
          </Link>

          <a href="#programmes">
            <button
              style={{
                backgroundColor: '#151d30',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <BookOpen size={18} color="#38bdf8" />
              <span>Explore Programmes</span>
            </button>
          </a>
        </div>

        {/* Quick Stats Grid */}
        <div
          style={{
            width: '100%',
            maxWidth: '1100px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            padding: '1.5rem',
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            marginTop: '1rem',
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#1f2937',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  padding: '0.65rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                {stat.icon}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PROGRAMMES SECTION */}
      <section
        id="programmes"
        style={{
          padding: '5rem 2rem',
          maxWidth: '1280px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#38bdf8',
              textTransform: 'uppercase',
            }}
          >
            CANONICAL TEST PREPARATION PATHWAYS
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.5rem 0 0.75rem' }}>
            Choose Your Examination Target
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Tailored learning pathways with diagnostic placement testing, adaptive modules, and
            full-length timed mock exams.
          </p>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'inline-flex',
              gap: '0.5rem',
              marginTop: '2rem',
              padding: '0.35rem',
              backgroundColor: '#111827',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              flexWrap: 'wrap',
            }}
          >
            {(['ALL', 'IELTS', 'TOEFL', 'SAT', 'CELPIP'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedProgrammeTab(tab)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: selectedProgrammeTab === tab ? '#2563eb' : 'transparent',
                  color: selectedProgrammeTab === tab ? '#ffffff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab === 'ALL' ? 'All Programmes' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Programmes Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredProgrammes.map((p) => (
            <div
              key={p.id}
              style={{
                backgroundColor: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa',
                    }}
                  >
                    {p.cat} • {p.duration}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                    Target: {p.target}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                  {p.desc}
                </p>

                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}
                >
                  {p.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.5rem',
                        backgroundColor: '#1f2937',
                        borderRadius: '4px',
                        color: '#cbd5e1',
                      }}
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              <Link href="/register" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#1f2937',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>Enroll in Pathway</span>
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHY CHOOSE CLASPTEK SECTION */}
      <section
        id="why-choose-clasptek"
        style={{
          padding: '5rem 2rem',
          maxWidth: '1280px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#34d399',
              textTransform: 'uppercase',
            }}
          >
            ENTERPRISE PREPARATION ARCHITECTURE
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.5rem 0 0.75rem' }}>
            Why Choose Clasptek Global
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Built with server-authoritative diagnostic engines, AI feedback, and official exam
            interfaces.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {FEATURES.map((feat, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PRIMARY REGISTRATION CTA SECTION */}
      <section
        id="register-cta"
        style={{
          padding: '5rem 2rem',
          maxWidth: '1100px',
          margin: '0 auto 4rem',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(15, 23, 42, 0.98))',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            borderRadius: '24px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            GET STARTED IN LESS THAN 2 MINUTES
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
              maxWidth: '800px',
            }}
          >
            Begin Your Diagnostic Assessment Today
          </h2>

          <p
            style={{
              color: '#cbd5e1',
              fontSize: '1.05rem',
              maxWidth: '650px',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Complete your quick profile setup, take the 45-minute placement assessment, and receive
            instant CEFR & Band predictions with a personalized study roadmap.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              justifyContent: 'center',
              fontSize: '0.85rem',
              color: '#94a3b8',
              margin: '0.5rem 0',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#34d399" /> Free Placement Diagnostic
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="#38bdf8" /> Instant Results & AI Plan
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} color="#a78bfa" /> Takes &lt; 2 Minutes
            </span>
          </div>

          <Link href="/register" style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
            <button
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem 2.5rem',
                fontSize: '1.1rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 12px 30px rgba(37, 99, 235, 0.45)',
              }}
            >
              <span>Register & Start Assessment Now</span>
              <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0b0f19',
          padding: '3rem 2rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <LogoBadge size="sm" />

            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                fontSize: '0.85rem',
                color: '#94a3b8',
              }}
            >
              <Link href="/register" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                Register
              </Link>
              <Link href="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                Sign In
              </Link>
              <Link href="/privacy" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                Privacy Policy
              </Link>
              <Link href="/terms" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                Terms of Service
              </Link>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              fontSize: '0.75rem',
              color: '#64748b',
            }}
          >
            <span>© {new Date().getFullYear()} Clasptek Global. All rights reserved.</span>
            <span>Server-Authoritative Diagnostic & Examination Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
