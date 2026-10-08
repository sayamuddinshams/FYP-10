import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';

const SUGGESTIONS = [
  { to: '/', icon: 'home', label: 'Home', text: 'Featured properties and quick search' },
  { to: '/browse', icon: 'search', label: 'Browse properties', text: 'Filter by district, type and budget' },
  { to: '/advertisements', icon: 'megaphone', label: 'Advertisements', text: 'See what is running this month' },
];

export default function NotFound() {
  useDocumentTitle('Page not found');
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        <p className="font-display text-7xl font-semibold text-brand-900 sm:text-8xl">404</p>
        <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-primary">
          <Icon name="pin" className="h-7 w-7" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">This address does not exist</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          The page you were looking for may have been moved, renamed, or it was never a real listing.
          Let us get you back somewhere useful.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/browse">
            <Button size="lg">Browse properties</Button>
          </Link>
          <Button size="lg" variant="outline" onClick={() => navigate(-1)}>
            <Icon name="arrowLeft" className="h-4 w-4" />
            Go back
          </Button>
        </div>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
          {SUGGESTIONS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="rounded-xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-primary">
                <Icon name={s.icon} className="h-4.5 w-4.5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">{s.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
