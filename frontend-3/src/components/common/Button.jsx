import { cn } from '../../utils/format';

const variants = {
  primary:
    'bg-[#0B1320] text-white hover:bg-[#141C29] ' +
    'shadow-[0_2px_8px_rgba(11,19,32,0.15)] hover:shadow-[0_4px_16px_rgba(11,19,32,0.22)] ' +
    'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  secondary:
    'bg-[#D97706] text-white hover:bg-[#B45309] ' +
    'shadow-[0_2px_8px_rgba(217,119,6,0.2)] hover:shadow-[0_4px_16px_rgba(217,119,6,0.3)] ' +
    'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  outline:
    'bg-white text-[#1B1B1D] border border-slate-900/15 hover:border-slate-900/35 hover:bg-slate-50 ' +
    'shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-900/5 hover:text-[#0B1320] active:scale-[0.98]',
  glass:
    'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 ' +
    'shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0',
  success:
    'bg-[#059669] text-white hover:bg-[#047857] ' +
    'shadow-[0_2px_8px_rgba(5,150,105,0.2)] hover:shadow-[0_4px_16px_rgba(5,150,105,0.3)] ' +
    'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  danger:
    'bg-[#BA1A1A] text-white hover:bg-[#93000A] ' +
    'shadow-[0_2px_8px_rgba(186,26,26,0.2)] hover:-translate-y-0.5 active:translate-y-0',
  warning:
    'bg-[#FE932C] text-[#141C29] font-bold hover:bg-[#E5A93C] ' +
    'shadow-[0_2px_8px_rgba(254,147,44,0.2)] hover:-translate-y-0.5 active:translate-y-0',
  link:
    'bg-transparent text-[#D97706] hover:text-[#904D00] underline-offset-4 hover:underline h-auto rounded-none px-0',
};

const sizes = {
  xs: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  sm: 'h-9 px-3.5 text-xs font-semibold gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm font-semibold gap-2 rounded-xl',
  lg: 'h-12 px-7 text-base font-semibold gap-2 rounded-2xl',
  icon: 'h-10 w-10 justify-center rounded-xl',
};

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || loading;
  const isLink = variant === 'link';
  return (
    <Tag
      type={Tag === 'button' ? type : undefined}
      disabled={Tag === 'button' ? isDisabled : undefined}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center font-medium transition-all duration-200 select-none tracking-tight',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706]',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant] || variants.primary,
        !isLink && (sizes[size] || sizes.md),
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </Tag>
  );
}
