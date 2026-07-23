import { jsx as _jsx } from 'react/jsx-runtime';
export const Badge = ({ children, variant = 'info', className = '' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]';
      case 'warning':
        return 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]';
      case 'danger':
        return 'bg-[#ffdad6] text-[#93000a] border-[#ffb4ab]';
      case 'secondary':
        return 'bg-[#ffdad6] text-[#bb0014] border-[#ffb4ab]';
      case 'neutral':
      case 'ghost':
        return 'bg-[#f2f4f6] text-[#434750] border-[#e0e3e5]';
      case 'primary':
        return 'bg-[#d6e3ff] text-[#001b3d] border-[#a9c7ff]';
      case 'info':
      default:
        return 'bg-[#e0f2fe] text-[#075985] border-[#bae6fd]';
    }
  };
  return _jsx('span', {
    className: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors ${getVariantStyles()} ${className}`,
    children: children,
  });
};
