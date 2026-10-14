import { motion } from 'motion/react';
import { cn } from '../../utils/format';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Create motion components for common HTML elements
const motionButton = motion.button;
const motionLink = motion.a;
const motionDiv = motion.div;

const styleVariants = {
  primary:
    'text-white btn-brand bg-[length:160%_160%] ' +
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
  // Text-like variant: must not inherit height/padding/radius from `sizes`.
  link: 'bg-transparent text-brand-700 hover:text-brand-900 underline-offset-4 hover:underline h-auto rounded-none px-0',
};

const sizes = {
  xs: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  sm: 'h-9 px-4 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-7 text-base gap-2 rounded-xl',
  icon: 'h-10 w-10 justify-center rounded-xl',
};

const tapVariants = { scale: 0.97 };
const hoverVariants = { scale: 1.02 };
const hoverLiftVariants = { y: -2, boxShadow: '0 8px 20px -6px rgba(16, 25, 43, 0.18)' };

export default function MotionButton({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  // Motion-specific props
  whileTap = tapVariants,
  whileHover,
  ...rest
}) {
  const isDisabled = disabled || loading;
  const isLink = variant === 'link';
  const reducedMotion = useReducedMotion();

  // Default hover variant based on button style
  const defaultHover = reducedMotion
    ? {}
    : variant === 'primary' || variant === 'danger' || variant === 'success' || variant === 'warning'
    ? hoverLiftVariants
    : hoverVariants;

  const motionProps = reducedMotion ? {} : { whileTap, whileHover: whileHover ?? defaultHover };

  // Select the appropriate motion component
  const MotionComponent = Tag === 'button' ? motionButton : Tag === 'a' ? motionLink : motionDiv;

  return (
    <MotionComponent
      type={Tag === 'button' ? type : undefined}
      disabled={Tag === 'button' ? isDisabled : undefined}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center font-semibold transition-all duration-200 select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        'disabled:pointer-events-none disabled:opacity-50',
        styleVariants[variant] || styleVariants.primary,
        !isLink && (sizes[size] || sizes.md),
        fullWidth && 'w-full',
        className
      )}
      {...motionProps}
      {...rest}
    >
      {loading && (
        <motion.span
          aria-hidden="true"
          className="h-4 w-4 shrink-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
              className="text-transparent"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
              strokeDashoffset="31.4"
              animate={{ strokeDashoffset: [0, 31.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </motion.span>
      )}
      {children}
    </MotionComponent>
  );
}