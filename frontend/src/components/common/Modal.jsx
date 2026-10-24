import { useEffect, useId, useRef } from 'react';
import { cn } from '../../utils/format';

/**
 * Accessible modal built with pure React and Tailwind CSS:
 * escape to close, click-outside to close, background scroll lock
 * and a focus shift into the panel.
 */
export default function Modal({
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
    }, 40);

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
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };

  return (
    <div className={cn('fixed inset-0 z-[90] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-4', className)}>
      <div
        className="animate-fade-in fixed inset-0 bg-[#0B1320]/75 backdrop-blur-md transition-opacity"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        aria-describedby={description ? descId : undefined}
        className={cn(
          'animate-pop relative w-full rounded-t-3xl bg-white shadow-[0_24px_60px_-12px_rgba(11,19,32,0.25)] border border-slate-900/10 sm:rounded-3xl overflow-hidden',
          sizes[size],
          panelClassName
        )}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8">
            <div className="min-w-0">
              {title && <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1320]">{title}</h2>}
              {description && (
                <p id={descId} className="mt-1 text-xs text-slate-500 font-medium">
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="w-8 h-8 -mr-2 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>
        )}
        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-6 py-6 sm:px-8 thin-scrollbar">{children}</div>
        {footer && <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-8">{footer}</div>}
      </div>
    </div>
  );
}