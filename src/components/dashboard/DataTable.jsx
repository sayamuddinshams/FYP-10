import { TableSkeleton } from '../common/Skeleton';
import { cn } from '../../utils/format';

/**
 * Responsive data table — becomes stacked cards on mobile.
 * columns: [{ key, label, render?(row), align?, className?, hideOnMobile? }]
 */
export default function DataTable({ columns = [], rows = [], rowKey = 'id', actions, loading, empty, onRowClick }) {
  if (loading) return <TableSkeleton rows={5} cols={Math.min(columns.length, 5)} />;
  if (!rows.length && empty) return empty;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-line bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-slate-50/80">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn('px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase', col.align === 'right' && 'text-right', col.className)}
                  >
                    {col.label}
                  </th>
                ))}
                {actions && <th scope="col" className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr
                  key={row[rowKey]}
                  className={cn('transition-colors hover:bg-slate-50/70', onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('px-4 py-3.5 align-middle text-slate-700', col.align === 'right' && 'text-right', col.cellClassName)}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3.5 text-right align-middle">{actions(row)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div key={row[rowKey]} className="rounded-xl border border-line bg-white p-4">
            <div className="space-y-2.5">
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => (
                  <div key={col.key} className="flex items-start justify-between gap-4">
                    <span className="shrink-0 text-xs font-semibold tracking-wide text-slate-500 uppercase">{col.label}</span>
                    <span className="text-right text-sm text-slate-700">
                      {col.render ? col.render(row) : row[col.key]}
                    </span>
                  </div>
                ))}
            </div>
            {actions && <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">{actions(row)}</div>}
          </div>
        ))}
      </div>
    </>
  );
}
