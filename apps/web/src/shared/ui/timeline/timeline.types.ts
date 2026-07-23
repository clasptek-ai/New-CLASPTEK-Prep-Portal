import React from 'react';

export interface TimelineItemProps {
  date: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isCompleted?: boolean;
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
