import React from 'react';
export interface EmailLayoutProps {
  title: string;
  children: React.ReactNode;
}
export declare const EmailLayout: React.FC<EmailLayoutProps>;
export declare const EmailButton: React.FC<{
  href: string;
  label: string;
}>;
export declare const WelcomeEmail: React.FC<{
  name: string;
  loginUrl: string;
}>;
export declare const PasswordResetEmail: React.FC<{
  resetUrl: string;
}>;
export declare const ResultsReadyEmail: React.FC<{
  score: number;
  reportUrl: string;
}>;
