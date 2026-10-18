import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../../components/dashboard/PageHeader';
import Tabs from '../../components/common/Tabs';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import { RowSkeleton } from '../../components/common/Skeleton';
import Input, { Textarea, Select } from '../../components/common/Input';
import VisitRequestCard from '../../components/property/VisitRequestCard';

import visitService from '../../services/visitService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { useAsync, useDocumentTitle } from '../../hooks';
import { TIME_SLOTS, VISIT_STATUS_LABELS } from '../../utils/constants';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'completed', label: 'Completed' },
];

const EMPTY_COPY = {
  all: { title: 'No visit requests yet', message: 'When a tenant asks to see one of your listings, it will appear here.' },
  pending: { title: 'Nothing waiting on you', message: 'New visit requests land here. Fast replies win more tenants.' },
  approved: { title: 'No approved visits', message: 'Visits you approve will be listed here with their date and time.' },
  rejected: { title: 'No declined visits', message: 'Requests you decline are kept here for your records.' },
  rescheduled: { title: 'No rescheduled visits', message: 'If you suggest another time, the visit moves into this tab.' },
  completed: { title: 'No completed visits', message: 'Finished visits are stored here after the tenant has seen the property.' },
};

const today = () => new Date().toISOString().slice(0, 10);

export default function Visits() {
  useDocumentTitle('Visit Requests');
  const { user } = useAuth();
  const toast = useToast();
  const { confirm } = useModals();
  const navigate = useNavigate();

  const [tab, setTab] = useState('all');
  const [busyId, setBusyId] = useState('');
  const [reschedule, setReschedule] = useState(null);
  const [slot, setSlot] = useState({ date: '', time: '', note: '' });
  const [slotError, setSlotError] = useState({});

  const { data, loading, error, reload } = useAsync(
    () => visitService.listByOwner(user.id),
    [user?.id],
    { immediate: Boolean(user) }
  );

  const visits = data || [];

  const counts = useMemo(() => {
    const result = { all: visits.length };
    TABS.forEach((t) => {
      if (t.value !== 'all') result[t.value] = visits.filter((v) => v.status === t.value).length;
    });
    return result;
  }, [visits]);

  const rows = useMemo(
    () => (tab === 'all' ? visits : visits.filter((v) => v.status === tab)),
    [visits, tab]
  );

  async function changeStatus(visit, status, message) {
    setBusyId(visit.id);
    try {
      await visitService.updateStatus(visit.id, status);
      toast.success(message);
      reload();
    } catch (err) {
      toast.error(err?.message || 'Unable to update the visit request.');
    } finally {
      setBusyId('');
    }
  }

  function handleApprove(visit) {
    changeStatus(visit, 'approved', 'Visit approved.');
  }

  async function handleReject(visit) {
    const ok = await confirm({
      title: 'Decline this visit request?',
      message: `${visit.tenant?.name || 'The tenant'} will be notified that ${visit.property?.title || 'the property'} is not available at the requested time.`,
      confirmLabel: 'Decline request',
      tone: 'danger',
    });
    if (!ok) return;
    await changeStatus(visit, 'rejected', 'Visit request declined.');
  }

  function openReschedule(visit) {
    setReschedule(visit);
    setSlot({ date: visit.date || today(), time: visit.time || TIME_SLOTS[0], note: '' });
    setSlotError({});
  }

  async function submitReschedule() {
    const found = {};
    if (!slot.date) found.date = 'Choose a new date for the visit.';
    else if (slot.date < today()) found.date = 'The new date cannot be in the past.';
    if (!slot.time) found.time = 'Choose a time slot.';
    if (!slot.note.trim()) found.note = 'Add a short note so the tenant understands the change.';
    if (Object.keys(found).length) {
      setSlotError(found);
      return;
    }

    setBusyId(reschedule.id);
    try {
      await visitService.reschedule(reschedule.id, { date: slot.date, time: slot.time, note: slot.note.trim() });
      toast.success('New time suggested.');
      setReschedule(null);
      reload();
    } catch (err) {
      toast.error(err?.message || 'Unable to suggest a new time.');
    } finally {
      setBusyId('');
    }
  }

  function actionsFor(visit) {
    if (visit.status === 'pending') {
      return (
        <>
          <Button size="xs" variant="success" loading={busyId === visit.id} disabled={Boolean(busyId) && busyId !== visit.id} onClick={() => handleApprove(visit)}>
            Approve
          </Button>
          <Button size="xs" variant="outline" disabled={Boolean(busyId)} onClick={() => handleReject(visit)}>
            Reject
          </Button>
          <Button size="xs" variant="ghost" disabled={Boolean(busyId)} onClick={() => openReschedule(visit)}>
            <Icon name="clock" className="h-3.5 w-3.5" />
            Suggest another time
          </Button>
        </>
      );
    }

    if (visit.status === 'approved' || visit.status === 'rescheduled') {
      return (
        <>
          <Button
            size="xs"
            variant="primary"
            loading={busyId === visit.id}
            disabled={Boolean(busyId) && busyId !== visit.id}
            onClick={() => changeStatus(visit, 'completed', 'Visit marked as completed.')}
          >
            Mark completed
          </Button>
          <Button size="xs" variant="ghost" disabled={Boolean(busyId)} onClick={() => openReschedule(visit)}>
            Suggest another time
          </Button>
        </>
      );
    }

    if (visit.status === 'completed') {
      return <span className="text-[11px] font-medium text-slate-500">Completed · no further actions</span>;
    }

    return <span className="text-[11px] font-medium text-slate-500">Request closed</span>;
  }

  const empty = (
    <div className="rounded-xl border border-line bg-white">
      <EmptyState
        icon="calendar"
        title={EMPTY_COPY[tab]?.title || 'No visit requests'}
        message={EMPTY_COPY[tab]?.message}
        actionLabel="Add a property"
        onAction={() => navigate('/owner/properties/new')}
        secondaryLabel={tab !== 'all' ? 'View all requests' : undefined}
        onSecondary={tab !== 'all' ? () => setTab('all') : undefined}
      />
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Visit Requests"
        subtitle="Approve, decline or reschedule tenant visits to your listings. Replying quickly keeps your response rate high."
      />

      <div className="mb-5">
        <Tabs
          ariaLabel="Filter visit requests by status"
          tabs={TABS.map((t) => ({ ...t, count: counts[t.value] ?? 0 }))}
          value={tab}
          onChange={setTab}
        />
        <p className="mt-2 text-xs text-slate-500" aria-live="polite">
          {loading && !data
            ? 'Loading visit requests…'
            : error && !data
              ? 'Visit requests could not be loaded.'
              : `${rows.length} ${rows.length === 1 ? 'request' : 'requests'} shown${tab !== 'all' ? ` in “${TABS.find((t) => t.value === tab)?.label}”` : ''} · ${counts.all ?? 0} total`}
        </p>
      </div>

      {error && !data && <ErrorState message={error} onRetry={reload} />}

      {loading && !data && !error && <RowSkeleton rows={4} />}

      {data && !error && (
        <div key={tab} className="space-y-3">
          {rows.length === 0 ? (
            empty
          ) : (
            rows.map((visit) => (
              <VisitRequestCard key={visit.id} visit={visit} role="owner" actions={actionsFor(visit)} />
            ))
          )}
        </div>
      )}

      {/* Reschedule modal */}
      <Modal
        open={Boolean(reschedule)}
        onClose={() => setReschedule(null)}
        title="Suggest another time"
        description={
          reschedule
            ? `Propose a new slot for ${reschedule.tenant?.name || 'the tenant'} at ${reschedule.property?.title || 'your property'}.`
            : ''
        }
        size="md"
        footer={
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setReschedule(null)} disabled={busyId === reschedule?.id}>
              Cancel
            </Button>
            <Button loading={busyId === reschedule?.id} onClick={submitReschedule}>
              Send suggestion
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="New date"
              required
              type="date"
              min={today()}
              value={slot.date}
              onChange={(e) => setSlot((s) => ({ ...s, date: e.target.value }))}
              error={slotError.date}
            />
            <Select
              label="New time"
              required
              placeholder="Select a time slot"
              value={slot.time}
              onChange={(e) => setSlot((s) => ({ ...s, time: e.target.value }))}
              error={slotError.time}
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Note to the tenant"
            required
            rows={4}
            placeholder="Explain why the original time does not work and confirm the new slot."
            value={slot.note}
            onChange={(e) => setSlot((s) => ({ ...s, note: e.target.value }))}
            error={slotError.note}
            hint={`${slot.note.trim().length} characters`}
          />

          <p className="rounded-lg bg-slate-50 px-3.5 py-3 text-xs leading-relaxed text-slate-500">
            The tenant is notified straight away and can confirm the new slot from their visit requests page. Current
            status: <strong className="text-slate-700">{VISIT_STATUS_LABELS[reschedule?.status]}</strong>.
          </p>
        </div>
      </Modal>
    </div>
  );
}
