'use client';

import React from 'react';
import { ProgrammeId } from '../models/programme-config';
import { ProgrammeRegistry } from '../models/programme-registry';
import { ChevronDown, Shield } from 'lucide-react';

import { PageContainer, PageContent } from '@/shared/ui/layout/PageContainer';

export interface DashboardLayoutProps {
  activeProgrammeId: ProgrammeId;
  programmeIds: ProgrammeId[];
  onSelectProgramme: (id: ProgrammeId) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeProgrammeId,
  programmeIds,
  onSelectProgramme,
  children,
}) => {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <PageContainer>
      <PageContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          {/* ── Page Header & Exam Track Switcher ── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border)',
            }}
            className="sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.25rem',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--brand-primary)',
                    backgroundColor: 'rgba(4, 94, 173, 0.08)',
                    border: '1px solid rgba(4, 94, 173, 0.25)',
                    padding: '0.125rem 0.625rem',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <Shield size={12} />
                  Candidate Workspace
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                <span
                  style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}
                >
                  {today}
                </span>
              </div>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                Student Dashboard
              </h1>
            </div>

            {/* Right: Programme Switcher */}
            {programmeIds && programmeIds.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  padding: '0.25rem',
                  borderRadius: '12px',
                }}
                className="self-start sm:self-auto"
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    paddingLeft: '0.5rem',
                  }}
                >
                  Track:
                </span>
                <div style={{ position: 'relative' }}>
                  <select
                    value={activeProgrammeId}
                    onChange={(e) => onSelectProgramme(e.target.value as ProgrammeId)}
                    style={{
                      appearance: 'none',
                      backgroundColor: 'var(--surface-0)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      borderRadius: '8px',
                      padding: '0.5rem 2rem 0.5rem 0.75rem',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {programmeIds.map((id) => {
                      const prog = ProgrammeRegistry.get(id);
                      return (
                        <option key={id} value={id}>
                          {prog.title}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown
                    size={14}
                    style={{
                      position: 'absolute',
                      right: '0.625rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Dashboard Content ── */}
          {children}
        </div>
      </PageContent>
    </PageContainer>
  );
};
