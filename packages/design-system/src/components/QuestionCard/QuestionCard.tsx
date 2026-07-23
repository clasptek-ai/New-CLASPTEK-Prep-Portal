import React from 'react';
import { Card } from '../Card/Card';

export interface Option {
  id: string;
  label: string;
  text: string;
}

export interface QuestionCardProps {
  questionNumber: number;
  stem: string;
  options: Option[];
  selectedOptionId?: string;
  onSelectOption?: (id: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionNumber,
  stem,
  options,
  selectedOptionId,
  onSelectOption,
}) => (
  <Card variant="bordered" className="p-6">
    <div className="text-xs uppercase tracking-wider font-semibold text-indigo-400 mb-2">
      Question {questionNumber}
    </div>
    <h3 className="text-base font-semibold text-slate-100 mb-6 leading-relaxed">{stem}</h3>
    <div className="space-y-3">
      {options.map((opt) => {
        const isSelected = selectedOptionId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectOption?.(opt.id)}
            className={`w-full p-4 rounded-xl border text-left transition-colors flex items-center gap-4 ${
              isSelected
                ? 'bg-indigo-950/40 border-indigo-500 text-white'
                : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {opt.label}
            </span>
            <span className="text-sm font-medium">{opt.text}</span>
          </button>
        );
      })}
    </div>
  </Card>
);
