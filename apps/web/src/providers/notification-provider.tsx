'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: NotificationType;
  message: string;
}

export interface NotificationContextType {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  showWarning: (msg: string) => void;
  showInfo: (msg: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: NotificationType, message: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showSuccess = useCallback((msg: string) => addToast('success', msg), [addToast]);
  const showError = useCallback((msg: string) => addToast('error', msg), [addToast]);
  const showWarning = useCallback((msg: string) => addToast('warning', msg), [addToast]);
  const showInfo = useCallback((msg: string) => addToast('info', msg), [addToast]);

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.15)';
      case 'error':
        return 'rgba(239, 68, 68, 0.15)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.15)';
      case 'info':
        return 'rgba(59, 130, 246, 0.15)';
    }
  };

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      {/* Toast container floating in top-right */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              backgroundColor: '#151d30',
              backgroundImage: `linear-gradient(135deg, ${getBgColor(toast.type)}, transparent)`,
              borderLeft: `4px solid ${getBorderColor(toast.type)}`,
              color: '#f8fafc',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              fontSize: '0.875rem',
              fontWeight: 600,
              minWidth: '280px',
              maxWidth: '400px',
              backdropFilter: 'blur(12px)',
              animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.25rem',
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
export default NotificationProvider;
