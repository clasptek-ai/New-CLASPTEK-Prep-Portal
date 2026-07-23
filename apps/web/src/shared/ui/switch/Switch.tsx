import React, { forwardRef, useId } from 'react';
import { SwitchProps } from './switch.types';

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    helperText,
    error,
    size: _size = 'md',
    disabled = false,
    id,
    style,
    checked,
    defaultChecked,
    onChange,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const switchId = id || generatedId;

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <label
        htmlFor={switchId}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-primary, #f8fafc)',
        }}
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={switchId}
          disabled={disabled}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          style={{
            accentColor: 'var(--primary-500, #3b82f6)',
            width: '1.25rem',
            height: '1.25rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            ...style,
          }}
          {...props}
        />
        {label}
      </label>

      {error ? (
        <p style={{ margin: '0.25rem 0 0 2.0rem', fontSize: '0.75rem', color: '#ef4444' }}>
          {error}
        </p>
      ) : (
        helperText && (
          <p
            style={{
              margin: '0.25rem 0 0 2.0rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted, #94a3b8)',
            }}
          >
            {helperText}
          </p>
        )
      )}
    </div>
  );
});
