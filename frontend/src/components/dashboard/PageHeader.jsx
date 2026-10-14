import { Link } from 'react-router-dom';
import Icon from '../common/icons';
import { cn } from '../../utils/format';

export default function PageHeader({ title, subtitle, actions, back, backLabel = 'Back', className = '' }) {
  return (
    <div className={cn('mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {back && (
          <Link
            to={back}
            className="mb-2.5 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-zinc-500 transition-all duration-200 hover:-translate-x-0.5 hover:text-rose-600"
          >
            <Icon name="arrowLeft" className="h-4 w-4" />
            {backLabel}
          </Link>
        )}
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
