import React from 'react';
import { Input, PasswordInput } from './Input';

export default {
  title: 'Forms/Input',
  component: Input,
};

export const Default = () => <Input label="Full Name" placeholder="John Doe" />;
export const WithError = () => <Input label="Email" error="Invalid email address" />;
export const Password = () => <PasswordInput label="Password" />;
