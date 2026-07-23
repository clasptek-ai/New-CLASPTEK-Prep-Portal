import React, { forwardRef, Children } from 'react';
import { BreadcrumbProps, BreadcrumbItemProps } from './breadcrumb.types';

export const BreadcrumbItem = forwardRef<HTMLAnchorElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ href, isCurrent = false, icon, style, children, ...props }, ref) {
    if (isCurrent) {
      return (
        <span
          aria-current="page"
          style={{
            color: 'var(--text-primary, #f8fafc)',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            ...style,
          }}
        >
          {icon}
          {children}
        </span>
      );
    }

    return (
      <a
        ref={ref}
        href={href}
        style={{
          color: 'var(--text-muted, #94a3b8)',
          textDecoration: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          transition: 'color 150ms ease',
          ...style,
        }}
        {...props}
      >
        {icon}
        {children}
      </a>
    );
  }
);

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { separator = '/', maxItems: _maxItems, style, children, ...props },
  ref
) {
  const items = Children.toArray(children);

  return (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      style={{ display: 'flex', alignItems: 'center', ...style }}
      {...props}
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {items.map((item, index) => (
          <li key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {item}
            {index < items.length - 1 && (
              <span
                aria-hidden="true"
                style={{
                  color: 'var(--text-muted, #94a3b8)',
                  fontSize: '0.75rem',
                  userSelect: 'none',
                }}
              >
                {separator}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});
