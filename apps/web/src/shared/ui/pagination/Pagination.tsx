import React, { forwardRef } from 'react';
import { PaginationProps, PageButtonProps } from './pagination.types';

export const PageButton = forwardRef<HTMLButtonElement, PageButtonProps>(function PageButton(
  { isActive = false, disabled = false, style, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      aria-current={isActive ? 'page' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '2.25rem',
        height: '2.25rem',
        padding: '0 0.5rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        borderRadius: 'var(--radius-md, 8px)',
        border: isActive ? 'none' : '1px solid var(--border-default, #1e293b)',
        backgroundColor: isActive ? 'var(--primary-500, #3b82f6)' : 'var(--bg-surface-0, #111827)',
        color: isActive ? '#ffffff' : 'var(--text-primary, #f8fafc)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
        transition: 'all 150ms ease-in-out',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
});

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { currentPage, totalPages, onPageChange, showFirstLast = true, style, ...props },
  ref
) {
  const pages: (number | string)[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav
      ref={ref}
      aria-label="Pagination Navigation"
      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', ...style }}
      {...props}
    >
      {showFirstLast && (
        <PageButton
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          «
        </PageButton>
      )}

      <PageButton
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        ‹
      </PageButton>

      {pages.map((p, idx) => {
        if (typeof p === 'string') {
          return (
            <span
              key={`ellipsis-${idx}`}
              style={{
                padding: '0 0.25rem',
                color: 'var(--text-muted, #94a3b8)',
                userSelect: 'none',
              }}
            >
              …
            </span>
          );
        }

        return (
          <PageButton
            key={p}
            isActive={p === currentPage}
            onClick={() => onPageChange(p as number)}
          >
            {p}
          </PageButton>
        );
      })}

      <PageButton
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        ›
      </PageButton>

      {showFirstLast && (
        <PageButton
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
        >
          »
        </PageButton>
      )}
    </nav>
  );
});
