import React from 'react';

export interface PdfReportProps {
  title: string;
  subtitle?: string;
  generatedAt?: string;
  verificationCode?: string;
  children: React.ReactNode;
}

export const PdfLayout: React.FC<PdfReportProps> = ({
  title,
  subtitle,
  generatedAt = new Date().toISOString(),
  verificationCode = 'VER-2026-CLASPTEK',
  children,
}) => (
  <div className="p-8 bg-white text-slate-900 font-sans max-w-4xl mx-auto print:p-0">
    <div className="flex justify-between items-start border-b border-slate-300 pb-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight">CLASPTEK PREP PORTAL</h1>
        <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="text-right text-[10px] text-slate-500">
        <div>Generated: {new Date(generatedAt).toLocaleString()}</div>
        <div className="font-mono mt-1">Ref: {verificationCode}</div>
      </div>
    </div>
    <div className="my-6">{children}</div>
    <div className="flex justify-between items-center border-t border-slate-300 pt-4 mt-8 text-[10px] text-slate-500">
      <span>Confidential Official Academic Report</span>
      <span>Page 1 of 1</span>
    </div>
  </div>
);
