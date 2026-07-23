'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button, ClasptekLogo } from '../components/ui/ui-components';

export default function HomePage() {
  const academies = [
    {
      title: 'Technology & Innovation Academy',
      desc: 'Modern software engineering, cloud computing architectures, and database programming.',
      icon: '💻',
    },
    {
      title: 'Business & Management Academy',
      desc: 'Agile execution frameworks, strategic business metrics, and leadership operations.',
      icon: '📊',
    },
    {
      title: 'Career Development Academy',
      desc: 'Professional placement, recruitment diagnostics, resume building, and interview masterclass.',
      icon: '🚀',
    },
    {
      title: 'Global Exam Preparation Academy',
      desc: 'Mock tests, adaptive practices, and performance analytics for international standard exams.',
      icon: '🌍',
    },
  ];

  const features = [
    {
      title: 'AI-Powered Adaptive Practice',
      desc: 'Intelligent grammar modifiers and vocabulary questions tailored to your current competency level.',
    },
    {
      title: 'Official Mock Examinations',
      desc: 'Full-length timed testing environments replicating actual exam conditions (IELTS, TOEFL, SAT, CELPIP).',
    },
    {
      title: 'Automated AI Evaluation',
      desc: 'Instant writing band scoring and granular feedback on vocabulary, coherence, and grammar syntax.',
    },
    {
      title: 'Personalized Learning Coach',
      desc: '24/7 interactive chat agent mapping study recommendations and resolving curriculum queries.',
    },
    {
      title: 'Exam Readiness Analytics',
      desc: 'Real-time score prediction algorithms outlining your progress with 95% confidence intervals.',
    },
  ];

  return (
    <>
      {/* Navbar header */}
      <header
        className="shell-header"
        style={{ backgroundColor: 'var(--nav-bg)', borderBottom: '1px solid var(--card-border)' }}
      >
        <ClasptekLogo size="navbar" />
        <nav className="shell-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/about" className="nav-link">
            About
          </Link>
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
          <Link href="/help" className="nav-link">
            Help
          </Link>
          <Link href="/careers" className="nav-link">
            Careers
          </Link>
          <Link href="/login">
            <Button variant="secondary" style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}>
              Sign In
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero section */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--nav-bg), var(--background))',
          padding: '5rem 1.5rem',
          textAlign: 'center',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <ClasptekLogo size="large" />
        </div>
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            maxWidth: '800px',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Master Your Credentials & Global Assessments
        </h1>
        <p
          style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: 0 }}
        >
          Personalized AI coaching, adaptive mock exams, and real-time readiness analytics for
          IELTS, TOEFL, SAT, and CELPIP.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link href="/register">
            <Button>Register Account</Button>
          </Link>
          <Link href="/about">
            <Button variant="secondary">Explore Programmes</Button>
          </Link>
        </div>
      </section>

      <main
        style={{
          padding: '4rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '5rem',
        }}
      >
        {/* Core Academies Section */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
              Our Specialized Academies
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Choose your professional and academic growth path.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '2rem',
            }}
          >
            {academies.map((a, i) => (
              <Card
                key={i}
                title={
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{a.icon}</span> <span>{a.title}</span>
                  </span>
                }
              >
                <p
                  style={{
                    margin: 0,
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                  }}
                >
                  {a.desc}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* English Proficiency Section */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          <div>
            <span
              style={{
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Language Framework
            </span>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                margin: '0.5rem 0 1rem 0',
                lineHeight: 1.2,
              }}
            >
              English Proficiency Pathways
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              From base modifiers comprehension to complex academic essay structuring, our pathways
              cater to all learning levels:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    color: 'var(--accent)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  FOUNDATION
                </span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                    Basic Grammar & Sentence Logic
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Master core verbs, modifier syntax, and vocabulary descriptors.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(30, 87, 151, 0.1)',
                    color: 'var(--primary)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  INTERMEDIATE
                </span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                    Coherent Paragraph Structure
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Build solid arguments, cohesive link phrases, and listening clarity.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(237, 27, 35, 0.1)',
                    color: 'var(--error)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  ADVANCED
                </span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                    Comprehensive Exam Mastery
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Execute complex speaking tasks, full essays, and strict reading tests.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Card title="Placement Diagnostic Assessment">
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                margin: '0 0 1.5rem 0',
              }}
            >
              Unsure of your current English competency? Take our 20-minute adaptive placement
              assessment. Get instant visual score breakdowns and custom learning roadmap
              configurations.
            </p>
            <Link href="/register">
              <Button style={{ width: '100%' }}>Launch Placement Test</Button>
            </Link>
          </Card>
        </section>

        {/* Global Exam Preparation section */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
              Global Examination Support
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Strict alignment with official testing rubrics and timers.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <Card title="IELTS Academy">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Complete Academic & General preparation pathways, audio listening portals, and
                writing evaluations.
              </p>
            </Card>
            <Card title="TOEFL Core">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Speaking mic recordings, keyboard essay diagnostics, and interactive paragraph
                reading tools.
              </p>
            </Card>
            <Card title="SAT Prep">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Advanced vocabulary drills, text analysis passages, and logical grammar construction
                modules.
              </p>
            </Card>
            <Card title="CELPIP Hub">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Targeted vocabulary templates, speaking prompt players, and practice test
                simulations.
              </p>
            </Card>
          </div>
        </section>

        {/* Platform Features Grid */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
              Clasptek Platform Capabilities
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              AI-driven tools configured to accelerate student score gains.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            {features.map((feat, idx) => (
              <Card key={idx} title={feat.title}>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                  }}
                >
                  {feat.desc}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Why Choose Clasptek */}
        <section
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '3rem 2rem',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Why Choose Clasptek?</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Setting the benchmark for digital learning and test evaluation.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '2rem',
              fontSize: '0.9rem',
            }}
          >
            <div>
              <strong
                style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}
              >
                👨‍🏫 Expert Instructors
              </strong>
              <span style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Curriculum designed and reviewed by certified international exam examiners.
              </span>
            </div>
            <div>
              <strong
                style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}
              >
                🤖 AI-Assisted Preparation
              </strong>
              <span style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Immediate feedback loop on complex writing tasks, essays, and speaking metrics.
              </span>
            </div>
            <div>
              <strong
                style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}
              >
                📈 Measurable Success
              </strong>
              <span style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Averaging a 1.5 Band increase (IELTS equivalent) within the first 30 days of
                adaptive training.
              </span>
            </div>
            <div>
              <strong
                style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}
              >
                ⚡ Flexible Schedules
              </strong>
              <span style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Engage with lessons, tests, and notifications anytime from any responsive device.
              </span>
            </div>
          </div>
        </section>

        {/* Student Learning Journey */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>The Learning Journey</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Step-by-step experience mapping student success.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '2rem',
              textAlign: 'center',
              fontSize: '0.9rem',
            }}
          >
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>1️⃣</div>
              <strong>Register</strong>
              <p
                style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}
              >
                Create profile details and select programmes.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>2️⃣</div>
              <strong>Assess</strong>
              <p
                style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}
              >
                Take the baseline placement test.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>3️⃣</div>
              <strong>Practice</strong>
              <p
                style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}
              >
                Engage with daily adaptive study modules.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>4️⃣</div>
              <strong>Mock Exams</strong>
              <p
                style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}
              >
                Run strict timed exams simulations.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>5️⃣</div>
              <strong>Coaching & Reports</strong>
              <p
                style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}
              >
                Review AI feedback reports and readiness logs.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ textAlign: 'center', padding: '3rem 0' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
            Ready to Excel?
          </h2>
          <p
            style={{
              color: 'var(--text-muted)',
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
              fontSize: '1.1rem',
            }}
          >
            Unlock your full capability. Join thousands of candidates tracking and achieving their
            target band scores.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/register">
              <Button>Start Free Diagnostic</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Student Portal Login</Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: 'var(--card-bg)',
          borderTop: '1px solid var(--card-border)',
          padding: '4rem 1.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ClasptekLogo size="footer" />
            <p style={{ lineHeight: 1.6, margin: 0 }}>
              Official preparation portal providing diagnostic mock assessments and AI performance
              insights.
            </p>
          </div>
          <div>
            <h4
              style={{
                margin: '0 0 1rem 0',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            >
              Quick Resources
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/about" style={{ color: 'var(--text-muted)' }}>
                About Us
              </Link>
              <Link href="/careers" style={{ color: 'var(--text-muted)' }}>
                Careers
              </Link>
              <Link href="/help" style={{ color: 'var(--text-muted)' }}>
                Help Center & Guides
              </Link>
              <Link href="/contact" style={{ color: 'var(--text-muted)' }}>
                Contact Us
              </Link>
            </div>
          </div>
          <div>
            <h4
              style={{
                margin: '0 0 1rem 0',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            >
              Policies & Rules
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>
                Privacy Policy
              </Link>
              <Link href="/terms" style={{ color: 'var(--text-muted)' }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            borderTop: '1px solid var(--card-border)',
            paddingTop: '1.5rem',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0 }}>
            &copy; {new Date().getFullYear()} Clasptek Global. All rights reserved. Platform Version
            2.0.0-RC1.
          </p>
        </div>
      </footer>
    </>
  );
}
