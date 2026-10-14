import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useId, useRef } from 'react';
import { cn } from '../../utils/format';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.97 },
};

const transition = {
  type: 'spring',
  damping: 25,
  stiffness: 300,
  duration: 0.3,
};

export default function MotionModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  showClose = true,
  className = '',
  panelClassName = '',
}) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const descId = useId();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    previouslyFocused.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target =
        panel.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled])') ||
        panel.querySelector('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
      target?.focus();
    }, reducedMotion ? 0 : 200);

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const items = panelRef.current.querySelectorAll(
          'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href]'
        );
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      clearTimeout(timer);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose, reducedMotion]);

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };

  return (
    <AnimatePresence>
      {open && (
        <div className={cn('fixed inset-0 z-[90] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-4', className)}>
          <motion.div
            className="fixed inset-0 bg-slate-950/55 backdrop-blur-[2px]"
            onClick={closeOnOverlay ? onClose : undefined}
            aria-hidden="true"
            initial={reducedMotion ? 'animate' : 'initial'}
            animate="animate"
            exit="exit"
            variants={backdropVariants}
            transition={transition}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
            aria-describedby={description ? descId : undefined}
            className={cn(
              'relative w-full rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 sm:rounded-2xl',
              sizes[size],
              panelClassName
            )}
            initial={reducedMotion ? 'animate' : 'initial'}
            animate="animate"
            exit="exit"
            variants={panelVariants}
            transition={transition}
          >
            {(title || showClose) && (
              <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  {title && <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>}
                  {description && (
                    <p id={descId} className="mt-1 text-sm text-slate-500">
                      {description}
                    </p>
                  )}
                </div>
                {showClose && (
                  <motion.button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="-m-1.5 -mt-1 shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.22 5.22z" />
                    </svg>
                  </motion.button>
                )}
              </div>
            )}
            <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-5 py-5 sm:px-6 thin-scrollbar">{children}</div>
            {footer && <div className="border-t border-line bg-slate-50/70 px-5 py-4 sm:px-6">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React from 'react';