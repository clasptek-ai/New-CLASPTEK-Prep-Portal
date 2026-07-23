import React from 'react';
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}
export declare const Form: React.FC<FormProps>;
export declare const FormField: React.FC<{
  children: React.ReactNode;
  className?: string;
}>;
export declare const FormLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>>;
export declare const FormHint: React.FC<{
  children: React.ReactNode;
}>;
export declare const FormError: React.FC<{
  children: React.ReactNode;
}>;
export declare const FieldGroup: React.FC<{
  children: React.ReactNode;
}>;
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}
export declare const Input: React.ForwardRefExoticComponent<
  InputProps & React.RefAttributes<HTMLInputElement>
>;
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}
export declare const Textarea: React.ForwardRefExoticComponent<
  TextareaProps & React.RefAttributes<HTMLTextAreaElement>
>;
export declare const Checkbox: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
  }
>;
export declare const Switch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}>;
export declare const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>>;
