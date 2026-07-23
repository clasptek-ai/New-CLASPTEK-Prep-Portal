import React, { forwardRef, useState } from 'react';
import { BookmarkButtonProps } from './bookmark.types';

export const BookmarkButton = forwardRef<HTMLButtonElement, BookmarkButtonProps>(
  function BookmarkButton(
    { isBookmarked: initialBookmarked = false, onToggle, style, ...props },
    ref
  ) {
    const [bookmarked, setBookmarked] = useState(initialBookmarked);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const nextState = !bookmarked;
      setBookmarked(nextState);
      if (onToggle) onToggle(nextState);
      if (props.onClick) props.onClick(e);
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        aria-label={bookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-md, 8px)',
          backgroundColor: bookmarked ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface-0, #111827)',
          border: `1px solid ${bookmarked ? '#f59e0b' : 'var(--border-default, #1e293b)'}`,
          color: bookmarked ? '#fbbf24' : 'var(--text-secondary, #cbd5e1)',
          fontWeight: 600,
          fontSize: '0.8125rem',
          cursor: 'pointer',
          transition: 'all 150ms ease',
          ...style,
        }}
        {...props}
      >
        <span>{bookmarked ? '🚩' : '🏳'}</span>
        <span>{bookmarked ? 'Flagged' : 'Flag Question'}</span>
      </button>
    );
  }
);

export const FlagQuestion = BookmarkButton;
export const ReviewLaterBadge = BookmarkButton;
