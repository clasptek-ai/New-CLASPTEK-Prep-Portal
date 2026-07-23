import React from 'react';
import { Button } from '../Button/Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white border border-[#c3c6d2] shadow-[0px_4px_20px_rgba(27,75,138,0.05)] ${className}`}
    >
      {icon && <div className="mb-4 text-[#00346b] p-3 rounded-full bg-[#f2f4f6]">{icon}</div>}
      <h3 className="text-lg font-bold text-[#191c1e] mb-2">{title}</h3>
      <p className="text-sm text-[#434750] max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
