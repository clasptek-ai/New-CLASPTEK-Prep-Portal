import React from 'react';
import { Button } from '../Button/Button';

export interface ModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  id: _id,
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1300 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-[#c3c6d2] shadow-2xl p-6 text-[#191c1e] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#eceef0] pb-4 mb-4">
          <h3 className="text-lg font-bold text-[#191c1e]">{title}</h3>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-1 min-w-0 text-[#737781] hover:text-[#191c1e]"
          >
            ✕
          </Button>
        </div>
        <div className="py-2 text-sm leading-relaxed">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-[#eceef0] pt-4 mt-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
