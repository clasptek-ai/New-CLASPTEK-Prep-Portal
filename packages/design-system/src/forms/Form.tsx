import React from 'react';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ children, className = '', ...props }) => (
  <form className={`space-y-4 ${className}`} {...props}>
    {children}
  </form>
);

export const FormField: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`flex flex-col gap-1.5 ${className}`}>{children}</div>;

export const FormLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <label
    className={`text-xs font-semibold uppercase tracking-wider text-[#434750] ${className}`}
    {...props}
  >
    {children}
  </label>
);

export const FormHint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] text-[#737781] mt-0.5">{children}</p>
);

export const FormError: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-medium text-[#ba1a1a] mt-0.5" role="alert">
    {children}
  </p>
);

export const FieldGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', hasError = false, label, id, ...props }, ref) => {
    const inputEl = (
      <input
        ref={ref}
        id={id}
        className={`px-3.5 py-2.5 bg-white border ${
          hasError
            ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20'
            : 'border-[#c3c6d2] focus:border-[#00346b] focus:ring-2 focus:ring-[#00346b]/20'
        } rounded-lg text-sm text-[#191c1e] placeholder-[#737781] focus:outline-none transition-all ${className}`}
        {...props}
      />
    );
    if (!label) return inputEl;
    return (
      <FormField>
        <FormLabel htmlFor={id}>{label}</FormLabel>
        {inputEl}
      </FormField>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', hasError = false, label, id, ...props }, ref) => {
    const textareaEl = (
      <textarea
        ref={ref}
        id={id}
        className={`px-3.5 py-2.5 bg-white border ${
          hasError
            ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20'
            : 'border-[#c3c6d2] focus:border-[#00346b] focus:ring-2 focus:ring-[#00346b]/20'
        } rounded-lg text-sm text-[#191c1e] placeholder-[#737781] focus:outline-none transition-all ${className}`}
        {...props}
      />
    );
    if (!label) return textareaEl;
    return (
      <FormField>
        <FormLabel htmlFor={id}>{label}</FormLabel>
        {textareaEl}
      </FormField>
    );
  }
);
Textarea.displayName = 'Textarea';

export const Checkbox: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
> = ({ label, className = '', ...props }) => (
  <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm text-[#191c1e]">
    <input
      type="checkbox"
      className={`rounded border-[#c3c6d2] bg-white text-[#00346b] focus:ring-[#00346b] ${className}`}
      {...props}
    />
    {label && <span>{label}</span>}
  </label>
);

export const Switch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}> = ({ checked, onChange, label }) => (
  <label className="inline-flex items-center gap-3 cursor-pointer">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-[#00346b]' : 'bg-[#e0e3e5]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
    {label && <span className="text-sm font-medium text-[#191c1e]">{label}</span>}
  </label>
);

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({
  children,
  className = '',
  label,
  id,
  ...props
}) => {
  const selectEl = (
    <select
      id={id}
      className={`px-3.5 py-2.5 bg-white border border-[#c3c6d2] rounded-lg text-sm text-[#191c1e] focus:outline-none focus:border-[#00346b] focus:ring-2 focus:ring-[#00346b]/20 transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  );
  if (!label) return selectEl;
  return (
    <FormField>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      {selectEl}
    </FormField>
  );
};
