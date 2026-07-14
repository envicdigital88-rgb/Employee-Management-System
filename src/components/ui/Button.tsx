import React from 'react';
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';
const VARIANTS: Record<Variant, string> = {
  primary:
  'bg-accent text-canvas font-semibold hover:bg-accent-deep shadow-[0_0_20px_-6px_rgba(34,211,238,0.6)]',
  secondary:
  'bg-surface-raised text-content border border-line hover:bg-surface-hover',
  ghost: 'text-content-muted hover:text-content hover:bg-white/5',
  danger: 'bg-red-500/90 text-white font-semibold hover:bg-red-500'
};
const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2'
};
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}
export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}>
      
      {children}
    </button>);

}