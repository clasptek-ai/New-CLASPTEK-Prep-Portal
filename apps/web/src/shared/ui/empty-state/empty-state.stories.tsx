import React from 'react';
import { EmptyState } from './EmptyState';

export default {
  title: 'Data Display/EmptyState',
  component: EmptyState,
};

export const Default = () => (
  <EmptyState
    title="No Mock Examinations Completed"
    description="Take your first practice diagnostic to begin tracking your progress."
  />
);
