import React from 'react';
import { cn } from '../../../lib/utils';
import { Input, PasswordInput, EmailInput } from '../../../shared/ui/input/Input';
import { Button } from '../../../shared/ui/button/Button';

export interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FormField({ children, className }: FormFieldProps) {
  return <div className={cn('space-y-1.5 mb-4', className)}>{children}</div>;
}

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: string;
  required?: boolean;
}

export function FormLabel({ children, htmlFor, required, className, ...props }: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-xs font-semibold text-slate-200 tracking-wide uppercase',
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

export interface FormMessageProps {
  id?: string;
  error?: string;
  className?: string;
}

export function FormMessage({ id, error, className }: FormMessageProps) {
  if (!error) return null;
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={cn('text-xs font-medium text-red-500 mt-1', className)}
    >
      {error}
    </p>
  );
}

export interface FormDescriptionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormDescription({ id, children, className }: FormDescriptionProps) {
  return (
    <p id={id} className={cn('text-xs text-slate-400 mt-1', className)}>
      {children}
    </p>
  );
}

export interface FormSubmitButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function SubmitButton({
  isLoading = false,
  children,
  className,
  fullWidth = true,
}: FormSubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="primary"
      size="md"
      isLoading={isLoading}
      fullWidth={fullWidth}
      className={cn('mt-2', className)}
    >
      {children}
    </Button>
  );
}

export { Input, PasswordInput, EmailInput };
