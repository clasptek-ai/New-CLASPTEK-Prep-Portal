import React from 'react';
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'ghost';
}
export declare const Card: React.FC<CardProps>;
