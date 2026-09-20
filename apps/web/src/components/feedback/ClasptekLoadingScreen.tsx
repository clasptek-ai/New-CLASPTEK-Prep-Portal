'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { BrandConfig } from '@/config/brand.config';

export type LoadingContext =
  'auth' | 'admin' | 'security' | 'workspace' | 'assessment' | 'results' | 'default';

export interface ClasptekLoadingScreenProps {
  /**
   * The semantic context of the transition.
   */
  context?: LoadingContext;

  /**
   * Custom message to display. Overrides default context messages.
   */
  message?: string;

  /**
   * Optional subtitle or detail message.
   */
  subtitle?: string;

  /**
   * Whether to display a reassuring security badge icon alongside the message.
   */
  showSecurityBadge?: boolean;

  /**
   * Optional full-screen height flag (default: true).
   */
  fullscreen?: boolean;

  /**
   * Additional CSS classes.
   */
  className?: string;

  /**
   * Inline styles.
   */
  style?: React.CSSProperties;
}

const DEFAULT_MESSAGES: Record<LoadingContext, string> = {
  auth: 'Securing your session…',
  security: 'Verifying security authorization…',
  admin: 'Opening Admin Console…',
  workspace: 'Loading your workspace…',
  assessment: 'Preparing your assessment…',
  results: 'Loading your results…',
  default: 'Loading your workspace…',
};

export const ClasptekLoadingScreen: React.FC<ClasptekLoadingScreenProps> = ({
  context = 'default',
  message,
  subtitle,
  showSecurityBadge = false,
  fullscreen = true,
  className = '',
  style,
}) => {
  const [imgError, setImgError] = useState(false);
  const displayMessage = message || DEFAULT_MESSAGES[context] || DEFAULT_MESSAGES.default;
  const isSecurity = showSecurityBadge || context === 'auth' || context === 'security';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={displayMessage}
      className={`clasptek-loading-screen ${className}`}
      style={{
        minHeight: fullscreen ? '100vh' : '400px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--surface-page, #f8fafc)',
        color: 'var(--text-primary, #0f172a)',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
        padding: '2rem',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Logo Container with graceful fallback */}
        <div
          style={{
            backgroundColor: 'var(--surface-0, #ffffff)',
            padding: '0.625rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--border, #e2e8f0)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.75rem',
          }}
        >
          {!imgError ? (
            <img
              src={BrandConfig.logoUrl}
              alt={BrandConfig.portalName}
              onError={() => setImgError(true)}
              style={{
                height: '36px',
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--brand, #045EAD)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--brand, #045EAD)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.875rem',
                }}
              >
                C
              </div>
              <span>{BrandConfig.shortName}</span>
            </div>
          )}
        </div>

        {/* Sleek Clasptek Blue Indeterminate Progress Track */}
        <div
          aria-hidden="true"
          className="clasptek-progress-track"
          style={{
            width: '180px',
            height: '4px',
            backgroundColor: 'rgba(4, 94, 173, 0.12)',
            borderRadius: '999px',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: '1.25rem',
          }}
        >
          <div
            className="clasptek-progress-bar"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              backgroundColor: 'var(--brand, #045EAD)',
              borderRadius: '999px',
            }}
          />
        </div>

        {/* Contextual Status Message */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          {isSecurity && (
            <ShieldCheck
              size={16}
              style={{
                color: 'var(--brand, #045EAD)',
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
          )}
          <span
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--text-primary, #0f172a)',
              letterSpacing: '-0.01em',
            }}
          >
            {displayMessage}
          </span>
        </div>

        {subtitle && (
          <p
            style={{
              margin: '0.35rem 0 0 0',
              fontSize: '0.8125rem',
              color: 'var(--text-muted, #64748b)',
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <style>{`
        @keyframes clasptek-indeterminate {
          0% {
            left: -35%;
            right: 100%;
          }
          60% {
            left: 100%;
            right: -35%;
          }
          100% {
            left: 100%;
            right: -35%;
          }
        }

        .clasptek-progress-bar {
          animation: clasptek-indeterminate 1.6s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .clasptek-progress-bar {
            animation: none !important;
            left: 0 !important;
            width: 65% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ClasptekLoadingScreen;
