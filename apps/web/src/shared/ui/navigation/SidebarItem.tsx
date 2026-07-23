import React, { forwardRef } from 'react';
import { SidebarItemProps } from './navigation.types';

export const SidebarItem = forwardRef<HTMLAnchorElement, SidebarItemProps>(function SidebarItem(
  { href, label, icon, badge, isActive = false, isCollapsed = false, style, ...props },
  ref
) {
  return (
    <a
      ref={ref}
      href={href}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        gap: '0.75rem',
        padding: isCollapsed ? '0.75rem' : '0.625rem 0.875rem',
        fontSize: '0.875rem',
        fontWeight: isActive ? 600 : 500,
        borderRadius: 'var(--radius-md, 8px)',
        color: isActive ? '#ffffff' : 'var(--text-secondary, #cbd5e1)',
        backgroundColor: isActive ? 'var(--primary-500, #3b82f6)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 150ms ease-in-out',
        ...style,
      }}
      {...props}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {icon && (
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem' }}>{icon}</span>
        )}
        {!isCollapsed && <span>{label}</span>}
      </div>

      {!isCollapsed && badge && <div>{badge}</div>}
    </a>
  );
});
