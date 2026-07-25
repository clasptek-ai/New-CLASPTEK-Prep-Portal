'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Input, Button, Card } from '../../../components/ui/ui-components';
import { LogoBadge } from '../../../shared/ui/logo/LogoBadge';
import { OnboardingState } from '@/features/onboarding/types/onboarding-state';
import { adminUsersService } from '../../../services/admin/users.service';
import { GraduationCap, BookOpen, Globe, Award, Sparkles, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const registerStep1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  country: z.string().min(1, 'Please select your country'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type Step1FormData = z.infer<typeof registerStep1Schema>;

export interface ProgrammeChoice {
  id: string;
  name: string;
  category: string;
  icon: string;
  badge: string;
}

export const PROGRAMME_OPTIONS: ProgrammeChoice[] = [
  { id: 'IELTS_ACADEMIC', name: 'IELTS Academic', category: 'English Test Prep', icon: 'GraduationCap', badge: 'Popular' },
  { id: 'IELTS_GENERAL', name: 'IELTS General Training', category: 'Immigration & Work', icon: 'BookOpen', badge: 'Standard' },
  { id: 'TOEFL_IBT', name: 'TOEFL iBT', category: 'University Entrance', icon: 'Globe', badge: 'Intensive' },
  { id: 'SAT', name: 'SAT', category: 'Undergraduate Admission', icon: 'Award', badge: 'Academic' },
  { id: 'CELPIP', name: 'CELPIP', category: 'Canadian PR & Citizenship', icon: 'Sparkles', badge: 'Targeted' },
  { id: 'ENGLISH_PROFICIENCY', name: 'English Proficiency', category: 'General Skill Building', icon: 'Globe', badge: 'Foundational' },
];

export function RegisterForm() {
  const router = useRouter();
  const { register: registerAuth, isLoading, error } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProgramme, setSelectedProgramme] = useState<string>('IELTS_ACADEMIC');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Requirement: Registration Details MUST be 100% empty by default (no pre-filled or placeholder values)
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<Step1FormData>({
    resolver: zodResolver(registerStep1Schema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleNextStep = async () => {
    const valid = await trigger();
    if (valid) {
      setStep(2);
    }
  };

  const handleCompleteRegistration = async () => {
    setSubmitError(null);
    const data = getValues();
    try {
      await registerAuth({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      const selectedProgObj = PROGRAMME_OPTIONS.find((p) => p.id === selectedProgramme);

      const onboardingData = {
        state: OnboardingState.DIAGNOSTIC_REQUIRED,
        studentId: 'CGA-2026-000245',
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        targetExam: selectedProgObj?.name || 'IELTS Academic',
        selectedProgramme: selectedProgObj?.name || 'IELTS Academic',
        targetScore: selectedProgramme.includes('IELTS') ? '8.0 Band' : selectedProgramme === 'SAT' ? '1450' : '105',
        diagnosticCompleted: false,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('clasptek_onboarding_state', OnboardingState.DIAGNOSTIC_REQUIRED);
        localStorage.setItem('clasptek_onboarding_data', JSON.stringify(onboardingData));
      }

      // Sync into Admin Student Directory
      try {
        await adminUsersService.addStudent({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone || '+44 7700 900000',
          role: 'STUDENT',
          status: 'ACTIVE',
          programme: selectedProgObj?.name || 'IELTS Academic',
          practiceUnlocked: true,
          mockUnlocked: true,
        });
      } catch (e) {
        console.error('Failed sync to student directory', e);
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/student/welcome');
      }, 800);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
        backgroundColor: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '2rem',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Step Indicator with LogoBadge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.07)', paddingBottom: '1rem' }}>
          <LogoBadge size="sm" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
            Step {step} of 2
          </span>
        </div>

        {(error || submitError) && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '0.85rem',
            }}
          >
            {submitError || (typeof error === 'object' ? error?.message || JSON.stringify(error) : String(error))}
          </div>
        )}

        {isSuccess && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '8px',
              color: '#34d399',
              fontSize: '0.875rem',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            🎉 Account created successfully! Redirecting to your learning gateway...
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: CREATE YOUR ACCOUNT (All Inputs Empty by Default) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                Create Your Account
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Enter your personal information to get started.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <Input
                label="First Name"
                autoComplete="off"
                placeholder=""
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last Name"
                autoComplete="off"
                placeholder=""
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              autoComplete="off"
              placeholder=""
              error={errors.email?.message}
              {...register('email')}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <Input
                label="Phone Number"
                autoComplete="off"
                placeholder=""
                error={errors.phone?.message}
                {...register('phone')}
              />
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Country
                </label>
                <select
                  {...register('country')}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#161e2e',
                    border: errors.country ? '1px solid #ef4444' : '1px solid #1e293b',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                >
                  <option value="">Select your country</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                  <option value="India">India</option>
                  <option value="Australia">Australia</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Other">Other Country</option>
                </select>
                {errors.country?.message && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
                    {errors.country.message}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <Input
                label="Password"
                type="password"
                autoComplete="off"
                placeholder=""
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm Password"
                type="password"
                autoComplete="off"
                placeholder=""
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Button
              type="button"
              onClick={handleNextStep}
              style={{ marginTop: '0.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        ) : (
          /* STEP 2: CHOOSE YOUR PROGRAMME */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                Choose Your Programme
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Select the programme you want to prepare for.
              </p>
            </div>

            {/* Programme Cards Grid (6 Choices) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto' }}>
              {PROGRAMME_OPTIONS.map((prog) => {
                const isSelected = selectedProgramme === prog.id;
                return (
                  <div
                    key={prog.id}
                    onClick={() => setSelectedProgramme(prog.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.15)' : '#161e2e',
                      border: isSelected ? '2px solid #2563eb' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: isSelected ? '#3b82f6' : '#94a3b8',
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        {prog.badge}
                      </span>
                      {isSelected && <CheckCircle2 size={16} color="#3b82f6" />}
                    </div>

                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                      {prog.name}
                    </h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                      {prog.category}
                    </p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.5rem' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </Button>
              <Button
                type="button"
                disabled={isLoading || isSuccess}
                onClick={handleCompleteRegistration}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                <CheckCircle2 size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default RegisterForm;
