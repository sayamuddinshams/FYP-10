import Avatar from '../common/Avatar';
import EmptyState from '../common/EmptyState';
import Icon, { StarIcon } from '../common/icons';
import { formatDate } from '../../utils/format';

function Stars({ value, size = 'h-4 w-4' }) {
  return (
    <span role="img" aria-label={`${value} out of 5 stars`} className="inline-flex gap-0.5 text-amber-600">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon key={s} filled={s <= Math.round(value)} className={size} />
      ))}
    </span>
  );
}

/**
 * Rating summary + review list.
 *
 * The headline score comes from a single source (the stored property rating) so
 * it matches every other surface that renders a rating. The per-star breakdown
 * is computed from the review records that are actually visible and is
 * explicitly scoped in a caption. With no records and no stored rating the
 * section renders an empty state instead of a fabricated score.
 */
export default function ReviewsSection({ reviews = [], rating = 0, reviewCount = 0 }) {
  const list = Array.isArray(reviews) ? reviews : [];
  const derived = list.length
    ? list.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / list.length
    : 0;

  const score = (Number(rating) || 0) || derived;
  const count = (Number(reviewCount) || 0) || list.length;
  const hasAggregate = score > 0 || count > 0;

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: list.filter((r) => r.rating === star).length,
  }));
  const total = list.length || 1;

  if (!hasAggregate && !list.length) {
    return (
      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-ink">Reviews</h2>
        <div className="mt-2">
          <EmptyState
            icon="star"
            title="No reviews yet"
            message="No one has reviewed this property yet. Reviews will appear here once they are published."
          />
        </div>
      </section>
    );
  }

  const countLabel =
    count === list.length
      ? count === 1
        ? 'review'
        : 'reviews'
      : count === 1
        ? 'rating'
        : 'ratings';
  const breakdownScope =
    list.length && count && list.length !== count
      ? `Per-star breakdown of the ${list.length} ${list.length === 1 ? 'review' : 'reviews'} shown below.`
      : null;

  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-ink">Reviews</h2>

      <div className="mt-4 flex flex-col gap-6 border-b border-line pb-6 sm:flex-row sm:items-center sm:gap-10">
        <div className="shrink-0 text-center sm:text-left">
          <p className="text-4xl font-bold tracking-tight tabular-nums text-slate-900">{score.toFixed(1)}</p>
          <div className="mt-1.5 flex justify-center sm:justify-start">
            <Stars value={score} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {count} {countLabel}
          </p>
        </div>

        {list.length > 0 && (
          <div className="flex-1 space-y-2">
            {counts.map(({ star, count: starCount }) => {
              const pct = Math.round((starCount / total) * 100);
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-8 shrink-0 font-medium text-slate-500">{star} star</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-[width] duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right font-medium text-slate-600 tabular-nums">{starCount}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {breakdownScope && <p className="mt-4 text-xs text-slate-500">{breakdownScope}</p>}

      <div className="mt-6 space-y-5">
        {list.length === 0 && (
          <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3.5 text-sm text-slate-600">
            <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            No written reviews are available for this listing yet.
          </p>
        )}
        {list.map((review) => (
          <article key={review.id} className="flex gap-3.5">
            {review.userName ? (
              <Avatar name={review.userName} size="sm" />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"
              >
                <Icon name="user" className="h-4.5 w-4.5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{review.userName || 'Reviewer'}</p>
                <span className="text-xs text-slate-500">{formatDate(review.date)}</span>
              </div>
              <div className="mt-1">
                <Stars value={review.rating} size="h-3.5 w-3.5" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
