import { cn } from '../../utils/format';

const tones = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/15',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
};

export default function Badge({ tone = 'neutral', children, icon, className = '', ...rest }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs leading-none font-semibold ring-1 ring-inset',
        tones[tone] || tones.neutral,
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}

function Dot({ className }) {
  return <span className={cn('h-1.5 w-1.5 rounded-full bg-current', className)} aria-hidden="true" />;
}

export function ListingStatusBadge({ status, className }) {
  const map = {
    draft: { tone: 'neutral', label: 'Draft' },
    pending: { tone: 'warning', label: 'Pending Review' },
    approved: { tone: 'success', label: 'Approved' },
    rejected: { tone: 'danger', label: 'Rejected' },
    changes: { tone: 'brand', label: 'Changes Requested' },
    suspended: { tone: 'danger', label: 'Suspended' },
  };
  const conf = map[status] || map.draft;
  return (
    <Badge tone={conf.tone} className={className}>
      <Dot />
      {conf.label}
    </Badge>
  );
}

export function VisitStatusBadge({ status, className }) {
  const map = {
    pending: { tone: 'warning', label: 'Pending' },
    approved: { tone: 'success', label: 'Approved' },
    rescheduled: { tone: 'info', label: 'Rescheduled' },
    completed: { tone: 'brand', label: 'Completed' },
    rejected: { tone: 'danger', label: 'Rejected' },
  };
  const conf = map[status] || map.pending;
  return (
    <Badge tone={conf.tone} className={className}>
      <Dot />
      {conf.label}
    </Badge>
  );
}

export function VerificationBadge({ status, className }) {
  if (status === 'verified') {
    return (
      <Badge
        tone="success"
        className={className}
        icon={
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.4 3.9a1 1 0 01.14 1.4l-8 10a1 1 0 01-1.5.06l-4-4a1 1 0 011.4-1.42l3.24 3.23 7.3-9.1a1 1 0 011.42-.17z"
              clipRule="evenodd"
            />
          </svg>
        }
      >
        Verified Owner
      </Badge>
    );
  }
  if (status === 'pending') return <Badge tone="warning" className={className}>Verification Pending</Badge>;
  if (status === 'rejected') return <Badge tone="danger" className={className}>Verification Rejected</Badge>;
  return <Badge tone="neutral" className={className}>Unverified</Badge>;
}

export function TransactionStatusBadge({ status, className }) {
  const map = { completed: { tone: 'success', label: 'Completed' }, pending: { tone: 'warning', label: 'Pending' }, failed: { tone: 'danger', label: 'Failed' } };
  const conf = map[status] || map.pending;
  return (
    <Badge tone={conf.tone} className={className}>
      <Dot />
      {conf.label}
    </Badge>
  );
}

export function UserStatusBadge({ status, className }) {
  const map = { active: { tone: 'success', label: 'Active' }, suspended: { tone: 'danger', label: 'Suspended' } };
  const conf = map[status] || map.active;
  return (
    <Badge tone={conf.tone} className={className}>
      <Dot />
      {conf.label}
    </Badge>
  );
}

export function RoleBadge({ role, className }) {
  const map = {
    tenant: { tone: 'brand', label: 'Tenant' },
    owner: { tone: 'info', label: 'Owner / Agent' },
    admin: { tone: 'neutral', label: 'Admin' },
  };
  const conf = map[role] || map.tenant;
  return (
    <Badge tone={conf.tone} className={className}>
      {conf.label}
    </Badge>
  );
}
