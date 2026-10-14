import { useId } from 'react';
import { formatCompact, formatNumber, cn } from '../../utils/format';

const W = 640;
const H = 240;

function niceTicks(min, max, count = 4) {
  const span = max - min || 1;
  const step = span / count;
  return Array.from({ length: count + 1 }, (_, i) => min + step * i);
}

/** Animated SVG line/area chart. data: [{label, value}] */
export function LineChart({ data = [], valueKey = 'value', labelKey = 'label', color = '#e11d48', height = H, formatValue = formatCompact, className = '' }) {
  const id = useId().replace(/:/g, '');
  const pad = { l: 52, r: 16, t: 18, b: 30 };
  if (!data.length) return <ChartEmpty height={height} />;

  const values = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(...values) * 1.1;
  const min = 0;
  const innerW = W - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;

  const x = (i) => pad.l + (data.length === 1 ? innerW / 2 : (i * innerW) / (data.length - 1));
  const y = (v) => pad.t + innerH - ((v - min) / (max - min || 1)) * innerH;

  const points = values.map((v, i) => [x(i), y(v)]);
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1)},${pad.t + innerH} L${x(0)},${pad.t + innerH} Z`;
  const ticks = niceTicks(min, max, 4);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className={cn('h-auto w-full', className)} role="img" aria-label="Line chart">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e4e4e7" strokeWidth="1" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#a1a1aa">
            {formatValue(t)}
          </text>
        </g>
      ))}

      <path d={area} fill={`url(#grad-${id})`} className="animate-fade-in" />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="chart-line"
        style={{ '--dash': 1600 }}
      />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#fff" stroke={color} strokeWidth="2.5" className="animate-pop" style={{ animationDelay: `${0.6 + i * 0.08}s` }} />
      ))}

      {data.map((d, i) => (
        <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize="10" fill="#a1a1aa">
          {d[labelKey]}
        </text>
      ))}
    </svg>
  );
}

/** Animated SVG bar chart. data: [{label, value}] */
export function BarChart({ data = [], valueKey = 'value', labelKey = 'label', color = '#e11d48', height = H, formatValue = formatCompact, className = '', horizontal = false }) {
  const id = useId().replace(/:/g, '');
  if (!data.length) return <ChartEmpty height={height} />;

  if (horizontal) {
    const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0)) || 1;
    return (
      <div className={cn('space-y-3', className)}>
        {data.map((d, i) => (
          <div key={d[labelKey]}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">{d[labelKey]}</span>
              <span className="font-semibold text-slate-900">{formatValue(d[valueKey])}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-out"
                style={{ width: `${(Number(d[valueKey]) / max) * 100}%`, background: color, animationDelay: `${i * 0.06}s` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const pad = { l: 52, r: 16, t: 18, b: 30 };
  const values = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(...values) * 1.12;
  const innerW = W - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const slot = innerW / data.length;
  const barW = Math.min(46, slot * 0.55);
  const ticks = niceTicks(0, max, 4);
  const y = (v) => pad.t + innerH - (v / (max || 1)) * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className={cn('h-auto w-full', className)} role="img" aria-label="Bar chart">
      <defs>
        <linearGradient id={`bar-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.65" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e4e4e7" strokeWidth="1" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#a1a1aa">
            {formatValue(t)}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const v = Number(d[valueKey]) || 0;
        const bx = pad.l + slot * i + (slot - barW) / 2;
        const by = y(v);
        return (
          <g key={i}>
            <rect
              x={bx}
              y={by}
              width={barW}
              height={Math.max(2, pad.t + innerH - by)}
              rx="5"
              fill={`url(#bar-${id})`}
              className="chart-bar"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <title>{`${d[labelKey]}: ${formatValue(v)}`}</title>
            </rect>
            <text x={bx + barW / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="#a1a1aa">
              {d[labelKey]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const TONE_COLORS = {
  success: '#059669',
  warning: '#f59e0b',
  danger: '#dc2626',
  brand: '#e11d48',
  neutral: '#94a3b8',
  info: '#0284c7',
};

/** Donut/segment chart. data: [{label, value, tone}] */
export function DonutChart({ data = [], size = 190, thickness = 22, className = '' }) {
  const total = data.reduce((a, d) => a + Number(d.value || 0), 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className={cn('flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Segment chart" className="shrink-0">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f4f4f5" strokeWidth={thickness} />
        {data.map((d, i) => {
          const fraction = Number(d.value || 0) / total;
          const length = fraction * circumference;
          const dash = `${length} ${circumference - length}`;
          const rotation = (offset / total) * 360 - 90;
          offset += Number(d.value || 0);
          return (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={TONE_COLORS[d.tone] || colorForIndex(i)}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeLinecap="butt"
              transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              style={{
                transition: 'stroke-dasharray .8s cubic-bezier(.22,1,.36,1)',
                animation: 'fade-in .6s ease-out both',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <title>{`${d.label}: ${formatNumber(d.value)}`}</title>
            </circle>
          );
        })}
        <text x="50%" y="47%" textAnchor="middle" fontSize="22" fontWeight="700" fill="#18181b">
          {formatNumber(total)}
        </text>
        <text x="50%" y="60%" textAnchor="middle" fontSize="11" fill="#a1a1aa">
          Total
        </text>
      </svg>
      <ul className="w-full space-y-2.5">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: TONE_COLORS[d.tone] || colorForIndex(i) }} />
              {d.label}
            </span>
            <span className="font-semibold text-slate-900">
              {formatNumber(d.value)}
              <span className="ml-1.5 text-xs font-normal text-slate-500">
                {Math.round((Number(d.value || 0) / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PALETTE = ['#e11d48', '#fb7185', '#059669', '#f59e0b', '#dc2626', '#0284c7', '#7c3aed'];
function colorForIndex(i) {
  return PALETTE[i % PALETTE.length];
}

function ChartEmpty({ height = H }) {
  return (
    <div className="flex items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500" style={{ height }}>
      No data to display yet
    </div>
  );
}
