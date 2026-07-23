import React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
  children: React.ReactNode;
}

export interface TagGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
