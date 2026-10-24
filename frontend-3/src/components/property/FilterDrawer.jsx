import { useEffect, useRef } from 'react';
import PropertyFilters from './PropertyFilters';
import Button from '../common/Button';
import Icon from '../common/icons';
import { cn } from '../../utils/format';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Mobile filter bottom sheet with pure React and Tailwind CSS.
 * Open: `role="dialog"` + `aria-modal`, focus moves in, Tab cycles inside,
 * Escape closes.
 */
export default function FilterDrawer({ open, onClose, filters, onChange, onReset, resultCount }) {
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const wasOpen = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) {
        wasOpen.current = false;
        triggerRef.current?.focus?.();
      }
      triggerRef.current = null;
      return undefined;
    }

    wasOpen.current = true;
    triggerRef.current = document.activeElement;

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll(FOCUSABLE) || []).filter((el) => el.getClientRects().length > 0);

    const raf = requestAnimationFrame(() => focusables()[0]?.focus());

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (!panel.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    // If the viewport grows past the desktop breakpoint, the sheet is hidden by
    // CSS — close it so state, focus and the scroll lock never drift.
    const onResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) onCloseRef.current();
    };
    window.addEventListener('resize', onResize);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] lg:hidden" aria-hidden={!open}>
      <div
        className="animate-fade-in absolute inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div
        id="filter-drawer"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filter properties"
        className={cn(
          'animate-fade-up absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col rounded-t-2xl bg-white shadow-pop'
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-base font-semibold text-slate-900">Filters</p>
            {resultCount !== undefined && <p className="text-xs text-slate-500">{resultCount} matching listings</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all duration-150 active:scale-95 hover:bg-slate-100 hover:text-slate-700"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 thin-scrollbar">
          <PropertyFilters filters={filters} onChange={onChange} onReset={onReset} />
        </div>

        <div className="border-t border-line bg-white px-5 py-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={onClose} className="flex-[2]">
              Show results{resultCount !== undefined ? ` (${resultCount})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}