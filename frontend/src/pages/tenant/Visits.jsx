import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/icons';
import Button from '../../components/common/Button';
import Tabs from '../../components/common/Tabs';
import EmptyState from '../../components/common/EmptyState';
import VisitRequestCard from '../../components/property/VisitRequestCard';
import PageHeader from '../../components/dashboard/PageHeader';
import { ErrorState } from '../../components/common/Feedback';
import { RowSkeleton } from '../../components/common/Skeleton';
import { PageLoader } from '../../components/common/Spinner';
import { VISIT_STATUSES, VISIT_STATUS_LABELS } from '../../utils/constants';
import { useAsync, useDocumentTitle } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import visitService from '../../services/visitService';

const TABS = [
  { value: 'all', label: 'All' },
  ...VISIT_STATUSES.map((s) => ({ value: s, label: VISIT_STATUS_LABELS[s] })),
];

const EMPTY_COPY = {
  all: { title: 'No visit requests yet', message: 'When you request a visit from a listing, it will show up here with its status.' },
  pending: { title: 'No pending visit requests', message: 'Requests awaiting an owner response will appear here.' },
  approved: { title: 'No approved visits', message: 'Confirmed walkthroughs will appear here.' },
  rescheduled: { title: 'No rescheduled visits', message: 'Visits whose timing was changed by the owner will appear here.' },
  completed: { title: 'No completed visits', message: 'Finished walkthroughs will appear here.' },
  rejected: { title: 'No rejected visits', message: 'Cancelled or declined requests will appear here.' },
};

export default function Visits() {
  useDocumentTitle('Visit Requests');
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm } = useModals();
  const [tab, setTab] = useState('all');

  const all = useAsync(() => visitService.listByTenant(user?.id), [user?.id], { immediate: Boolean(user) });
  const visits = useAsync(
    () => visitService.listByTenant(user?.id, tab === 'all' ? undefined : tab),
    [user?.id, tab],
    { immediate: Boolean(user) }
  );

  const allVisits = all.data || [];
  const list = visits.data || [];

  const counts = useMemo(() => {
    const c = { all: allVisits.length };
    allVisits.forEach((v) => {
      c[v.status] = (c[v.status] || 0) + 1;
    });
    return c;
  }, [allVisits]);

  async function handleCancel(visit) {
    const ok = await confirm({
      title: 'Cancel this visit request?',
      message: `The owner will be notified that you withdrew your request for ${visit.property?.title || 'the property'}. This cannot be undone.`,
      confirmLabel: 'Cancel request',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await visitService.updateStatus(visit.id, 'rejected');
      toast.success('Visit request cancelled.');
      all.reload();
      visits.reload();
    } catch (err) {
      toast.error(err?.message || 'Could not cancel the request. Please try again.');
    }
  }

  if (!user) return <PageLoader label="Loading your visit requests…" />;

  const error = all.error || visits.error;

  if (error) {
    return (
      <div className="animate-fade-up">
        <PageHeader title="Visit Requests" subtitle="Track your property walkthroughs from request to confirmation." />
        <ErrorState
          message={error}
          onRetry={() => {
            all.reload();
            visits.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Visit Requests" subtitle="Track your property walkthroughs from request to confirmation." />

      <Tabs
        tabs={TABS.map((t) => ({ ...t, count: counts[t.value] || 0 }))}
        value={tab}
        onChange={setTab}
        variant="pill"
        ariaLabel="Filter visits by status"
        className="mb-6"
      />

      {!visits.loading && visits.data && list.length > 0 && (
        <p className="mb-4 text-xs text-slate-500" aria-live="polite">
          Showing {list.length} {list.length === 1 ? 'visit' : 'visits'}
          {tab === 'all' ? ' in total' : ` · ${VISIT_STATUS_LABELS[tab]}`}.
        </p>
      )}

      {visits.loading && !visits.data ? (
        <RowSkeleton rows={4} />
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState
            icon="calendar"
            title={EMPTY_COPY[tab].title}
            message={EMPTY_COPY[tab].message}
            actionLabel="Browse properties"
            onAction={() => navigate('/browse')}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((v) => (
            <VisitRequestCard
              key={v.id}
              visit={v}
              role="tenant"
              actions={
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/tenant/messages')}>
                    <Icon name="chat" className="h-4 w-4" />
                    Message Owner
                  </Button>
                  {v.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleCancel(v)}
                    >
                      <Icon name="x" className="h-4 w-4" />
                      Cancel request
                    </Button>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}