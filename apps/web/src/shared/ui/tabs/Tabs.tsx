import React, { createContext, useContext, forwardRef } from 'react';
import { TabsProps, TabProps, TabPanelProps } from './tabs.types';

interface TabsContextValue {
  activeTab: string;
  onTabChange: (id: string) => void;
  variant: TabsProps['variant'];
  orientation: TabsProps['orientation'];
}

const TabsContext = createContext<TabsContextValue | null>(null);

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    activeTab,
    onTabChange,
    variant = 'default',
    orientation = 'horizontal',
    style,
    children,
    ...props
  },
  ref
) {
  return (
    <TabsContext.Provider value={{ activeTab, onTabChange, variant, orientation }}>
      <div
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: orientation === 'vertical' ? 'row' : 'column',
          width: '100%',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

export const TabList = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function TabList({ style, children, ...props }, ref) {
    const ctx = useContext(TabsContext);
    const isVertical = ctx?.orientation === 'vertical';

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={ctx?.orientation || 'horizontal'}
        style={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          gap: ctx?.variant === 'segmented' ? '0.25rem' : '0.5rem',
          backgroundColor:
            ctx?.variant === 'segmented' ? 'var(--bg-surface-2, #1e293b)' : 'transparent',
          padding: ctx?.variant === 'segmented' ? '0.25rem' : 0,
          borderRadius: ctx?.variant === 'segmented' ? 'var(--radius-lg, 12px)' : 0,
          borderBottom:
            ctx?.variant === 'underline' && !isVertical
              ? '1px solid var(--border-default, #1e293b)'
              : 'none',
          overflowX: isVertical ? 'visible' : 'auto',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { id, label, icon, badge, disabled = false, style, onClick, ...props },
  ref
) {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.activeTab === id;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (ctx?.onTabChange) ctx.onTabChange(id);
    if (onClick) onClick(e);
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (ctx?.variant) {
      case 'underline':
        return {
          backgroundColor: 'transparent',
          color: isActive ? 'var(--primary-500, #3b82f6)' : 'var(--text-secondary, #cbd5e1)',
          borderBottom: isActive
            ? '2px solid var(--primary-500, #3b82f6)'
            : '2px solid transparent',
          borderRadius: 0,
        };
      case 'pills':
        return {
          backgroundColor: isActive ? 'var(--primary-500, #3b82f6)' : 'transparent',
          color: isActive ? '#ffffff' : 'var(--text-secondary, #cbd5e1)',
          borderRadius: 'var(--radius-full, 9999px)',
        };
      case 'segmented':
        return {
          backgroundColor: isActive ? 'var(--bg-surface-0, #111827)' : 'transparent',
          color: isActive ? 'var(--text-primary, #f8fafc)' : 'var(--text-muted, #94a3b8)',
          borderRadius: 'var(--radius-md, 8px)',
          boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
        };
      default:
        return {
          backgroundColor: isActive ? 'var(--bg-surface-2, #1e293b)' : 'transparent',
          color: isActive ? 'var(--text-primary, #f8fafc)' : 'var(--text-secondary, #cbd5e1)',
          borderRadius: 'var(--radius-md, 8px)',
        };
    }
  };

  return (
    <button
      ref={ref}
      role="tab"
      id={`tab-${id}`}
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1.0rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        border: 'none',
        outline: 'none',
        transition: 'all 150ms ease-in-out',
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {icon}
      {label}
      {badge}
    </button>
  );
});

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
  { id, style, children, ...props },
  ref
) {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.activeTab === id;

  if (!isActive) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      style={{
        paddingTop: ctx?.orientation === 'vertical' ? 0 : '1.0rem',
        paddingLeft: ctx?.orientation === 'vertical' ? '1.5rem' : 0,
        outline: 'none',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});
