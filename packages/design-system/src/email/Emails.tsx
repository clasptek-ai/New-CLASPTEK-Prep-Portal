import React from 'react';

export interface EmailLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({ title, children }) => (
  <div
    style={{
      fontFamily: 'Outfit, Inter, sans-serif',
      backgroundColor: '#0f172a',
      padding: '32px 16px',
      color: '#f8fafc',
    }}
  >
    <div
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        padding: '32px',
      }}
    >
      <div
        style={{ textAlign: 'center', paddingBottom: '24px', borderBottom: '1px solid #334155' }}
      >
        <h1 style={{ color: '#1e5eff', fontSize: '24px', margin: 0 }}>CLASPTEK Prep Portal</h1>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>{title}</p>
      </div>
      <div style={{ padding: '24px 0' }}>{children}</div>
      <div
        style={{
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: '1px solid #334155',
          fontSize: '11px',
          color: '#64748b',
        }}
      >
        © 2026 CLASPTEK Prep Portal. All rights reserved.
      </div>
    </div>
  </div>
);

export const EmailButton: React.FC<{ href: string; label: string }> = ({ href, label }) => (
  <div style={{ textAlign: 'center', margin: '24px 0' }}>
    <a
      href={href}
      style={{
        backgroundColor: '#1e5eff',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '14px',
        display: 'inline-block',
      }}
    >
      {label}
    </a>
  </div>
);

export const WelcomeEmail: React.FC<{ name: string; loginUrl: string }> = ({ name, loginUrl }) => (
  <EmailLayout title="Welcome to Clasptek">
    <h2 style={{ fontSize: '18px', color: '#ffffff' }}>Welcome, {name}!</h2>
    <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6 }}>
      Your Clasptek Prep Portal account is ready. Log in to start your personalized adaptive
      learning journey.
    </p>
    <EmailButton href={loginUrl} label="Log In to Portal" />
  </EmailLayout>
);

export const PasswordResetEmail: React.FC<{ resetUrl: string }> = ({ resetUrl }) => (
  <EmailLayout title="Password Reset Request">
    <h2 style={{ fontSize: '18px', color: '#ffffff' }}>Reset Your Password</h2>
    <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6 }}>
      We received a request to reset your password. Click below to choose a new password.
    </p>
    <EmailButton href={resetUrl} label="Reset Password" />
  </EmailLayout>
);

export const ResultsReadyEmail: React.FC<{ score: number; reportUrl: string }> = ({
  score,
  reportUrl,
}) => (
  <EmailLayout title="Assessment Results Ready">
    <h2 style={{ fontSize: '18px', color: '#ffffff' }}>Your Results Are Available</h2>
    <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6 }}>
      Your assessment evaluation is complete. You achieved a score of <strong>{score}%</strong>.
    </p>
    <EmailButton href={reportUrl} label="View Detailed Report" />
  </EmailLayout>
);
