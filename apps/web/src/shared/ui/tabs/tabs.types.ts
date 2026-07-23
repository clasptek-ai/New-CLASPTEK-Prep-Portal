import React from 'react';

export type TabsVariant = 'default' | 'underline' | 'pills' | 'segmented';
export type TabsOrientation = 'horizontal' | 'vertical';

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: TabsVariant;
  orientation?: TabsOrientation;
  children: React.ReactNode;
}

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  children: React.ReactNode;
}
