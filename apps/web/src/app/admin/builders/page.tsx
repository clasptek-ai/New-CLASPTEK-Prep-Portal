'use client';

import React from 'react';
import Link from 'next/link';
import { PageContainer, PageHeader, PageContent } from '@/shared/ui/layout/PageContainer';
import { Card, Badge, Button } from '@/components/ui/ui-components';
import {
  ClipboardCheck,
  BookOpen,
  Zap,
  FileText,
  ArrowRight,
  Hammer,
  Layers,
  Sparkles,
} from 'lucide-react';

interface BuilderCardItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  accent: string;
  features: string[];
}

const BUILDERS: BuilderCardItem[] = [
  {
    id: 'assessment-builder',
    title: 'Assessment Builder',
    badge: 'Baseline & Diagnostic',
    description:
      'Blueprint-driven allocation and rubric calibration engine for diagnostic tests and skill baselines.',
    href: '/admin/builders/assessment',
    icon: <ClipboardCheck size={24} />,
    accent: 'var(--brand)',
    features: ['Blueprint allocation', 'Skill diagnostic matrix', 'Rubric calibration'],
  },
  {
    id: 'mock-builder',
    title: 'Mock Exam Builder',
    badge: 'Official Timed Simulation',
    description:
      'Multi-section exam compiler with strict module timing, section-boundary enforcement, and question-bank pool quotas.',
    href: '/admin/builders/mock',
    icon: <BookOpen size={24} />,
    accent: '#38bdf8',
    features: ['IELTS Academic / General', 'Multi-section sequencing', 'Timing & break controls'],
  },
  {
    id: 'practice-builder',
    title: 'Practice Builder',
    badge: 'Adaptive & Drill Sets',
    description:
      'Modular question set assembler with skill-weighting, difficulty tiers, and instant explanation bindings.',
    href: '/admin/builders/practice',
    icon: <Zap size={24} />,
    accent: '#f59e0b',
    features: ['Adaptive difficulty', 'Targeted question pools', 'Instant remediation'],
  },
  {
    id: 'passage-builder',
    title: 'Passage Builder',
    badge: 'Reading & Contextual Assets',
    description:
      'Academic passage composer with paragraph anchoring, word counts, and multi-question reference mapping.',
    href: '/admin/builders/passage',
    icon: <FileText size={24} />,
    accent: '#10b981',
    features: ['Paragraph indexing', 'Lexical difficulty metrics', 'Linked item groups'],
  },
];

export default function AdminBuildersHubPage() {
  return (
    <PageContainer>
      <PageHeader
        badge={
          <Badge variant="primary">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Hammer size={12} /> Authoring Suite
            </span>
          </Badge>
        }
        title="Authoring & Assessment Builders"
        description="Comprehensive interactive blueprint authoring engines for Mock Exams, Diagnostics, Adaptive Practice, and Contextual Passages."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/admin/question-bank">
              <Button
                variant="secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Layers size={15} /> Question Bank
              </Button>
            </Link>
            <Link href="/admin/assessments">
              <Button
                variant="primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Sparkles size={15} /> View Published Exams
              </Button>
            </Link>
          </div>
        }
      />

      <PageContent>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {BUILDERS.map((builder) => (
            <Card
              key={builder.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderRadius: '16px',
                backgroundColor: 'var(--surface-0)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-surface)',
                transition: 'all 200ms ease',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      color: builder.accent,
                    }}
                  >
                    {builder.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {builder.badge}
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  {builder.title}
                </h2>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    margin: '0 0 1.25rem 0',
                  }}
                >
                  {builder.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    marginBottom: '1.5rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  {builder.features.map((feat, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: builder.accent,
                        }}
                      />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              <Link href={builder.href} style={{ textDecoration: 'none' }}>
                <Button
                  variant="secondary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: 700,
                  }}
                >
                  Launch Builder <ArrowRight size={15} />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
}
