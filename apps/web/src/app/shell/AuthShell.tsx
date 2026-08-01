import React from 'react';
import { Card } from '../../shared/ui/card/Card';

export interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 sm:p-6 font-sans">
      <Card className="w-full max-w-md p-6 sm:p-8 flex flex-col gap-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl cq-container">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        <div>{children}</div>
      </Card>
    </div>
  );
}
