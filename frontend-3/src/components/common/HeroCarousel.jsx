import { useEffect, useState } from 'react';

/**
 * Background photo carousel for the homepage hero.
 * Slides crossfade automatically every 7s with a slow Ken Burns zoom/pan
 * drift, so the backdrop moves on its own, smoothly, with no interaction.
 * Decoration only: aria-hidden + pointer-events-none. prefers-reduced-motion
 * is handled by the global CSS media query, which freezes the drift.
 */
const HERO_SLIDES = [
  {
    id: 'villa',
    src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=75',
  },
  {
    id: 'peaks',
    src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=75',
  },
  {
    id: 'house',
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=75',
  },
  {
    id: 'lake',
    src: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=2000&q=75',
  },
];

const SLIDE_MS = 7000;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % HERO_SLIDES.length), SLIDE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {HERO_SLIDES.map((slide, i) => (
        <div key={slide.id} className={`hero-slide ${i === active ? 'hero-slide-active' : ''}`}>
          <img
            src={slide.src}
            alt=""
            className={`hero-slide-img${i % 2 === 0 ? '' : ' hero-kenburns-b'}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}