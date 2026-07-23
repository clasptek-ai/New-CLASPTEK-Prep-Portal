import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React from 'react';
export const Form = ({ children, className = '', ...props }) =>
  _jsx('form', { className: `space-y-4 ${className}`, ...props, children: children });
export const FormField = ({ children, className = '' }) =>
  _jsx('div', { className: `flex flex-col gap-1.5 ${className}`, children: children });
export const FormLabel = ({ children, className = '', ...props }) =>
  _jsx('label', {
    className: `text-xs font-semibold uppercase tracking-wider text-[#434750] ${className}`,
    ...props,
    children: children,
  });
export const FormHint = ({ children }) =>
  _jsx('p', { className: 'text-[11px] text-[#737781] mt-0.5', children: children });
export const FormError = ({ children }) =>
  _jsx('p', {
    className: 'text-[11px] font-medium text-[#ba1a1a] mt-0.5',
    role: 'alert',
    children: children,
  });
export const FieldGroup = ({ children }) =>
  _jsx('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4', children: children });
export const Input = React.forwardRef(
  ({ className = '', hasError = false, label, id, ...props }, ref) => {
    const inputEl = _jsx('input', {
      ref: ref,
      id: id,
      className: `px-3.5 py-2.5 bg-white border ${
        hasError
          ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20'
          : 'border-[#c3c6d2] focus:border-[#00346b] focus:ring-2 focus:ring-[#00346b]/20'
      } rounded-lg text-sm text-[#191c1e] placeholder-[#737781] focus:outline-none transition-all ${className}`,
      ...props,
    });
    if (!label) return inputEl;
    return _jsxs(FormField, {
      children: [_jsx(FormLabel, { htmlFor: id, children: label }), inputEl],
    });
  }
);
Input.displayName = 'Input';
export const Textarea = React.forwardRef(
  ({ className = '', hasError = false, label, id, ...props }, ref) => {
    const textareaEl = _jsx('textarea', {
      ref: ref,
      id: id,
      className: `px-3.5 py-2.5 bg-white border ${
        hasError
          ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20'
          : 'border-[#c3c6d2] focus:border-[#00346b] focus:ring-2 focus:ring-[#00346b]/20'
      } rounded-lg text-sm text-[#191c1e] placeholder-[#737781] focus:outline-none transition-all ${className}`,
      ...props,
    });
    if (!label) return textareaEl;
    return _jsxs(FormField, {
      children: [_jsx(FormLabel, { htmlFor: id, children: label }), textareaEl],
    });
  }
);
Textarea.displayName = 'Textarea';
export const Checkbox = ({ label, className = '', ...props }) =>
  _jsxs('label', {
    className: 'inline-flex items-center gap-2.5 cursor-pointer text-sm text-[#191c1e]',
    children: [
      _jsx('input', {
        type: 'checkbox',
        className: `rounded border-[#c3c6d2] bg-white text-[#00346b] focus:ring-[#00346b] ${className}`,
        ...props,
      }),
      label && _jsx('span', { children: label }),
    ],
  });
export const Switch = ({ checked, onChange, label }) =>
  _jsxs('label', {
    className: 'inline-flex items-center gap-3 cursor-pointer',
    children: [
      _jsx('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': checked,
        onClick: () => onChange(!checked),
        className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[#00346b]' : 'bg-[#e0e3e5]'}`,
        children: _jsx('span', {
          className: `inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`,
        }),
      }),
      label && _jsx('span', { className: 'text-sm font-medium text-[#191c1e]', children: label }),
    ],
  });
export const Select = ({ children, className = '', label, id, ...props }) => {
  const selectEl = _jsx('select', {
    id: id,
    className: `px-3.5 py-2.5 bg-white border border-[#c3c6d2] rounded-lg text-sm text-[#191c1e] focus:outline-none focus:border-[#00346b] focus:ring-2 focus:ring-[#00346b]/20 transition-all ${className}`,
    ...props,
    children: children,
  });
  if (!label) return selectEl;
  return _jsxs(FormField, {
    children: [_jsx(FormLabel, { htmlFor: id, children: label }), selectEl],
  });
};
