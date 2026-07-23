import React from 'react';

export interface SidebarItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  isActive?: boolean;
  isCollapsed?: boolean;
}

export interface TopNavigationProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  user?: { name: string; email: string; avatarUrl?: string; role?: string };
  onSearch?: (query: string) => void;
  onToggleTheme?: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export interface StepItem {
  id: string;
  label: string;
  description?: string;
}

export interface StepIndicatorProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export interface NavigationGroupProps {
  title?: string;
  isCollapsed?: boolean;
  children: React.ReactNode;
}
