'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { PasswordValidationResult } from '@/lib/auth/reset-password';

interface PasswordStrengthProps {
  validation: PasswordValidationResult;
  passwordLength: number;
}

export function PasswordStrength({ validation, passwordLength }: PasswordStrengthProps) {
  if (passwordLength === 0) return null;

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 1:
      case 2:
        return { label: 'Weak', color: 'text-rose-400', barBg: 'bg-rose-500' };
      case 3:
        return { label: 'Fair', color: 'text-amber-400', barBg: 'bg-amber-500' };
      case 4:
        return { label: 'Good', color: 'text-(--brand-light)', barBg: 'bg-(--brand)' };
      case 5:
        return { label: 'Excellent', color: 'text-emerald-400', barBg: 'bg-emerald-500' };
      default:
        return { label: 'Too Short', color: 'text-(--text-muted)', barBg: 'bg-(--surface-2)' };
    }
  };

  const strength = getStrengthLabel(validation.score);

  const checklistItems = [
    { label: '8+ characters', met: validation.hasMinLength },
    { label: 'Uppercase letter (A-Z)', met: validation.hasUppercase },
    { label: 'Lowercase letter (a-z)', met: validation.hasLowercase },
    { label: 'Number (0-9)', met: validation.hasNumber },
    { label: 'Special character (!@#$%^&*)', met: validation.hasSpecialChar },
  ];

  return (
    <div className="space-y-3 pt-1 text-xs">
      {/* Strength Bar & Label */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-(--text-secondary)">Password Strength:</span>
        <span className={`font-bold ${strength.color}`}>{strength.label}</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 h-1.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-full rounded-full transition-all duration-300 ${
              level <= validation.score ? strength.barBg : 'bg-(--surface-2)'
            }`}
          />
        ))}
      </div>

      {/* Requirements Checklist */}
      <div className="bg-(--surface-1) p-3 rounded-lg border border-(--border) space-y-1.5">
        <span className="block text-[11px] font-semibold text-(--text-secondary) mb-1">
          Requirements Checklist:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {checklistItems.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-1.5">
              {item.met ? (
                <Check size={14} className="text-emerald-400 shrink-0" />
              ) : (
                <X size={14} className="text-(--text-muted) shrink-0" />
              )}
              <span className={item.met ? 'text-emerald-400 font-medium' : 'text-(--text-muted)'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PasswordStrength;
