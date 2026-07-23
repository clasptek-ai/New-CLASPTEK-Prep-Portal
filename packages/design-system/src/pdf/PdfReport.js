import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
export const PdfLayout = ({
  title,
  subtitle,
  generatedAt = new Date().toISOString(),
  verificationCode = 'VER-2026-CLASPTEK',
  children,
}) =>
  _jsxs('div', {
    className: 'p-8 bg-white text-slate-900 font-sans max-w-4xl mx-auto print:p-0',
    children: [
      _jsxs('div', {
        className: 'flex justify-between items-start border-b border-slate-300 pb-4 mb-6',
        children: [
          _jsxs('div', {
            children: [
              _jsx('h1', {
                className: 'text-2xl font-bold text-blue-900 tracking-tight',
                children: 'CLASPTEK PREP PORTAL',
              }),
              _jsx('h2', { className: 'text-lg font-semibold text-slate-700', children: title }),
              subtitle && _jsx('p', { className: 'text-xs text-slate-500', children: subtitle }),
            ],
          }),
          _jsxs('div', {
            className: 'text-right text-[10px] text-slate-500',
            children: [
              _jsxs('div', { children: ['Generated: ', new Date(generatedAt).toLocaleString()] }),
              _jsxs('div', { className: 'font-mono mt-1', children: ['Ref: ', verificationCode] }),
            ],
          }),
        ],
      }),
      _jsx('div', { className: 'my-6', children: children }),
      _jsxs('div', {
        className:
          'flex justify-between items-center border-t border-slate-300 pt-4 mt-8 text-[10px] text-slate-500',
        children: [
          _jsx('span', { children: 'Confidential Official Academic Report' }),
          _jsx('span', { children: 'Page 1 of 1' }),
        ],
      }),
    ],
  });
