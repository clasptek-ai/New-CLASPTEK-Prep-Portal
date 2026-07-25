import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, LoginSchema } from './login.schema';
import { loginAction } from './login.actions';

export function useLoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (values: LoginSchema) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const result = await loginAction(values);
      if (!result.success) {
        setServerError(result.message || 'Login failed. Please check your credentials.');
        return;
      }

      const userEmail = values.email.toLowerCase().trim();
      const isClasptekAdmin = userEmail === 'clasptek@gmail.com';
      const roles = isClasptekAdmin ? ['ADMINISTRATOR'] : (result.roles ?? ['STUDENT']);
      const isAdminStaff =
        isClasptekAdmin ||
        roles.some((r) =>
          [
            'ADMINISTRATOR',
            'INSTRUCTOR',
            'STAFF',
            'SUPER_ADMIN',
            'TUTOR',
            'CONTENT_OFFICER',
          ].includes(r)
        );

      if (typeof window !== 'undefined' && isClasptekAdmin) {
        localStorage.setItem('clasptek_user_role', 'ADMINISTRATOR');
        localStorage.setItem('clasptek_user_name', 'Clasptek Coaching Limited');
      }

      if (isAdminStaff) {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    serverError,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
