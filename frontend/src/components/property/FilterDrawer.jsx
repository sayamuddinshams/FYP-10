import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PropertyFilters from './PropertyFilters';
import MotionButton from '../common/MotionButton';
import Icon from '../common/icons';
import { cn } from '../../utils/format';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { variants } from '../../utils/motion';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Mobile filter bottom sheet with motion animations.
 * Open: `role="dialog"` + `aria-modal`, focus moves in, Tab cycles inside,
 * Escape closes. Closed: panel is `invisible` (leaves the tab order) and
 * focus returns to the element that opened it.
 */
export default function FilterDrawer({ open, onClose, filters, onChange, onReset, resultCount }) {
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const wasOpen = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const prefersReducedMotion = useReducedMotion();

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

  const sheetVariants = prefersReducedMotion
    ? {
        initial: { y: 0, opacity: 1 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 0, opacity: 1 },
        transition: { duration: 0.01 },
      }
    : {
        initial: { y: '100%', opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
        exit: { y: '100%', opacity: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
      };

  const overlayVariants = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0.01 } }
    : variants.fadeIn;

  return (
    <AnimatePresence>
      {open && (
        <div className={cn('fixed inset-0 z-[80] lg:hidden', open ? '' : 'pointer-events-none')} aria-hidden={!open}>
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={overlayVariants}
            className="absolute inset-0 bg-slate-950/50"
            onClick={onClose}
          />
          <motion.div
            id="filter-drawer"
            ref={panelRef}
            role={open ? 'dialog' : undefined}
            aria-modal={open || undefined}
            aria-label="Filter properties"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={sheetVariants}
            className={cn(
              'absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col rounded-t-2xl bg-white shadow-pop'
            )}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-base font-semibold text-slate-900">Filters</p>
                {resultCount !== undefined && <p className="text-xs text-slate-500">{resultCount} matching listings</p>}
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
              >
                <Icon name="x" className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 thin-scrollbar">
              <PropertyFilters filters={filters} onChange={onChange} onReset={onReset} />
            </div>

            <div className="border-t border-line bg-white px-5 py-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))]">
              <div className="flex gap-3">
                <MotionButton variant="outline" onClick={onReset} className="flex-1">
                  Reset
                </MotionButton>
                <MotionButton onClick={onClose} className="flex-[2]">
                  Show results{resultCount !== undefined ? ` (${resultCount})` : ''}
                </MotionButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}