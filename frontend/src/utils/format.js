export function cn(...args) {
  return args.filter(Boolean).join(' ');
}

const pkr = new Intl.NumberFormat('en-PK');

export function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '–';
  return `Rs ${pkr.format(Number(value))}`;
}

export function formatCompact(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) return `Rs ${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  if (n >= 1000) return `Rs ${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `Rs ${n}`;
}

export function formatNumber(value) {
  return pkr.format(Number(value) || 0);
}

export function formatDate(value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '–';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleDateString('en-GB', opts);
}

export function formatTime(value) {
  if (!value) return '–';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function timeAgo(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '–';
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return formatDate(value);
}

export function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_TONES = [
  'bg-brand-700 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-500 text-white',
  'bg-indigo-600 text-white',
  'bg-rose-500 text-white',
  'bg-teal-600 text-white',
  'bg-slate-700 text-white',
];

export function avatarTone(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export function formatArea(area, unit = 'sq ft') {
  if (!area && area !== 0) return '–';
  return `${formatNumber(area)} ${unit}`;
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function toOrdinal(n) {
  return ['0th', '1st', '2nd', '3rd'][n] ?? `${n}th`;
}

export function classNames(...args) {
  return cn(...args);
}
