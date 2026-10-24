import { useCallback, useEffect, useRef, useState } from 'react';
import ImageWithFallback from '../common/ImageWithFallback';
import Icon from '../common/icons';
import { cn } from '../../utils/format';

/**
 * Gallery with thumbnails, full-screen viewer, keyboard navigation and mobile swipe.
 *
 * A11y: every control carries an aria-label, the position counter is announced
 * through a polite live region, thumbnails expose `aria-current`, and focus moves
 * into the full-screen viewer and back to the trigger when it closes.
 */
export default function PropertyGallery({ images = [], title = '' }) {
  const list = images.length ? images : [];
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const closeRef = useRef(null);
  const returnFocusRef = useRef(null);

  const next = useCallback(() => setActive((i) => (list.length ? (i + 1) % list.length : 0)), [list.length]);
  const prev = useCallback(() => setActive((i) => (list.length ? (i - 1 + list.length) % list.length : 0)), [list.length]);

  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [fullscreen, next, prev]);

  // Move focus into the viewer when it opens, restore it when it closes.
  useEffect(() => {
    if (!fullscreen) return undefined;
    returnFocusRef.current = document.activeElement;
    closeRef.current?.focus();
    return () => {
      const target = returnFocusRef.current;
      returnFocusRef.current = null;
      target?.focus?.();
    };
  }, [fullscreen]);

  const photoAlt = (i) =>
    title ? `${title}: photo ${i + 1} of ${list.length}` : `Property photo ${i + 1} of ${list.length}`;

  if (!list.length) {
    return (
      <div
        role="status"
        className="flex aspect-[16/10] flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-white px-6 text-center shadow-soft animate-fade-in"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Icon name="image" className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">No photos yet</p>
          <p className="mt-1 text-sm text-slate-500">The owner has not uploaded photos for this listing.</p>
        </div>
      </div>
    );
  }

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const delta = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 45) (delta < 0 ? next : prev)();
    setTouchStart(null);
  };

  // Revealed on hover/keyboard focus for mouse devices; always visible on touch.
  const arrowClass =
    'absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ' +
    'pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:opacity-100';

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-slate-100 sm:aspect-[16/9]">
        <ImageWithFallback
          key={active}
          src={list[active]}
          alt={photoAlt(active)}
          loading="eager"
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03] animate-fade-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />

        <button type="button" onClick={prev} aria-label="Previous photo" className={cn(arrowClass, 'left-3')}>
          <Icon name="chevronLeft" className="h-5 w-5" />
        </button>
        <button type="button" onClick={next} aria-label="Next photo" className={cn(arrowClass, 'right-3')}>
          <Icon name="chevronRight" className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="absolute right-3 bottom-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-950/75 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-slate-950/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Icon name="image" className="h-4 w-4" />
          View all ({list.length})
        </button>

        <span
          aria-live={fullscreen ? 'off' : 'polite'}
          className="absolute bottom-3 left-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm tabular-nums"
        >
          <span className="sr-only">Photo </span>
          {active + 1} / {list.length}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Photo thumbnails">
        {list.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show photo ${i + 1} of ${list.length}`}
            aria-current={i === active}
            className={cn(
              'relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-32',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
              i === active ? 'border-brand-700 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
            )}
          >
            <ImageWithFallback src={src} alt="" />
          </button>
        ))}
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[95] flex flex-col bg-slate-950 animate-fade-in" role="dialog" aria-modal="true" aria-label={`${title || 'Property'} photo gallery`}>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-white" aria-live="polite">
              {active + 1} of {list.length}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setFullscreen(false)}
              aria-label="Close gallery"
              className="rounded-xl p-2 text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Icon name="x" className="h-6 w-6" />
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden px-2"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Icon name="chevronLeft" className="h-6 w-6" />
            </button>
            <ImageWithFallback
              key={`fs-${active}`}
              src={list[active]}
              alt={photoAlt(active)}
              className="max-h-[78vh] w-auto max-w-full animate-fade-in"
              style={{ objectFit: 'contain' }}
            />
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Icon name="chevronRight" className="h-6 w-6" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto px-4 py-4 no-scrollbar" role="group" aria-label="Photo thumbnails">
            {list.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1} of ${list.length}`}
                aria-current={i === active}
                className={cn(
                  'h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                  i === active ? 'border-white' : 'border-transparent opacity-50 hover:opacity-90'
                )}
              >
                <ImageWithFallback src={src} alt="" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
