import React, { forwardRef } from 'react';
import { ChipProps } from './chip.types';

export const Chip = forwardRef<HTMLDivElement, ChipProps>(function Chip(
  { label, icon, isSelected = false, onRemove, onClick, style, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.75rem',
        borderRadius: 'var(--radius-full, 9999px)',
        fontSize: '0.8125rem',
        fontWeight: 600,
        backgroundColor: isSelected
          ? 'var(--primary-500, #3b82f6)'
          : 'var(--bg-surface-2, #1e293b)',
        color: isSelected ? '#ffffff' : 'var(--text-primary, #f8fafc)',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'all 150ms ease',
        ...style,
      }}
      {...props}
    >
      {icon}
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${label}`}
          style={{
            background: 'none',
            border: 'none',
            color: 'currentColor',
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.9rem',
            lineHeight: 1,
            marginLeft: '0.2rem',
            opacity: 0.8,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
});

export const FilterChip = Chip;
export const ChoiceChip = Chip;
export const RemovableChip = Chip;
