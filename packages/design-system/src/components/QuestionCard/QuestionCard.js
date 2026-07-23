import { jsxs as _jsxs, jsx as _jsx } from 'react/jsx-runtime';
import { Card } from '../Card/Card';
export const QuestionCard = ({ questionNumber, stem, options, selectedOptionId, onSelectOption }) =>
  _jsxs(Card, {
    variant: 'bordered',
    className: 'p-6',
    children: [
      _jsxs('div', {
        className: 'text-xs uppercase tracking-wider font-semibold text-indigo-400 mb-2',
        children: ['Question ', questionNumber],
      }),
      _jsx('h3', {
        className: 'text-base font-semibold text-slate-100 mb-6 leading-relaxed',
        children: stem,
      }),
      _jsx('div', {
        className: 'space-y-3',
        children: options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          return _jsxs(
            'button',
            {
              type: 'button',
              onClick: () => onSelectOption?.(opt.id),
              className: `w-full p-4 rounded-xl border text-left transition-colors flex items-center gap-4 ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 text-white'
                  : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
              }`,
              children: [
                _jsx('span', {
                  className: `flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`,
                  children: opt.label,
                }),
                _jsx('span', { className: 'text-sm font-medium', children: opt.text }),
              ],
            },
            opt.id
          );
        }),
      }),
    ],
  });
