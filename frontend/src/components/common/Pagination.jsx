import { cn } from '../../utils/format';

function pageRange(page, pages) {
  const range = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);
  for (let i = start; i <= end; i += 1) range.push(i);
  return range;
}

export default function Pagination({ page = 1, pages = 1, onChange, className = '' }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1.5', className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="h-10 rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-40"
      >
        Previous
      </button>
      {pageRange(page, pages).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          aria-label={`Page ${p}${p === page ? ', current page' : ''}`}
          className={cn(
            'h-10 min-w-10 rounded-lg border px-3 text-sm font-medium transition',
            p === page ? 'border-brand-800 bg-brand-800 text-white' : 'border-line bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        aria-label="Next page"
        className="h-10 rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
