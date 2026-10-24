import { Link } from 'react-router-dom';
import Icon from '../common/icons';
import { cn } from '../../utils/format';

export default function PageHeader({ title, subtitle, actions, back, backLabel = 'Back', className = '' }) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {back && (
          <Link
            to={back}
            className="mb-2.5 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold tracking-wide text-slate-500 transition-all duration-200 hover:-translate-x-0.5 hover:text-amber-600 uppercase"
          >
            <Icon name="arrowLeft" className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 font-sans">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
