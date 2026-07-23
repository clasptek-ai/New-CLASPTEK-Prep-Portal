import React, { forwardRef, useId } from 'react';
import { SelectProps, MultiSelectProps } from './select.types';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    helperText,
    error,
    options,
    fullWidth = true,
    size = 'md',
    disabled = false,
    id,
    style,
    value,
    defaultValue,
    onChange,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = `${selectId}-error`;

  const getPadding = () => {
    switch (size) {
      case 'xs':
        return '0.25rem 0.5rem';
      case 'sm':
        return '0.375rem 0.75rem';
      case 'md':
        return '0.5rem 0.875rem';
      case 'lg':
        return '0.75rem 1.0rem';
      case 'xl':
        return '1.0rem 1.25rem';
      default:
        return '0.5rem 0.875rem';
    }
  };

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', marginBottom: '0.75rem' }}>
      {label && (
        <label
          htmlFor={selectId}
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

      <select
        ref={ref}
        id={selectId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        style={{
          width: '100%',
          padding: getPadding(),
          fontSize: '0.875rem',
          color: 'var(--text-primary, #f8fafc)',
          backgroundColor: 'var(--bg-surface-0, #111827)',
          border: `1px solid ${error ? '#ef4444' : 'var(--border-default, #1e293b)'}`,
          borderRadius: 'var(--radius-md, 8px)',
          outline: 'none',
          boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {error ? (
        <p
          id={errorId}
          role="alert"
          style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#ef4444' }}
        >
          {error}
        </p>
      ) : (
        helperText && (
          <p
            style={{
              margin: '0.25rem 0 0 0',
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

export const MultiSelect = forwardRef<HTMLSelectElement, MultiSelectProps>(function MultiSelect(
  { options, value = [], onChange, ...props },
  ref
) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    if (onChange) onChange(selected);
  };

  return (
    <Select ref={ref} multiple options={options} value={value} onChange={handleChange} {...props} />
  );
});
