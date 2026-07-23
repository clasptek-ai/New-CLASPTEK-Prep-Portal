import React from 'react';
export interface PdfReportProps {
  title: string;
  subtitle?: string;
  generatedAt?: string;
  verificationCode?: string;
  children: React.ReactNode;
}
export declare const PdfLayout: React.FC<PdfReportProps>;
