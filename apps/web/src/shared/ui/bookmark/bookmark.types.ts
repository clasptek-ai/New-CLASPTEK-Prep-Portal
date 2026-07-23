import React from 'react';

export interface BookmarkButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onToggle'
> {
  isBookmarked?: boolean;
  onToggle?: (isBookmarked: boolean) => void;
}
