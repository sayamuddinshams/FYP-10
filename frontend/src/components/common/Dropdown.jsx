import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../utils/format';

/**
 * Menu dropdown. items: [{ label, onClick, tone, icon }]
 *
 * The panel is positioned against the viewport (fixed) rather than the trigger,
 * so menus opened from inside scrolling containers (e.g. DataTable's
 * `overflow-x-auto`) are never clipped or forced to show a stray scrollbar.
 * It re-measures on scroll/resize and closes when the trigger leaves the screen.
 */
export default function Dropdown({ trigger, items = [], align = 'right', className = '', panelClassName = '', ariaLabel = 'Menu' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target) && !panelRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return undefined;

    const place = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Trigger scrolled out of view — the menu would float detached, so dismiss it.
      if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) {
        setOpen(false);
        return;
      }
      setPos({
        top: Math.round(r.bottom + 8),
        left: align === 'left' ? Math.round(r.left) : undefined,
        right: align === 'left' ? undefined : Math.round(window.innerWidth - r.right),
        // Flip above the trigger when there is not enough room below.
        bottom: window.innerHeight - Math.round(r.top) + 8,
        flip: r.bottom + 8 + (panelRef.current?.offsetHeight || 200) > window.innerHeight,
        corrected: false,
      });
    };

    place();
    const handler = () => place();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [open, align]);

  /**
   * Viewport coordinates are only valid while the panel's containing block is
   * the viewport. An ancestor with `backdrop-blur`, `filter` or a transform
   * (e.g. the sticky dashboard header, a mobile bottom bar) silently becomes
   * that containing block and shifts the menu. Measure the box we actually
   * rendered and offset it by the difference — once per placement.
   */
  useLayoutEffect(() => {
    if (!open || !pos || pos.corrected) return undefined;
    const el = panelRef.current;
    const trg = triggerRef.current;
    if (!el || !trg || pos.top === undefined) return undefined;

    // Recover the layout box: `animate-pop` scales the panel about its centre,
    // so the painted rect is smaller than the layout box mid-animation.
    const r = el.getBoundingClientRect();
    const boxTop = r.top - (el.offsetHeight - r.height) / 2;
    const boxLeft = r.left - (el.offsetWidth - r.width) / 2;
    const boxHeight = el.offsetHeight;
    const boxWidth = el.offsetWidth;

    const t = trg.getBoundingClientRect();
    const next = { ...pos, corrected: true };

    if (pos.flip) {
      // Anchored by `bottom`; increasing it moves the panel up.
      const delta = t.top - 8 - (boxTop + boxHeight);
      if (Math.abs(delta) > 1) next.bottom = pos.bottom - delta;
    } else {
      const delta = t.bottom + 8 - boxTop;
      if (Math.abs(delta) > 1) next.top = pos.top + delta;
    }

    if (align === 'left') {
      const delta = t.left - boxLeft;
      if (Math.abs(delta) > 1) next.left = pos.left + delta;
    } else {
      const delta = t.right - (boxLeft + boxWidth);
      if (Math.abs(delta) > 1) next.right = pos.right - delta;
    }

    setPos(next);
    return undefined;
  }, [open, pos, align]);

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <div
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        {trigger}
      </div>
      {open && (
        <div
          ref={panelRef}
          role="menu"
          style={{
            position: 'fixed',
            top: pos?.flip ? undefined : pos?.top,
            bottom: pos?.flip ? pos?.bottom : undefined,
            left: pos?.left,
            right: pos?.right,
          }}
          className={cn(
            'z-40 min-w-48 overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-xl shadow-slate-900/10 animate-pop',
            panelClassName
          )}
        >
          {items.map((item, i) =>
            item === '-' ? (
              <div key={`sep-${i}`} className="my-1.5 h-px bg-line" role="separator" />
            ) : (
              <button
                key={`${item.label}-${i}`}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium transition-colors',
                  item.tone === 'danger'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-slate-700 hover:bg-brand-50 hover:text-brand-700'
                )}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
