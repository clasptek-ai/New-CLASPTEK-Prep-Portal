'use client';

import React from 'react';
import { ProgrammeId } from '../models/programme-config';
import { ProgrammeRegistry } from '../models/programme-registry';
import { ChevronDown } from 'lucide-react';

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
  const activeProg = ProgrammeRegistry.get(activeProgrammeId);
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        paddingBottom: '2rem',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Left: Page title */}
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
            }}
          >
            My Dashboard
          </h1>
          <p
            style={{
              margin: '0.2rem 0 0',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
            }}
          >
            {today}
          </p>
        </div>

        {/* Right: Programme switcher (only shown when enrolled in multiple) */}
        {programmeIds && programmeIds.length > 1 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              Programme:
            </span>
            <div style={{ position: 'relative' }}>
              <select
                value={activeProgrammeId}
                onChange={(e) => onSelectProgramme(e.target.value as ProgrammeId)}
                style={{
                  appearance: 'none',
                  backgroundColor: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.45rem 2.25rem 0.45rem 0.875rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                {programmeIds.map((id) => {
                  const prog = ProgrammeRegistry.get(id);
                  return (
                    <option key={id} value={id} style={{ backgroundColor: 'var(--surface-1)' }}>
                      {prog.title}
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
          </div>
        ) : (
          /* Single programme: just show programme name badge */
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.35rem 0.75rem',
            }}
          >
            {activeProg?.title ?? 'Programme'}
          </span>
        )}
      </div>

      {/* ── Widget Grid ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {children}
      </div>
    </div>
  );
};
