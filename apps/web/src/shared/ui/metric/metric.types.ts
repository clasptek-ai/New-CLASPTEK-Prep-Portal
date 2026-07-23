import React from 'react';

export type MetricTrendDirection = 'up' | 'down' | 'neutral';

export interface MetricProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  previousValue?: string | number;
  trend?: MetricTrendDirection;
  percentageChange?: string;
  period?: string;
}

export interface MetricGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
