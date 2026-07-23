import { jsx as _jsx } from 'react/jsx-runtime';
export const Skeleton = ({ className = '', variant = 'rectangular', width, height }) => {
  const variantClasses =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'text'
        ? 'rounded-md h-4 my-1'
        : 'rounded-xl';
  return _jsx('div', {
    className: `animate-pulse bg-[#e6e8ea] ${variantClasses} ${className}`,
    style: {
      width: width !== undefined ? width : undefined,
      height: height !== undefined ? height : undefined,
    },
  });
};
