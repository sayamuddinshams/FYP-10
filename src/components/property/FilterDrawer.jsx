import PropertyFilters from './PropertyFilters';
import Button from '../common/Button';
import Icon from '../common/icons';
import { cn } from '../../utils/format';

/** Mobile filter bottom sheet. */
export default function FilterDrawer({ open, onClose, filters, onChange, onReset, resultCount }) {
  return (
    <div className={cn('fixed inset-0 z-[80] lg:hidden', open ? '' : 'pointer-events-none')} aria-hidden={!open}>
      <div onClick={onClose} className={cn('absolute inset-0 bg-slate-950/50 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter properties"
        className={cn(
          'absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-base font-semibold text-slate-900">Filters</p>
            {resultCount !== undefined && <p className="text-xs text-slate-500">{resultCount} matching listings</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 thin-scrollbar">
          <PropertyFilters filters={filters} onChange={onChange} onReset={onReset} />
        </div>

        <div className="border-t border-line bg-white px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={onClose} className="flex-[2]">
              Show results{resultCount !== undefined ? ` (${resultCount})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
