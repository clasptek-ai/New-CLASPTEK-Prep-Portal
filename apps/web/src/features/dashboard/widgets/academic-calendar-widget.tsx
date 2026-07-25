import React from 'react';
import { ProgrammeConfiguration } from '../models/programme-config';
import { DashboardWidget, WidgetState } from '../../../shared/ui/academic/dashboard-widget';
import { AcademicCalendarCard } from '../../../shared/ui/academic/academic-calendar-card';

export interface AcademicCalendarWidgetProps {
  config: ProgrammeConfiguration;
  state?: WidgetState;
  onRetry?: () => void;
}

export const AcademicCalendarWidget: React.FC<AcademicCalendarWidgetProps> = ({
  config,
  state = 'SUCCESS',
  onRetry,
}) => {
  return (
    <DashboardWidget
      title="Academic Calendar & Milestones"
      subtitle="Scheduled practice runs, diagnostic milestones, and target examination dates"
      state={state}
      onRetry={onRetry}
    >
      <AcademicCalendarCard
        upcomingTests={config.upcomingTests}
        accentColor={config.colorPalette.primary}
      />
    </DashboardWidget>
  );
};
