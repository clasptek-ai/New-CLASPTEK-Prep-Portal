import React from 'react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { DashboardWidget, WidgetState } from '../../../shared/ui/academic/dashboard-widget';
import { Button } from '../../../shared/ui/button/Button';
import { FileText, Award, Play, Clock } from 'lucide-react';

export interface UpcomingAssessmentsWidgetProps {
  config: ProgrammeConfiguration;
  state?: WidgetState;
  onRetry?: () => void;
  onLaunchDiagnostic?: () => void;
  onLaunchMock?: () => void;
}

export const UpcomingAssessmentsWidget: React.FC<UpcomingAssessmentsWidgetProps> = ({
  config,
  state = 'SUCCESS',
  onRetry,
  onLaunchDiagnostic,
  onLaunchMock,
}) => {
  return (
    <DashboardWidget
      title="Upcoming Assessments & Mock Examinations"
      subtitle="Strict academic separation of initial Diagnostic Assessments and full timed Mock Tests"
      state={state}
      onRetry={onRetry}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Module 1: Diagnostic Assessment Launcher Card */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '14px',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                }}
              >
                INITIAL PROFICIENCY
              </span>
              <FileText size={16} color="#38bdf8" />
            </div>

            <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              Diagnostic Assessment
            </h4>
            <p style={{ margin: 0, fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              Determines initial proficiency baseline and generates your personalized study plan before learning starts.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onLaunchDiagnostic}
            style={{
              width: '100%',
              justifyContent: 'center',
              borderColor: 'rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              gap: '0.4rem',
            }}
          >
            <Play size={14} /> Start Diagnostic Assessment
          </Button>
        </div>

        {/* Module 2: Full Mock Test Simulation Card */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '14px',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(167, 139, 250, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(167, 139, 250, 0.15)',
                  color: '#a78bfa',
                }}
              >
                EXAM SIMULATION
              </span>
              <Award size={16} color="#a78bfa" />
            </div>

            <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              Full Mock Examination
            </h4>
            <p style={{ margin: 0, fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              Simulates the full timed examination environment under strict conditions to evaluate score readiness.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onLaunchMock}
            style={{
              width: '100%',
              justifyContent: 'center',
              backgroundColor: config.colorPalette.primary,
              color: '#ffffff',
              gap: '0.4rem',
            }}
          >
            <Play size={14} /> Launch Full Mock Test
          </Button>
        </div>
      </div>
    </DashboardWidget>
  );
};
