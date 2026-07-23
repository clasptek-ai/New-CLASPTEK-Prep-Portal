import React from 'react';

export interface HelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function HelperText({ style, children, ...props }: HelperTextProps) {
  return (
    <p
      style={{
        margin: '0.25rem 0 0 0',
        fontSize: '0.75rem',
        color: 'var(--text-muted, #94a3b8)',
        lineHeight: 1.4,
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  );
}
