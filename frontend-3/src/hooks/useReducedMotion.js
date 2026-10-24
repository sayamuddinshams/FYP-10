import { useEffect, useState } from 'react';

/**
 * Hook to detect user's reduced motion preference.
 * Returns true if the user prefers reduced motion.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mediaQuery.matches);

    const handler = () => setReduced(mediaQuery.matches);
    mediaQuery.addEventListener?.('change', handler);
    return () => mediaQuery.removeEventListener?.('change', handler);
  }, []);

  return reduced;
}