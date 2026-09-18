'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../../../components/ui/ui-components';
import { OnboardingState } from '@/features/onboarding/types/onboarding-state';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Globe,
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
} from 'lucide-react';

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

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap size={20} />;
      case 'BookOpen':
        return <BookOpen size={20} />;
      case 'Award':
        return <Award size={20} />;
      case 'Sparkles':
        return <Sparkles size={20} />;
      case 'Globe':
      default:
        return <Globe size={20} />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        {/* Card Header & Step Progress Indicator */}
        <div className="flex flex-col gap-3 border-b border-(--border) pb-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-(--text-primary) tracking-tight m-0 flex items-center gap-2">
              {step === 1 ? 'Candidate Information' : 'Choose Examination Programme'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-(--brand-light) bg-(--brand)/10 border border-(--brand)/20 px-2.5 py-0.5 rounded-full tracking-wide">
                Step {step} of 2
              </span>
              <span className="text-xs font-semibold text-(--text-secondary)">
                {step === 1 ? '50%' : '100%'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-(--surface-2) rounded-full overflow-hidden">
            <div
              className={`h-full bg-(--brand) transition-all duration-500 ${
                step === 1 ? 'w-1/2' : 'w-full'
              }`}
            />
          </div>
        </div>

        {/* Global Error Banner */}
        {(error || submitError) && (
          <div
            role="alert"
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm font-semibold flex items-start gap-2.5 animate-in fade-in"
          >
            <span className="shrink-0 text-base">⚠️</span>
            <span>
              {submitError ||
                (typeof error === 'object'
                  ? error?.message || JSON.stringify(error)
                  : String(error))}
            </span>
          </div>
        )}

        {/* Success Banner */}
        {isSuccess && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm font-bold text-center animate-in fade-in flex items-center justify-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>Account created successfully! Launching your placement gateway...</span>
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: CREATE YOUR ACCOUNT */
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-(--text-secondary) mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                  />
                  <input
                    type="text"
                    autoComplete="given-name"
                    placeholder="First name"
                    {...register('firstName')}
                    className={`w-full pl-10 pr-4 h-11 rounded-lg bg-(--surface-1) border text-(--text-primary) placeholder:text-(--text-muted) text-sm outline-none transition-all ${
                      errors.firstName
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-(--border) focus:border-(--brand) focus:ring-1 focus:ring-(--brand)'
                    }`}
                  />
                </div>
                {errors.firstName?.message && (
                  <span className="text-xs font-medium text-red-400 mt-1 block">
                    {errors.firstName.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-(--text-secondary) mb-1.5">
                  Last Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                  />
                  <input
                    type="text"
                    autoComplete="family-name"
                    placeholder="Last name"
                    {...register('lastName')}
                    className={`w-full pl-10 pr-4 h-11 rounded-lg bg-(--surface-1) border text-(--text-primary) placeholder:text-(--text-muted) text-sm outline-none transition-all ${
                      errors.lastName
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-(--border) focus:border-(--brand) focus:ring-1 focus:ring-(--brand)'
                    }`}
                  />
                </div>
                {errors.lastName?.message && (
                  <span className="text-xs font-medium text-red-400 mt-1 block">
                    {errors.lastName.message}
                  </span>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-(--text-secondary) mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className={`w-full pl-10 pr-4 h-11 rounded-lg bg-(--surface-1) border text-(--text-primary) placeholder:text-(--text-muted) text-sm outline-none transition-all ${
                    errors.email
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-(--border) focus:border-(--brand) focus:ring-1 focus:ring-(--brand)'
                  }`}
                />
              </div>
              {errors.email?.message && (
                <span className="text-xs font-medium text-red-400 mt-1 block">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Phone & Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-(--text-secondary) mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                  />
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+44 7000 000000"
                    {...register('phone')}
                    className={`w-full pl-10 pr-4 h-11 rounded-lg bg-(--surface-1) border text-(--text-primary) placeholder:text-(--text-muted) text-sm outline-none transition-all ${
                      errors.phone
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-(--border) focus:border-(--brand) focus:ring-1 focus:ring-(--brand)'
                    }`}
                  />
                </div>
                {errors.phone?.message && (
                  <span className="text-xs font-medium text-red-400 mt-1 block">
                    {errors.phone.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="country-select"
                  className="block text-xs font-semibold text-(--text-secondary) mb-1.5"
                >
                  Country
                </label>
                <div className="relative">
                  <Globe
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none z-10"
                  />
                  <select
                    id="country-select"
                    {...register('country')}
                    className={`w-full pl-10 pr-8 h-11 rounded-lg bg-(--surface-1) border text-(--text-primary) text-sm outline-none transition-all appearance-none ${
                      errors.country
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-(--border) focus:border-(--brand) focus:ring-1 focus:ring-(--brand)'
                    }`}
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
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-(--text-muted) text-xs">
                    ▼
                  </div>
                </div>
                {errors.country?.message && (
                  <span className="text-xs font-medium text-red-400 mt-1 block">
                    {errors.country.message}
                  </span>
                )}
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-(--text-secondary) mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                  />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 chars"
                    {...register('password')}
                    className={`w-full pl-10 pr-4 h-11 rounded-lg bg-(--surface-1) border text-(--text-primary) placeholder:text-(--text-muted) text-sm outline-none transition-all ${
                      errors.password
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-(--border) focus:border-(--brand) focus:ring-1 focus:ring-(--brand)'
                    }`}
                  />
                </div>
                {errors.password?.message && (
                  <span className="text-xs font-medium text-red-400 mt-1 block">
                    {errors.password.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-(--text-secondary) mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                  />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    {...register('confirmPassword')}
                    className={`w-full pl-10 pr-4 h-11 rounded-lg bg-(--surface-1) border text-(--text-primary) placeholder:text-(--text-muted) text-sm outline-none transition-all ${
                      errors.confirmPassword
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-(--border) focus:border-(--brand) focus:ring-1 focus:ring-(--brand)'
                    }`}
                  />
                </div>
                {errors.confirmPassword?.message && (
                  <span className="text-xs font-medium text-red-400 mt-1 block">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>
            </div>

            {/* CTA Button Component & Preview */}
            <div className="mt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full h-11 bg-(--brand) hover:bg-(--brand-hover) text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-(--brand) cursor-pointer shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>

              <div className="text-center text-xs text-(--text-secondary) flex items-center justify-center gap-1.5">
                <span className="text-(--text-muted)">Next:</span>
                <span>Choose Your Examination Programme</span>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: CHOOSE YOUR PROGRAMME */
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs sm:text-sm text-(--text-secondary) m-0 leading-relaxed">
                Select your primary target examination. Diagnostic assessment and learning metrics
                will be tailored to this programme.
              </p>
            </div>

            {/* Programme Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-95 overflow-y-auto pr-1">
              {PROGRAMME_OPTIONS.map((prog) => {
                const isSelected = selectedProgramme === prog.id;
                return (
                  <div
                    key={prog.id}
                    onClick={() => setSelectedProgramme(prog.id)}
                    className={`p-3.5 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-(--brand)/10 border-(--brand) shadow-sm ring-1 ring-(--brand)'
                        : 'bg-(--surface-1) border-(--border) hover:border-(--border-strong) hover:bg-(--surface-2)'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isSelected
                              ? 'bg-(--brand)/20 text-(--brand-light)'
                              : 'bg-(--surface-2) text-(--text-secondary)'
                          }`}
                        >
                          {renderIcon(prog.icon)}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isSelected
                              ? 'text-(--brand-light) bg-(--brand)/20'
                              : 'text-(--text-muted) bg-(--surface-2)'
                          }`}
                        >
                          {prog.badge}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 size={16} className="text-(--brand-light) shrink-0" />}
                    </div>

                    <h4 className="m-0 text-sm font-bold text-(--text-primary) tracking-tight">{prog.name}</h4>
                    <p className="m-0 text-xs text-(--text-secondary) mt-0.5">{prog.category}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 h-11 bg-(--surface-2) hover:bg-(--surface-1) text-(--text-primary) font-bold text-sm rounded-lg border border-(--border) transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-(--brand) cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isLoading || isSuccess}
                onClick={handleCompleteRegistration}
                className="flex-2 h-11 bg-[#003c90] hover:bg-[#002c6b] text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#003c90] cursor-pointer shadow-sm"
              >
                <span>{isLoading ? 'Creating Account...' : 'CREATE ACCOUNT'}</span>
                <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterForm;
