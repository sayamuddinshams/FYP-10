import { useState } from 'react';
import placeholder from '../../assets/placeholder.svg';
import { cn } from '../../utils/format';

/** Image with graceful local fallback when a remote URL fails to load. */
export default function ImageWithFallback({ src, alt = '', className = '', imgClassName = '', loading = 'lazy', ...rest }) {
  const [current, setCurrent] = useState(src || placeholder);

  return (
    <img
      src={current}
      alt={alt}
      loading={loading}
      onError={() => {
        if (current !== placeholder) setCurrent(placeholder);
      }}
      className={cn('h-full w-full object-cover', className, imgClassName)}
      {...rest}
    />
  );
}
