import React from 'react';

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: string;
  children?: React.ReactNode;
}

export function FieldError({ error, style, children, ...props }: FieldErrorProps) {
  const content = error || children;
  if (!content) return null;

  return (
    <p
      role="alert"
      style={{
        margin: '0.25rem 0 0 0',
        fontSize: '0.75rem',
        color: '#ef4444',
        fontWeight: 500,
        lineHeight: 1.4,
        ...style,
      }}
      {...props}
    >
      {content}
    </p>
  );
}
