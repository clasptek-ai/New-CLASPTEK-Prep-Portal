'use client';

import React, { useState, useEffect } from 'react';

// ─── Button Component ────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Badge({
  children,
  variant = 'info',
}: {
  children: React.ReactNode;
  variant?:
    'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' | 'secondary' | 'ghost';
}) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: 'var(--success-bg, #059669)', color: '#ffffff' };
      case 'warning':
        return { bg: 'var(--warning-bg, #d97706)', color: '#ffffff' };
      case 'danger':
        return { bg: 'var(--error, #dc2626)', color: '#ffffff' };
      case 'neutral':
      case 'secondary':
      case 'ghost':
        return { bg: 'var(--card-border, #475569)', color: 'var(--text-main, #f8fafc)' };
      case 'primary':
      case 'info':
      default:
        return { bg: 'var(--primary, #2563eb)', color: '#ffffff' };
    }
  };
  const colors = getColors();
  return (
    <span
      style={{
        backgroundColor: colors.bg,
        color: colors.color,
        padding: '0.2rem 0.6rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      style={{
        width: '100%',
        height: '8px',
        backgroundColor: 'var(--card-border)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: 'var(--primary)',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}

export function Button({
  variant = 'primary',
  size: _size = 'md',
  children,
  style,
  ...props
}: ButtonProps) {
  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: '#bb0014',
          hover: '#e41f25',
          color: '#ffffff',
          border: 'none',
        };
      case 'danger':
        return { bg: '#ba1a1a', hover: '#93000a', color: '#ffffff', border: 'none' };
      case 'success':
        return { bg: '#059669', hover: '#10b981', color: '#ffffff', border: 'none' };
      case 'outline':
        return {
          bg: 'transparent',
          hover: 'rgba(255, 255, 255, 0.08)',
          color: '#f8fafc',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        };
      case 'ghost':
        return {
          bg: 'transparent',
          hover: '#eceef0',
          color: '#434750',
          border: 'none',
        };
      default:
        return {
          bg: '#00346b',
          hover: '#1b4b8a',
          color: '#ffffff',
          border: 'none',
        };
    }
  };

  const colors = getColors();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <button
      {...props}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        backgroundColor: hovered ? colors.hover : colors.bg,
        color: colors.color,
        border: colors.border,
        padding: '0.75rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-8)',
        outline: focused ? '2px solid var(--accent)' : 'none',
        outlineOffset: '2px',
        boxShadow: hovered ? 'var(--shadow-md)' : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Card Component ──────────────────────────────────────────────────
interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Card({ title, children, actions, style, className }: CardProps) {
  return (
    <div
      className={`card ${className || ''}`.trim()}
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-24)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-16)',
        ...style,
      }}
    >
      {(title || actions) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--card-border)',
            paddingBottom: 'var(--spacing-12)',
          }}
        >
          {typeof title === 'string' ? (
            <h3
              style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}
            >
              {title}
            </h3>
          ) : (
            title
          )}
          {actions && <div style={{ display: 'flex', gap: 'var(--spacing-8)' }}>{actions}</div>}
        </div>
      )}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

// ─── Dialog / Modal Component ────────────────────────────────────────
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children, footer }: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 15, 25, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '500px',
          width: '100%',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem',
            borderBottom: '1px solid var(--card-border)',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
          >
            &times;
          </button>
        </div>
        <div
          style={{
            padding: '1.25rem',
            flex: 1,
            overflowY: 'auto',
            maxHeight: '60vh',
            color: 'var(--text-main)',
          }}
        >
          {children}
        </div>
        {footer && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid var(--card-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              backgroundColor: 'var(--background)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Input & Form Control Components ───────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)', width: '100%' }}
    >
      {label && (
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}
      <input
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          border: error
            ? '1px solid var(--error)'
            : focused
              ? '1px solid var(--accent)'
              : '1px solid var(--card-border)',
          backgroundColor: 'var(--background)',
          color: 'var(--text-main)',
          boxSizing: 'border-box',
          fontSize: '0.9rem',
          outline: focused ? '2px solid var(--accent)' : 'none',
          outlineOffset: '2px',
          transition: 'border-color 0.2s ease',
          ...style,
        }}
      />
      {error && (
        <span style={{ color: 'var(--error)', fontSize: '0.75rem' }}>
          {typeof error === 'object'
            ? (error as any).message || String((error as any).error || JSON.stringify(error))
            : String(error)}
        </span>
      )}
    </div>
  );
}

// ─── Progress Ring Component ─────────────────────────────────────────
interface ProgressRingProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ value, size = 120, strokeWidth = 10 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: 'rotate(-90deg)' }}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      role="progressbar"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#232e48"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.35s' }}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="-50%"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          transform: 'rotate(90deg)',
          fill: '#f8fafc',
          fontSize: '1.25rem',
          fontWeight: 700,
          fontFamily: 'Outfit',
        }}
      >
        {Math.round(value)}%
      </text>
    </svg>
  );
}

// ─── Table Component ─────────────────────────────────────────────────
interface TableColumn<T> {
  header: string;
  render: (row: T) => React.ReactNode;
}

export function Table<T>({ data, columns }: { data: T[]; columns: TableColumn<T>[] }) {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid #232e48', borderRadius: '8px' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: '#151d30',
          textAlign: 'left',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid #232e48', backgroundColor: '#0b0f19' }}>
            {columns.map((c, i) => (
              <th
                key={i}
                style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}
              >
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row, rIndex) => (
              <tr
                key={rIndex}
                style={{ borderBottom: '1px solid #232e48', transition: 'background-color 0.2s' }}
              >
                {columns.map((col, cIndex) => (
                  <td key={cIndex} style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Accordion Component ─────────────────────────────────────────────
export function Accordion({
  items,
}: {
  items: Array<{ title: string; content: React.ReactNode }>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            style={{
              border: '1px solid #232e48',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#151d30',
            }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              style={{
                width: '100%',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'none',
                border: 'none',
                color: '#f8fafc',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                textAlign: 'left',
              }}
            >
              <span>{item.title}</span>
              <span>{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
              <div
                style={{
                  padding: '1rem',
                  borderTop: '1px solid #232e48',
                  backgroundColor: '#0b0f19',
                  color: '#cbd5e1',
                  fontSize: '0.85rem',
                }}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Reusable Clasptek Logo Component ──────────────────────────────
interface ClasptekLogoProps {
  size?: 'small' | 'medium' | 'large' | 'navbar' | 'authentication' | 'footer' | 'print';
  theme?: 'light' | 'dark' | 'auto';
  style?: React.CSSProperties;
}

export function ClasptekLogo({
  size = 'medium',
  theme: _theme = 'auto',
  style,
}: ClasptekLogoProps) {
  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 28 };
      case 'navbar':
        return { width: 120, height: 42 };
      case 'medium':
        return { width: 150, height: 52 };
      case 'large':
      case 'authentication':
        return { width: 220, height: 76 };
      case 'footer':
        return { width: 130, height: 45 };
      case 'print':
        return { width: 100, height: 35 };
      default:
        return { width: 150, height: 52 };
    }
  };

  const dimensions = getDimensions();

  // On dark or light theme, we enclose the logo in a white card pill to ensure readability
  // of the black "CLASPTEK" and red "GLOBAL" brand text on any background style.
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.25rem 0.5rem',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        ...style,
      }}
    >
      <img
        src="/logo.png"
        alt="Clasptek Global Logo"
        width={dimensions.width}
        height={dimensions.height}
        style={{
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}

// ─── Skeleton Loader Component (WCAG Compliant) ────────────────────
export function SkeletonLoader({
  width = '100%',
  height = '1.25rem',
  borderRadius = '4px',
  style,
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-label="Loading content..."
      role="status"
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--card-border)',
        backgroundImage:
          'linear-gradient(90deg, var(--card-border) 25%, var(--card-bg) 50%, var(--card-border) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
        ...style,
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Empty State Component ──────────────────────────────────────────
export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  illustrationType = 'generic',
}: {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  illustrationType?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        textAlign: 'center',
        backgroundColor: 'var(--card-bg)',
        border: '1px dashed var(--card-border)',
        borderRadius: '12px',
        gap: '1rem',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))' }}>
        {illustrationType === 'assignments'
          ? '📚'
          : illustrationType === 'exams'
            ? '📝'
            : illustrationType === 'notifications'
              ? '🔔'
              : '🔍'}
      </div>
      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} style={{ marginTop: '0.5rem' }}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

// ─── Tooltip Component ──────────────────────────────────────────────
export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-8px)',
            backgroundColor: '#040708',
            color: '#ffffff',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 100,
            border: '1px solid var(--card-border)',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

// ─── Breadcrumbs Component ─────────────────────────────────────────
export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <span>/</span>}
            {isLast ? (
              <span aria-current="page" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                {item.label}
              </span>
            ) : (
              <a href={item.href || '#'} style={{ color: 'var(--text-muted)' }}>
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
