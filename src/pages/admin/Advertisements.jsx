import { useState } from 'react';
import { useAsync, useDocumentTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { formatDate, formatNumber } from '../../utils/format';
import advertisementService from '../../services/advertisementService';
import { DISTRICTS } from '../../data/locations';
import { PROPERTY_TYPES } from '../../utils/constants';
import PageHeader from '../../components/dashboard/PageHeader';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Dropdown from '../../components/common/Dropdown';
import EmptyState from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/Feedback';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Skeleton } from '../../components/common/Skeleton';
import Icon from '../../components/common/icons';

const STATUS_META = {
  active: { tone: 'success', label: 'Active' },
  paused: { tone: 'warning', label: 'Paused' },
  scheduled: { tone: 'brand', label: 'Scheduled' },
  draft: { tone: 'neutral', label: 'Draft' },
};

const EMPTY_FORM = {
  title: '',
  description: '',
  image: '',
  targetType: 'all',
  target: '',
  start: new Date().toISOString().slice(0, 10),
  end: '',
  status: 'scheduled',
};

export default function Advertisements() {
  useDocumentTitle('Advertisements');
  const toast = useToast();
  const { confirm } = useModals();

  const [createOpen, setCreateOpen] = useState(false);
  const [editAd, setEditAd] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload } = useAsync(() => advertisementService.listAll(), []);

  const ads = data || [];

  function validateForm(f) {
    const errors = {};
    if (!f.title.trim()) errors.title = 'Title is required.';
    if (!f.description.trim()) errors.description = 'Description is required.';
    if (f.start && f.end && f.end < f.start) errors.end = 'End date must be on or after the start date.';
    if (!f.end) errors.end = 'End date is required.';
    if (f.targetType !== 'all' && !f.target) errors.target = 'Choose a target for this placement.';
    return errors;
  }

  async function handleCreate(e) {
    e.preventDefault();
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    setBusy(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        image: form.image.trim() || undefined,
        targetType: form.targetType,
        target: form.targetType === 'all' ? 'All Gilgit-Baltistan' : form.target,
        start: form.start,
        end: form.end,
        status: form.status,
      };
      await advertisementService.create(payload);
      toast.success('Advertisement created.');
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editAd) return;
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    setBusy(true);
    try {
      await advertisementService.update(editAd.id, {
        title: form.title,
        description: form.description,
        image: form.image.trim() || editAd.image,
        targetType: form.targetType,
        target: form.targetType === 'all' ? 'All Gilgit-Baltistan' : form.target,
        start: form.start,
        end: form.end,
      });
      toast.success('Advertisement updated.');
      setEditAd(null);
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleStatus(ad) {
    const next = ad.status === 'active' ? 'paused' : 'active';
    try {
      if (ad.status === 'paused') {
        const ok = await confirm({
          title: 'Activate this advertisement?',
          message: `"${ad.title}" will start serving to its target audience.`,
          confirmLabel: 'Activate',
          tone: 'success',
        });
        if (!ok) return;
      }
      await advertisementService.setStatus(ad.id, next);
      toast.success(next === 'active' ? 'Advertisement activated.' : 'Advertisement paused.');
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    }
  }

  async function handleDelete(ad) {
    const ok = await confirm({
      title: 'Delete advertisement?',
      message: `"${ad.title}" will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete advertisement',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await advertisementService.remove(ad.id);
      toast.success('Advertisement deleted.');
      reload();
    } catch (err) {
      toast.error(err.message, 'Action failed');
    }
  }

  const formNode = (f, setF) => (
    <div className="space-y-4">
      <Input
        label="Advertisement title"
        required
        value={f.title}
        onChange={(e) => setF({ ...f, title: e.target.value })}
        placeholder="e.g. Winter Rentals in Hunza — 15% off long stays"
        error={formErrors.title}
      />
      <Textarea
        label="Description"
        required
        rows={3}
        value={f.description}
        onChange={(e) => setF({ ...f, description: e.target.value })}
        placeholder="Describe the promotion, terms and who it targets."
        error={formErrors.description}
      />
      <Input
        label="Image URL"
        hint="Optional — a default image is used if empty"
        value={f.image}
        onChange={(e) => setF({ ...f, image: e.target.value })}
        placeholder="https://images.unsplash.com/…"
      />
      {f.image.trim() && (
        <div className="overflow-hidden rounded-lg border border-line">
          <ImageWithFallback src={f.image.trim()} alt="Advertisement preview" imgClassName="h-32 w-full" />
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Target type"
          value={f.targetType}
          onChange={(e) => setF({ ...f, targetType: e.target.value, target: '' })}
        >
          <option value="all">All locations</option>
          <option value="location">Location</option>
          <option value="property_type">Property type</option>
        </Select>
        {f.targetType === 'location' ? (
          <Select
            label="District"
            value={f.target}
            onChange={(e) => setF({ ...f, target: e.target.value })}
            error={formErrors.target}
            placeholder="Choose a district"
          >
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        ) : f.targetType === 'property_type' ? (
          <Select
            label="Property type"
            value={f.target}
            onChange={(e) => setF({ ...f, target: e.target.value })}
            error={formErrors.target}
            placeholder="Choose a property type"
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.label}>{t.label}</option>
            ))}
          </Select>
        ) : (
          <div className="sm:pt-6">
            <p className="rounded-lg bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500">Targets all of Gilgit-Baltistan.</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input label="Start date" type="date" required value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} />
        <Input label="End date" type="date" required value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} error={formErrors.end} />
        <Select
          label="Status"
          value={f.status}
          onChange={(e) => setF({ ...f, status: e.target.value })}
        >
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advertisements"
        subtitle="Manage sponsored placements, targeting and campaign performance."
        actions={
          <Button onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setCreateOpen(true); }}>
            <Icon name="plus" className="h-4 w-4" />
            Create advertisement
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-line bg-white">
              <Skeleton className="h-40 rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : !ads.length ? (
        <EmptyState
          icon="bell"
          title="No advertisements"
          message="Create your first sponsored campaign to reach tenants across Gilgit-Baltistan."
          actionLabel="Create advertisement"
          onAction={() => { setForm(EMPTY_FORM); setFormErrors({}); setCreateOpen(true); }}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {ads.map((ad) => {
            const meta = STATUS_META[ad.status] || STATUS_META.draft;
            const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';
            return (
              <article key={ad.id} className="group overflow-hidden rounded-xl border border-line bg-white transition hover:shadow-md animate-fade-up">
                <div className="relative">
                  <ImageWithFallback src={ad.image} alt={ad.title} imgClassName="h-40 w-full" />
                  <div className="absolute top-3 right-3">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">{ad.title}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {ad.targetType === 'all' ? 'All Gilgit-Baltistan' : ad.target} · {formatDate(ad.start)} – {formatDate(ad.end)}
                      </p>
                    </div>
                    <Dropdown
                      ariaLabel={`Actions for ${ad.title}`}
                      align="right"
                      trigger={
                        <span className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                          <Icon name="chevronDown" className="h-4 w-4" />
                        </span>
                      }
                      items={[
                        {
                          label: 'Edit',
                          icon: <Icon name="edit" className="h-4 w-4" />,
                          onClick: () => {
                            setForm({
                              title: ad.title,
                              description: ad.description || '',
                              image: ad.image || '',
                              targetType: ad.targetType || 'all',
                              target: ad.target === 'All Gilgit-Baltistan' ? '' : ad.target || '',
                              start: ad.start,
                              end: ad.end,
                              status: ad.status || 'scheduled',
                            });
                            setFormErrors({});
                            setEditAd(ad);
                          },
                        },
                        {
                          label: ad.status === 'active' ? 'Pause' : 'Activate',
                          icon: <Icon name={ad.status === 'active' ? 'pause' : 'play'} className="h-4 w-4" />,
                          onClick: () => handleToggleStatus(ad),
                        },
                        '-',
                        { label: 'Delete', icon: <Icon name="trash" className="h-4 w-4" />, tone: 'danger', onClick: () => handleDelete(ad) },
                      ]}
                    />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{ad.description}</p>

                  <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4">
                    <div>
                      <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Impressions</dt>
                      <dd className="mt-0.5 text-sm font-bold text-slate-900">{formatNumber(ad.impressions)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Clicks</dt>
                      <dd className="mt-0.5 text-sm font-bold text-slate-900">{formatNumber(ad.clicks)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">CTR</dt>
                      <dd className="mt-0.5 text-sm font-bold text-brand-700">{ctr}%</dd>
                    </div>
                  </dl>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create advertisement"
        description="Set up a sponsored campaign with targeting and schedule."
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" form="create-ad-form" loading={busy}>
              Create advertisement
            </Button>
          </div>
        }
      >
        <form id="create-ad-form" onSubmit={handleCreate} className="space-y-4">
          {formNode(form, setForm)}
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={Boolean(editAd)}
        onClose={() => setEditAd(null)}
        title="Edit advertisement"
        description="Update campaign details and targeting."
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditAd(null)} disabled={busy}>Cancel</Button>
            <Button type="submit" form="edit-ad-form" loading={busy}>
              Save changes
            </Button>
          </div>
        }
      >
        <form id="edit-ad-form" onSubmit={handleUpdate} className="space-y-4">
          {formNode(form, setForm)}
        </form>
      </Modal>
    </div>
  );
}