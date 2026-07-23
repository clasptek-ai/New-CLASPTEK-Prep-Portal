import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Button } from '../Button/Button';
export const EmptyState = ({ title, description, actionLabel, onAction, icon, className = '' }) => {
  return _jsxs('div', {
    className: `flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white border border-[#c3c6d2] shadow-[0px_4px_20px_rgba(27,75,138,0.05)] ${className}`,
    children: [
      icon &&
        _jsx('div', {
          className: 'mb-4 text-[#00346b] p-3 rounded-full bg-[#f2f4f6]',
          children: icon,
        }),
      _jsx('h3', { className: 'text-lg font-bold text-[#191c1e] mb-2', children: title }),
      _jsx('p', {
        className: 'text-sm text-[#434750] max-w-md mb-6 leading-relaxed',
        children: description,
      }),
      actionLabel &&
        onAction &&
        _jsx(Button, { variant: 'primary', onClick: onAction, children: actionLabel }),
    ],
  });
};
