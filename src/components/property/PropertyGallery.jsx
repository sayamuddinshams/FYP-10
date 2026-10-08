import { useCallback, useEffect, useState } from 'react';
import ImageWithFallback from '../common/ImageWithFallback';
import Icon from '../common/icons';
import { cn } from '../../utils/format';

/**
 * Gallery with thumbnails, full-screen viewer, keyboard navigation and mobile swipe.
 */
export default function PropertyGallery({ images = [], title = '' }) {
  const list = images.length ? images : [];
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

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

  if (!list.length) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-line bg-slate-100 text-sm text-slate-400">
        No photos uploaded yet
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

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-slate-100 sm:aspect-[16/9]">
        <ImageWithFallback
          key={active}
          src={list[active]}
          alt={`${title} — photo ${active + 1}`}
          loading="eager"
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03] animate-fade-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />

        <button
          type="button"
          onClick={prev}
          aria-label="Previous photo"
          className="absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-md transition group-hover:opacity-100 focus-visible:opacity-100 hover:bg-white"
        >
          <Icon name="chevronLeft" className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next photo"
          className="absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-md transition group-hover:opacity-100 focus-visible:opacity-100 hover:bg-white"
        >
          <Icon name="chevronRight" className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-lg bg-slate-950/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-slate-950/90"
        >
          <Icon name="image" className="h-4 w-4" />
          View all ({list.length})
        </button>

        <span className="absolute bottom-3 left-3 rounded-md bg-slate-950/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {active + 1} / {list.length}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {list.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === active}
            className={cn(
              'relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-20 sm:w-32',
              i === active ? 'border-brand-700 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
            )}
          >
            <ImageWithFallback src={src} alt="" />
          </button>
        ))}
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[95] flex flex-col bg-slate-950 animate-fade-in" role="dialog" aria-modal="true" aria-label={`${title} gallery`}>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-white/80">
              {active + 1} of {list.length}
            </span>
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              aria-label="Close gallery"
              className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
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
              className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <Icon name="chevronLeft" className="h-6 w-6" />
            </button>
            <ImageWithFallback key={`fs-${active}`} src={list[active]} alt={`${title} — photo ${active + 1}`} className="max-h-[78vh] w-auto max-w-full object-contain animate-fade-in" />
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <Icon name="chevronRight" className="h-6 w-6" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto px-4 py-4 no-scrollbar">
            {list.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Photo ${i + 1}`}
                className={cn(
                  'h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition',
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
