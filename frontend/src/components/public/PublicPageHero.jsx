import { useId } from 'react';
import { cn } from '../../utils/format';

export default function PublicPageHero({
  eyebrow,
  title,
  description,
  meta,
  aside,
  image,
  imagePosition = 'center',
  compact = false,
  className,
}) {
  const headingId = useId();

  return (
    <section
      className={cn('public-page-hero', compact && 'public-page-hero--compact', className)}
      aria-labelledby={headingId}
    >
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="public-page-hero__image"
          style={{ objectPosition: imagePosition }}
        />
      )}
      <div aria-hidden="true" className="public-page-hero__contours" />
      <div aria-hidden="true" className="public-page-hero__rail">
        <span>GB</span>
        <i />
      </div>

      <div className="public-page-hero__inner">
        <div className={cn('public-page-hero__grid', aside && 'public-page-hero__grid--aside')}>
          <div className="min-w-0">
            <p className="public-page-hero__eyebrow">{eyebrow}</p>
            <h1 id={headingId} className="public-page-hero__title">
              {title}
            </h1>
            {description && <p className="public-page-hero__description">{description}</p>}
            {meta && <p className="public-page-hero__meta">{meta}</p>}
          </div>

          {aside && <div className="public-page-hero__aside">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
