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
      // Prefer the first form field — landing on the header's close button is a
      // poor default for form modals. Fall back to the first focusable control.
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
        className="animate-fade-in fixed inset-0 bg-slate-950/55 backdrop-blur-[2px] transition-opacity"
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
          'animate-pop relative w-full rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 sm:rounded-2xl',
          sizes[size],
          panelClassName
        )}
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
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="-m-1.5 -mt-1 shrink-0 rounded-lg p-1.5 text-slate-500 transition-all duration-150 active:scale-95 hover:bg-slate-100 hover:text-slate-700"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 101.06-1.06L10 8.94 6.22 5.22z" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-5 py-5 sm:px-6 thin-scrollbar">{children}</div>
        {footer && <div className="border-t border-line bg-slate-50/70 px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}