import { useEffect, useState } from 'react';
import placeholder from '../../assets/placeholder.svg';
import { cn } from '../../utils/format';

/** Image with graceful local fallback when a remote URL fails to load. */
export default function ImageWithFallback({ src, alt = '', className = '', imgClassName = '', loading = 'lazy', ...rest }) {
  const resolvedSrc = typeof src === 'string' && src.trim() ? src.trim() : placeholder;
  const [current, setCurrent] = useState(resolvedSrc);

  // Cards can be reused after filtering or async data refreshes. Keep the
  // displayed image in sync instead of retaining the previous card's URL.
  useEffect(() => {
    setCurrent(resolvedSrc);
  }, [resolvedSrc]);

  return (
    <img
      src={current}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => {
        if (current !== placeholder) setCurrent(placeholder);
      }}
      className={cn('h-full w-full object-cover', className, imgClassName)}
      {...rest}
    />
  );
}
