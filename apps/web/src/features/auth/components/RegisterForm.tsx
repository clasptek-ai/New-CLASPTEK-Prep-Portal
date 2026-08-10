'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Input, Button, Card } from '../../../components/ui/ui-components';
import { OnboardingState } from '@/features/onboarding/types/onboarding-state';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const registerStep1Schema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(5, 'Phone number is required'),
    country: z.string().min(1, 'Please select your country'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
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
  {
    id: 'IELTS_ACADEMIC',
    name: 'IELTS Academic',
    category: 'English Test Prep',
    icon: 'GraduationCap',
    badge: 'Popular',
  },
  {
    id: 'IELTS_GENERAL',
    name: 'IELTS General Training',
    category: 'Immigration & Work',
    icon: 'BookOpen',
    badge: 'Standard',
  },
  {
    id: 'TOEFL_IBT',
    name: 'TOEFL iBT',
    category: 'University Entrance',
    icon: 'Globe',
    badge: 'Intensive',
  },
  { id: 'SAT', name: 'SAT', category: 'Undergraduate Admission', icon: 'Award', badge: 'Academic' },
  {
    id: 'CELPIP',
    name: 'CELPIP',
    category: 'Canadian PR & Citizenship',
    icon: 'Sparkles',
    badge: 'Targeted',
  },
  {
    id: 'ENGLISH_PROFICIENCY',
    name: 'English Proficiency',
    category: 'General Skill Building',
    icon: 'Globe',
    badge: 'Foundational',
  },
];

export function RegisterForm() {
  const router = useRouter();
  const { register: registerAuth, isLoading, error } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProgramme, setSelectedProgramme] = useState<string>('IELTS_ACADEMIC');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit: _handleSubmit,
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
      const selectedProgObj = PROGRAMME_OPTIONS.find((p) => p.id === selectedProgramme);
      const targetProgrammeName = selectedProgObj?.name || 'IELTS Academic';

      await registerAuth({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        programme: targetProgrammeName,
        country: data.country,
      });

      const dynamicRegId = `CGA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const onboardingData = {
        state: OnboardingState.DIAGNOSTIC_REQUIRED,
        studentId: dynamicRegId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        targetExam: selectedProgObj?.name || 'IELTS Academic',
        selectedProgramme: selectedProgObj?.name || 'IELTS Academic',
        targetScore: selectedProgramme.includes('IELTS')
          ? '8.0 Band'
          : selectedProgramme === 'SAT'
            ? '1450'
            : '105',
        diagnosticCompleted: false,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('clasptek_onboarding_state', OnboardingState.DIAGNOSTIC_REQUIRED);
        localStorage.setItem('clasptek_onboarding_data', JSON.stringify(onboardingData));
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
    <Card className="w-full bg-[#0d1322] border border-slate-800/80 rounded-2xl p-5 sm:p-8 shadow-2xl shadow-black/60 backdrop-blur-sm">
      <div className="flex flex-col gap-6">
        {/* Header & Step Progress Indicator Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight m-0">
              {step === 1 ? 'Candidate Registration' : 'Target Examination'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-0">
              Registration takes less than 2 minutes.
            </p>
          </div>
          <span className="shrink-0 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider">
            Step {step} of 2
          </span>
        </div>

        {(error || submitError) && (
          <div
            role="alert"
            className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm font-medium flex items-start gap-2"
          >
            <span className="shrink-0">⚠️</span>
            <span>
              {submitError ||
                (typeof error === 'object'
                  ? error?.message || JSON.stringify(error)
                  : String(error))}
            </span>
          </div>
        )}

        {isSuccess && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-semibold text-center animate-in fade-in">
            🎉 Account created successfully! Launching your placement gateway...
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: CREATE YOUR ACCOUNT */
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                autoComplete="given-name"
                placeholder="First name"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last Name"
                autoComplete="family-name"
                placeholder="Last name"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="name@domain.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                autoComplete="tel"
                placeholder="+44 7000 000000"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <div>
                <label
                  htmlFor="country-select"
                  className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5"
                >
                  Country
                </label>
                <select
                  id="country-select"
                  {...register('country')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#161e2e] border border-slate-700 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  <span className="text-xs text-red-400 mt-1 block">{errors.country.message}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 chars"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Button
              type="button"
              onClick={handleNextStep}
              className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <span>Continue to Programme Selection</span>
              <ArrowRight size={18} />
            </Button>
          </div>
        ) : (
          /* STEP 2: CHOOSE YOUR PROGRAMME */
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs sm:text-sm text-slate-400 m-0">
                Select your target examination. Diagnostic assessment will be tailored to this
                programme.
              </p>
            </div>

            {/* Programme Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {PROGRAMME_OPTIONS.map((prog) => {
                const isSelected = selectedProgramme === prog.id;
                return (
                  <div
                    key={prog.id}
                    onClick={() => setSelectedProgramme(prog.id)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/20'
                        : 'bg-[#161e2e] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isSelected
                            ? 'text-blue-400 bg-blue-500/20'
                            : 'text-slate-400 bg-slate-800'
                        }`}
                      >
                        {prog.badge}
                      </span>
                      {isSelected && <CheckCircle2 size={16} className="text-blue-500" />}
                    </div>

                    <h4 className="m-0 text-sm font-bold text-white">{prog.name}</h4>
                    <p className="m-0 text-xs text-slate-400 mt-0.5">{prog.category}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </Button>
              <Button
                type="button"
                disabled={isLoading || isSuccess}
                onClick={handleCompleteRegistration}
                className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Creating Profile...' : 'Complete & Start Assessment'}</span>
                <CheckCircle2 size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default RegisterForm;
