import React, { forwardRef, useId } from 'react';
import { TextareaProps } from './textarea.types';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    helperText,
    error,
    fullWidth = true,
    disabled = false,
    maxLength,
    showCount = false,
    id,
    style,
    value,
    defaultValue,
    rows = 4,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const errorId = `${textareaId}-error`;

  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', marginBottom: '0.75rem' }}>
      {label && (
        <label
          htmlFor={textareaId}
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-primary, #f8fafc)',
            marginBottom: '0.35rem',
          }}
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        value={value}
        defaultValue={defaultValue}
        style={{
          width: '100%',
          padding: '0.625rem 0.875rem',
          fontSize: '0.875rem',
          fontFamily: 'inherit',
          color: 'var(--text-primary, #f8fafc)',
          backgroundColor: 'var(--bg-surface-0, #111827)',
          border: `1px solid ${error ? '#ef4444' : 'var(--border-default, #1e293b)'}`,
          borderRadius: 'var(--radius-md, 8px)',
          outline: 'none',
          boxSizing: 'border-box',
          resize: 'vertical',
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
        {...props}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        {error ? (
          <p id={errorId} role="alert" style={{ margin: 0, fontSize: '0.75rem', color: '#ef4444' }}>
            {error}
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
            {helperText}
          </p>
        )}

        {showCount && maxLength && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
            {charCount} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
});
