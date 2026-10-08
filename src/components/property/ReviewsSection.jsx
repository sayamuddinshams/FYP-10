import Avatar from '../common/Avatar';
import { StarIcon } from '../common/icons';
import { formatDate } from '../../utils/format';

export default function ReviewsSection({ reviews = [], rating = 0, reviewCount = 0 }) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const total = reviews.length || 1;

  return (
    <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-6 border-b border-line pb-6 sm:flex-row sm:items-center sm:gap-10">
        <div className="shrink-0 text-center sm:text-left">
          <p className="text-4xl font-bold tracking-tight text-slate-900">{(rating || 0).toFixed(1)}</p>
          <div className="mt-1.5 flex justify-center gap-0.5 text-amber-400 sm:justify-start">
            {[1, 2, 3, 4, 5].map((s) => (
              <StarIcon key={s} filled={s <= Math.round(rating)} className="h-4 w-4" />
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-400">{reviewCount || reviews.length} reviews</p>
        </div>

        <div className="flex-1 space-y-2">
          {counts.map(({ star, count }) => {
            const pct = Math.round((count / total) * 100);
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-8 shrink-0 font-medium text-slate-500">{star} star</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-[width] duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-slate-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {reviews.length === 0 && <p className="text-sm text-slate-500">No reviews yet. Be the first to share your experience after a visit.</p>}
        {reviews.map((review) => (
          <article key={review.id} className="flex gap-3.5">
            <Avatar name={review.userName || 'Tenant'} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{review.userName || 'Verified tenant'}</p>
                <span className="text-xs text-slate-400">{formatDate(review.date)}</span>
              </div>
              <div className="mt-1 flex gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <StarIcon key={s} filled={s <= review.rating} className="h-3.5 w-3.5" />
                ))}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
