import { cn } from '../../utils/format';

const variants = {
  primary:
    'text-white bg-[linear-gradient(135deg,#283f67_0%,#2e4a7d_55%,#385c9a_100%)] bg-[length:160%_160%] ' +
    'shadow-[0_1px_2px_rgba(11,26,48,.25),0_8px_20px_-8px_rgba(11,26,48,.45)] ' +
    'hover:bg-right hover:shadow-[0_2px_4px_rgba(11,26,48,.25),0_14px_28px_-10px_rgba(11,26,48,.5)] hover:-translate-y-px ' +
    'active:translate-y-0 active:bg-[length:200%_200%]',
  secondary:
    'bg-brand-50 text-brand-800 border border-brand-100 hover:bg-brand-100 hover:border-brand-200 ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_1px_2px_rgba(16,25,43,.04)]',
  outline:
    'bg-white text-brand-900 border border-line hover:border-brand-300 hover:bg-brand-50/60 ' +
    'shadow-[0_1px_2px_rgba(16,25,43,.04)] hover:shadow-soft',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger:
    'bg-[linear-gradient(135deg,#dc2626_0%,#b91c1c_100%)] text-white ' +
    'shadow-[0_1px_2px_rgba(127,29,29,.25),0_8px_18px_-8px_rgba(127,29,29,.4)] ' +
    'hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(127,29,29,.25),0_14px_26px_-10px_rgba(127,29,29,.45)] active:translate-y-0',
  success:
    'bg-[linear-gradient(135deg,#059669_0%,#047857_100%)] text-white ' +
    'shadow-[0_1px_2px_rgba(6,95,70,.25),0_8px_18px_-8px_rgba(6,95,70,.4)] ' +
    'hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(6,95,70,.25),0_14px_26px_-10px_rgba(6,95,70,.45)] active:translate-y-0',
  warning:
    'bg-[linear-gradient(135deg,#f59e0b_0%,#d97706_100%)] text-white ' +
    'shadow-[0_1px_2px_rgba(180,83,9,.25),0_8px_18px_-8px_rgba(180,83,9,.4)] ' +
    'hover:-translate-y-px active:translate-y-0',
  link: 'bg-transparent text-brand-700 hover:text-brand-900 underline-offset-4 hover:underline px-0',
};

const sizes = {
  xs: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  sm: 'h-9 px-4 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-7 text-base gap-2 rounded-xl',
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
  return (
    <Tag
      type={Tag === 'button' ? type : undefined}
      disabled={Tag === 'button' ? isDisabled : undefined}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
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
