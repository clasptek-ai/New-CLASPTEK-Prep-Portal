import React from 'react';

export interface InstructionPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  rules?: string[];
  children?: React.ReactNode;
}
