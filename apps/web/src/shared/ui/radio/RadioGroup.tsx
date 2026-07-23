import React, { forwardRef } from 'react';
import { RadioGroupProps } from './radio.types';

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(function RadioGroup(
  { name, label, options, value, defaultValue, onChange, error, disabled = false },
  ref
) {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: '0 0 0.75rem 0' }}>
      {label && (
        <legend
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-primary, #f8fafc)',
            marginBottom: '0.5rem',
          }}
        >
          {label}
        </legend>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {options.map((opt, idx) => {
          const optId = `${name}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={optId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--text-primary, #f8fafc)',
                cursor: disabled || opt.disabled ? 'not-allowed' : 'pointer',
                opacity: disabled || opt.disabled ? 0.6 : 1,
              }}
            >
              <input
                ref={idx === 0 ? ref : undefined}
                type="radio"
                id={optId}
                name={name}
                value={opt.value}
                disabled={disabled || opt.disabled}
                checked={value !== undefined ? value === opt.value : undefined}
                defaultChecked={defaultValue === opt.value}
                onChange={onChange}
                style={{ accentColor: 'var(--primary-500, #3b82f6)' }}
              />
              {opt.label}
            </label>
          );
        })}
      </div>

      {error && (
        <p role="alert" style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#ef4444' }}>
          {error}
        </p>
      )}
    </fieldset>
  );
});
