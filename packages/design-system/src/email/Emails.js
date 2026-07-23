import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
export const EmailLayout = ({ title, children }) =>
  _jsx('div', {
    style: {
      fontFamily: 'Outfit, Inter, sans-serif',
      backgroundColor: '#0f172a',
      padding: '32px 16px',
      color: '#f8fafc',
    },
    children: _jsxs('div', {
      style: {
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        padding: '32px',
      },
      children: [
        _jsxs('div', {
          style: { textAlign: 'center', paddingBottom: '24px', borderBottom: '1px solid #334155' },
          children: [
            _jsx('h1', {
              style: { color: '#1e5eff', fontSize: '24px', margin: 0 },
              children: 'CLASPTEK Prep Portal',
            }),
            _jsx('p', {
              style: { color: '#94a3b8', fontSize: '12px', marginTop: '4px' },
              children: title,
            }),
          ],
        }),
        _jsx('div', { style: { padding: '24px 0' }, children: children }),
        _jsx('div', {
          style: {
            textAlign: 'center',
            paddingTop: '24px',
            borderTop: '1px solid #334155',
            fontSize: '11px',
            color: '#64748b',
          },
          children: '\u00A9 2026 CLASPTEK Prep Portal. All rights reserved.',
        }),
      ],
    }),
  });
export const EmailButton = ({ href, label }) =>
  _jsx('div', {
    style: { textAlign: 'center', margin: '24px 0' },
    children: _jsx('a', {
      href: href,
      style: {
        backgroundColor: '#1e5eff',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '14px',
        display: 'inline-block',
      },
      children: label,
    }),
  });
export const WelcomeEmail = ({ name, loginUrl }) =>
  _jsxs(EmailLayout, {
    title: 'Welcome to Clasptek',
    children: [
      _jsxs('h2', {
        style: { fontSize: '18px', color: '#ffffff' },
        children: ['Welcome, ', name, '!'],
      }),
      _jsx('p', {
        style: { fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6 },
        children:
          'Your Clasptek Prep Portal account is ready. Log in to start your personalized adaptive learning journey.',
      }),
      _jsx(EmailButton, { href: loginUrl, label: 'Log In to Portal' }),
    ],
  });
export const PasswordResetEmail = ({ resetUrl }) =>
  _jsxs(EmailLayout, {
    title: 'Password Reset Request',
    children: [
      _jsx('h2', {
        style: { fontSize: '18px', color: '#ffffff' },
        children: 'Reset Your Password',
      }),
      _jsx('p', {
        style: { fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6 },
        children:
          'We received a request to reset your password. Click below to choose a new password.',
      }),
      _jsx(EmailButton, { href: resetUrl, label: 'Reset Password' }),
    ],
  });
export const ResultsReadyEmail = ({ score, reportUrl }) =>
  _jsxs(EmailLayout, {
    title: 'Assessment Results Ready',
    children: [
      _jsx('h2', {
        style: { fontSize: '18px', color: '#ffffff' },
        children: 'Your Results Are Available',
      }),
      _jsxs('p', {
        style: { fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6 },
        children: [
          'Your assessment evaluation is complete. You achieved a score of ',
          _jsxs('strong', { children: [score, '%'] }),
          '.',
        ],
      }),
      _jsx(EmailButton, { href: reportUrl, label: 'View Detailed Report' }),
    ],
  });
