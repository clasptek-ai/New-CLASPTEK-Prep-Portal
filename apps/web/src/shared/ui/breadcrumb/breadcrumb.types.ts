import React from 'react';

export interface BreadcrumbItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  isCurrent?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode;
  maxItems?: number;
  children: React.ReactNode;
}
