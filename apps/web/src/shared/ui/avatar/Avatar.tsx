import React, { forwardRef, useState, Children } from 'react';
import { AvatarProps, AvatarGroupProps } from './avatar.types';

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { src, alt, name, size = 'md', status, style, ...props },
  ref
) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (n?: string) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const getSizePx = () => {
    switch (size) {
      case 'xs':
        return '24px';
      case 'sm':
        return '32px';
      case 'lg':
        return '48px';
      case 'xl':
        return '64px';
      default:
        return '40px';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'busy':
        return '#ef4444';
      case 'away':
        return '#f59e0b';
      case 'offline':
        return '#64748b';
      default:
        return undefined;
    }
  };

  const dim = getSizePx();

  return (
    <div
      ref={ref}
      style={{
        width: dim,
        height: dim,
        borderRadius: 'var(--radius-full, 9999px)',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-surface-2, #1e293b)',
        color: 'var(--text-primary, #f8fafc)',
        fontWeight: 600,
        fontSize: size === 'xs' ? '0.65rem' : size === 'sm' ? '0.75rem' : '0.875rem',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onError={() => setImageError(true)}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <span>{getInitials(name || alt)}</span>
      )}

      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size === 'xs' ? '6px' : '10px',
            height: size === 'xs' ? '6px' : '10px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            border: '2px solid var(--bg-surface-0, #111827)',
          }}
        />
      )}
    </div>
  );
});

export function AvatarGroup({ max = 4, children, style, ...props }: AvatarGroupProps) {
  const items = Children.toArray(children);
  const visible = items.slice(0, max);
  const overflow = items.length - max;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', ...style }} {...props}>
      {visible.map((child, idx) => (
        <div
          key={idx}
          style={{ marginLeft: idx === 0 ? 0 : '-0.5rem', zIndex: visible.length - idx }}
        >
          {child}
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            marginLeft: '-0.5rem',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-2, #1e293b)',
            color: 'var(--text-muted, #94a3b8)',
            border: '2px solid var(--bg-surface-0, #111827)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            zIndex: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
