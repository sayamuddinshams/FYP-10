import { cn } from '../../utils/format';

const tones = {
  success: 'bg-[#ECFDF5] text-[#047857] ring-[#047857]/20',
  warning: 'bg-[#FEF3C7] text-[#B45309] ring-[#B45309]/20',
  danger: 'bg-[#FFDAD6] text-[#BA1A1A] ring-[#BA1A1A]/20',
  brand: 'bg-[#141C29] text-[#DBE2F5] ring-white/15',
  neutral: 'bg-[#F0EDEE] text-[#45474C] ring-slate-900/10',
  info: 'bg-[#E0F2FE] text-[#0369A1] ring-[#0369A1]/20',
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
          <span className="material-symbols-outlined text-[14px]">verified</span>
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

export function ReportStatusBadge({ status, className }) {
  const map = {
    open: { tone: 'warning', label: 'Open' },
    resolved: { tone: 'success', label: 'Resolved' },
    removed: { tone: 'danger', label: 'Removed' },
  };
  const conf = map[status] || map.open;
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
    owner: { tone: 'warning', label: 'Owner / Agent' },
    admin: { tone: 'neutral', label: 'Admin' },
  };
  const conf = map[role] || map.tenant;
  return (
    <Badge tone={conf.tone} className={className}>
      {conf.label}
    </Badge>
  );
}
