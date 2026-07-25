import React from 'react';
import { ProgrammeId, ProgrammeConfiguration } from '../models/programme-config';
import { ProgressRing } from '../../../shared/ui/academic/progress-ring';
import { PlayCircle, Award, CheckCircle2 } from 'lucide-react';

export interface LearningZoneProps {
  activeProgrammeId: ProgrammeId;
  config: ProgrammeConfiguration;
  programmeIds: ProgrammeId[];
  onSelectProgramme: (id: ProgrammeId) => void;
}

export const LearningZone: React.FC<LearningZoneProps> = ({
  activeProgrammeId,
  config,
  programmeIds,
  onSelectProgramme,
}) => {
  return (
    <div
      style={{
        padding: '1.75rem',
        borderRadius: '16px',
        backgroundColor: 'rgba(17, 24, 39, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Header & Programme Switcher Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '1rem',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
            Academic Programme & Skills Overview
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Select an active exam trajectory to inspect skill diagnostic breakdowns
          </p>
        </div>

        {/* Dynamic Programme Switcher */}
        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            padding: '0.25rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {programmeIds.map((pid) => {
            const isActive = pid === activeProgrammeId;
            return (
              <button
                key={pid}
                onClick={() => onSelectProgramme(pid)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? config.colorPalette.primary : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {pid}
              </button>
            );
          })}
        </div>
      </div>

      {/* Radial Ring & Skill Breakdown Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center',
        }}
      >
        {/* Animated Radial Score Ring */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            borderRadius: '14px',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <ProgressRing
            score={Number(config.targetMetric.current)}
            maxScore={Number(config.targetMetric.target)}
            label={config.targetMetric.label}
            targetText={`Target: ${config.targetMetric.target}`}
            strokeColor={config.colorPalette.ringColor}
            size={170}
          />
        </div>

        {/* Skill Bars List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
            Sectional Competency Diagnostic
          </h4>

          {config.skills.map((skill) => {
            const percent = Math.min(Math.round((skill.score / skill.maxScore) * 100), 100);
            const isNeedWork = skill.status === 'NEEDS_WORK';

            return (
              <div key={skill.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 600, color: '#cbd5e1' }}>{skill.name}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        backgroundColor: isNeedWork ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isNeedWork ? '#f87171' : '#34d399',
                      }}
                    >
                      {skill.score} {skill.unit || ''}
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div
                  style={{
                    height: '7px',
                    width: '100%',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percent}%`,
                      backgroundColor: isNeedWork ? '#ef4444' : config.colorPalette.primary,
                      borderRadius: '4px',
                      transition: 'width 0.8s ease-in-out',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Learning Course Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
          Continue Active Lessons
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {config.recommendedLessons.map((lesson) => (
            <div
              key={lesson.id}
              style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: config.colorPalette.badgeBg,
                    color: config.colorPalette.badgeText,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PlayCircle size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                    {lesson.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                    {lesson.module} • {lesson.duration}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: config.colorPalette.badgeText }}>
                  {lesson.completedPercent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
