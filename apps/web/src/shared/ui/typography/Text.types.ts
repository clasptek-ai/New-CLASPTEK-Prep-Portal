import React from 'react';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body-md' | 'body-sm' | 'muted' | 'strong';
  children: React.ReactNode;
}
