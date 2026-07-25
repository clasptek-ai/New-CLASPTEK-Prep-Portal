import React from 'react';
import { useLoginForm } from './login.hooks';
import {
  FormField,
  FormLabel,
  FormMessage,
  SubmitButton,
} from '../../../components/ui/form/form-primitives';
import { Input, PasswordInput } from '../../../shared/ui/input/Input';
import { Alert, AlertDescription } from '../../../shared/ui/alert/Alert';

export function LoginForm() {
  const { form, serverError, isSubmitting, onSubmit } = useLoginForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <form method="POST" onSubmit={onSubmit} noValidate className="w-full space-y-4">
      {serverError && (
        <Alert variant="error" className="mb-4">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <FormField>
        <FormLabel htmlFor="login-email" required>
          Email Address
        </FormLabel>
        <Input
          id="login-email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormMessage id="login-email-error" error={errors.email?.message} />
      </FormField>

      <FormField>
        <FormLabel htmlFor="login-password" required>
          Password
        </FormLabel>
        <PasswordInput
          id="login-password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <FormMessage id="login-password-error" error={errors.password?.message} />
      </FormField>

      <SubmitButton isLoading={isSubmitting} fullWidth>
        Sign In to Portal
      </SubmitButton>
    </form>
  );
}
