'use client';

import React from 'react';
import { ProgrammeId } from '../models/programme-config';
import { ProgrammeRegistry } from '../models/programme-registry';
import { ChevronDown, Sparkles } from 'lucide-react';
import { BrandConfig } from '@/config/brand.config';

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
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        paddingBottom: '4rem',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Academic Header Bar & Course Switcher */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          backgroundColor: 'rgba(17, 24, 39, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Academic Workspace
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              Student Portal
            </div>
          </div>
        </div>

        {/* Programme Switcher Selector — Hidden if enrolled in 1 programme; enabled only for multiple enrolments */}
        {programmeIds && programmeIds.length > 1 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>Active Programme:</span>
            <div style={{ position: 'relative' }}>
              <select
                value={activeProgrammeId}
                onChange={(e) => onSelectProgramme(e.target.value as ProgrammeId)}
                style={{
                  appearance: 'none',
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '0.5rem 2.25rem 0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {programmeIds.map((id) => {
                  const prog = ProgrammeRegistry.get(id);
                  return (
                    <option key={id} value={id} style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
                      {prog.title}
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                size={16}
                color="#94a3b8"
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.4rem 0.85rem', borderRadius: '8px' }}>
            Programme: <strong style={{ color: '#3b82f6' }}>{ProgrammeRegistry.get(activeProgrammeId)?.title || 'IELTS Academic Preparation'}</strong>
          </div>
        )}
      </div>

      {/* Main Composite Widgets Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {children}
      </div>
    </div>
  );
};
