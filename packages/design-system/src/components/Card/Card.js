import { jsx as _jsx } from 'react/jsx-runtime';
export const Card = ({ children, variant = 'default', className = '', style, ...props }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'bordered':
        return 'bg-white border border-[#c3c6d2] shadow-sm text-[#191c1e]';
      case 'ghost':
        return 'bg-transparent border border-[#e0e3e5] text-[#191c1e]';
      case 'elevated':
        return 'bg-white border border-[#e0e3e5] shadow-lg text-[#191c1e]';
      case 'default':
      default:
        return 'bg-white border border-[#c3c6d2] shadow-[0px_4px_20px_rgba(27,75,138,0.05)] text-[#191c1e]';
    }
  };
  return _jsx('div', {
    className: `p-6 rounded-2xl transition-all ${getVariantStyles()} ${className}`,
    style: style,
    ...props,
    children: children,
  });
};
