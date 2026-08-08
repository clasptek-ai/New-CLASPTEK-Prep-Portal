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

      if (typeof window !== 'undefined') {
        // Purge stale local storage items from previous browser sessions/users
        localStorage.removeItem('clasptek_onboarding_data');
        localStorage.removeItem('clasptek_onboarding_state');
        localStorage.removeItem('clasptek_user_id');
        localStorage.removeItem('clasptek_user_name');
        localStorage.removeItem('clasptek_user_role');

        const activeUserId = result.userId || result.user?.id || result.session?.user?.id;
        if (activeUserId) {
          localStorage.setItem('clasptek_user_id', activeUserId);
        }
      }

      if (result.session) {
        try {
          const { getSupabaseBrowserClient } = await import('@/lib/supabase-browser');
          const supabase = getSupabaseBrowserClient();
          await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          });
        } catch (sessionErr) {
          console.error('[LOGIN_HOOK] Failed to sync browser session:', sessionErr);
        }
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

      if (typeof window !== 'undefined') {
        if (isClasptekAdmin) {
          localStorage.setItem('clasptek_user_role', 'ADMINISTRATOR');
          localStorage.setItem('clasptek_user_name', 'Clasptek Coaching Limited');
        } else {
          localStorage.setItem('clasptek_user_role', roles[0] || 'STUDENT');
        }
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
