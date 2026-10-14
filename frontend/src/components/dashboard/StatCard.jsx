import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn, formatNumber } from '../../utils/format';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { variants, quickSpring } from '../../utils/motion';

/** Animated count-up for dashboard statistics. */
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const from = previous.current;
    const to = Number(target) || 0;
    if (from === to) {
      setValue(to);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
      else previous.current = to;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

const tones = {
  brand: 'bg-rose-50 text-rose-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
  info: 'bg-sky-50 text-sky-600',
  neutral: 'bg-zinc-100 text-zinc-500',
};

export default function StatCard({ label, value, suffix = '', prefix = '', hint, icon, tone = 'brand', trend, numeric = true, className = '' }) {
  const animated = useCountUp(numeric ? value : 0);
  const display = numeric ? formatNumber(animated) : value;
  const prefersReducedMotion = useReducedMotion();

  const cardVariants = prefersReducedMotion
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, hover: { y: 0 } }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
        hover: { y: -4, transition: quickSpring },
      };

  const iconVariants = prefersReducedMotion
    ? { initial: { scale: 1 }, animate: { scale: 1 }, hover: { scale: 1 } }
    : {
        initial: { scale: 1 },
        animate: { scale: 1 },
        hover: { scale: 1.1, rotate: 3, transition: quickSpring },
      };

  const numberVariants = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-card',
        className
      )}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      layout
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold tracking-[0.12em] text-zinc-500 uppercase">{label}</p>
          <motion.p
            className="mt-2 text-3xl leading-none font-bold tracking-tight text-zinc-900 tabular-nums"
            variants={numberVariants}
          >
            {prefix}
            {display}
            {suffix}
          </motion.p>
        </div>
        {icon && (
          <motion.span
            className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tones[tone])}
            variants={iconVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            {icon}
          </motion.span>
        )}
      </div>
      <div className="relative mt-3 flex items-center gap-2 text-xs">
        {trend && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold',
              trend.direction === 'down'
                ? 'bg-red-50 text-red-600'
                : trend.direction === 'flat'
                ? 'bg-slate-100 text-slate-500'
                : 'bg-emerald-50 text-emerald-600'
            )}
          >
            {trend.direction === 'up' && (
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                <path d="M6 2l4 5H8v3H4V7H2l4-5z" />
              </svg>
            )}
            {trend.direction === 'down' && (
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                <path d="M6 10L2 5h2V2h4v3h2l-4 5z" />
              </svg>
            )}
            {trend.label}
          </motion.span>
        )}
        {hint && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="truncate text-slate-500"
          >
            {hint}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}