import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../utils/format';

/**
 * Menu dropdown. items: [{ label, onClick, tone, icon }]
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
      if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) {
        setOpen(false);
        return;
      }
      setPos({
        top: Math.round(r.bottom + 8),
        left: align === 'left' ? Math.round(r.left) : undefined,
        right: align === 'left' ? undefined : Math.round(window.innerWidth - r.right),
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

  useLayoutEffect(() => {
    if (!open || !pos || pos.corrected) return undefined;
    const el = panelRef.current;
    const trg = triggerRef.current;
    if (!el || !trg || pos.top === undefined) return undefined;

    const r = el.getBoundingClientRect();
    const boxTop = r.top - (el.offsetHeight - r.height) / 2;
    const boxLeft = r.left - (el.offsetWidth - r.width) / 2;
    const boxHeight = el.offsetHeight;
    const boxWidth = el.offsetWidth;

    const t = trg.getBoundingClientRect();
    const next = { ...pos, corrected: true };

    if (pos.flip) {
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
            'z-40 min-w-52 overflow-hidden rounded-2xl border border-slate-900/10 bg-white py-1.5 shadow-[0_16px_36px_-6px_rgba(11,19,32,0.18)] animate-pop',
            panelClassName
          )}
        >
          {items.map((item, i) =>
            item === '-' ? (
              <div key={`sep-${i}`} className="my-1.5 h-px bg-slate-100" role="separator" />
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
                  'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold transition-colors',
                  item.tone === 'danger'
                    ? 'text-[#BA1A1A] hover:bg-red-50'
                    : 'text-[#1B1B1D] hover:bg-amber-50/70 hover:text-[#904D00]'
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
