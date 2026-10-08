import { useEffect, useState } from 'react';
import { useAsync, useDocumentTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { cn } from '../../utils/format';
import adminService from '../../services/adminService';
import PageHeader from '../../components/dashboard/PageHeader';
import Button from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ErrorState } from '../../components/common/Feedback';
import { Skeleton } from '../../components/common/Skeleton';
import Icon from '../../components/common/icons';

/** Local switch control (defined in this file per the settings spec). */
function Toggle({ checked, onChange, label, disabled = false, danger = false, hint }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {hint && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
          // Invisible extension so the 24px switch still has a 40px touch target.
          "after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']",
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
          checked ? (danger ? 'bg-red-600' : 'bg-brand-700') : 'bg-slate-300',
          disabled && 'pointer-events-none opacity-50'
        )}
      >
        <span
          className={cn(
            'inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-[21px]' : 'translate-x-[3px]'
          )}
        />
      </button>
    </div>
  );
}

function SectionCard({ title, description, icon, children, actionLabel = 'Save changes', onSave, saving = false, danger = false }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            danger ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'
          )}
        >
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">{title}</h3>
          {description && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
      <div className="mt-6 flex justify-end border-t border-line pt-4">
        <Button variant={danger ? 'danger' : 'primary'} onClick={onSave} loading={saving}>
          {actionLabel}
        </Button>
      </div>
    </section>
  );
}

export default function Settings() {
  useDocumentTitle('Settings');
  const toast = useToast();
  const { confirm } = useModals();

  const { data, loading, error, reload } = useAsync(() => adminService.getSettings(), []);

  const [form, setForm] = useState({
    platformName: '',
    supportEmail: '',
    supportPhone: '',
    platformFee: 5,
    visitWindowDays: 14,
    maxImagesPerListing: 8,
    requireVerification: true,
    autoApprove: false,
    maintenanceMode: false,
    emailDigests: true,
    reportAlerts: true,
    weeklyFinanceSummary: true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm((prev) => ({
        ...prev,
        platformName: data.platformName ?? prev.platformName,
        supportEmail: data.supportEmail ?? prev.supportEmail,
        supportPhone: data.supportPhone ?? prev.supportPhone,
        platformFee: data.platformFee ?? prev.platformFee,
        visitWindowDays: data.visitWindowDays ?? prev.visitWindowDays,
        maxImagesPerListing: data.maxImagesPerListing ?? prev.maxImagesPerListing,
        requireVerification: data.requireVerification ?? prev.requireVerification,
        autoApprove: data.autoApprove ?? prev.autoApprove,
        maintenanceMode: data.maintenanceMode ?? prev.maintenanceMode,
      }));
    }
  }, [data]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function validateSection(name, values = form) {
    const next = {};
    if (name === 'platform') {
      if (!values.platformName.trim()) next.platformName = 'Platform name is required.';
      if (!values.supportEmail.trim()) next.supportEmail = 'Support email is required.';
      else if (!validateEmail(values.supportEmail)) next.supportEmail = 'Enter a valid email address.';
      if (!values.supportPhone.trim()) next.supportPhone = 'Support phone is required.';
    }
    if (name === 'fees') {
      const fee = Number(values.platformFee);
      if (Number.isNaN(fee) || fee < 0 || fee > 20) next.platformFee = 'Fee must be between 0 and 20%.';
      const days = Number(values.visitWindowDays);
      if (!Number.isInteger(days) || days < 1 || days > 60) next.visitWindowDays = 'Enter a value between 1 and 60 days.';
      const max = Number(values.maxImagesPerListing);
      if (!Number.isInteger(max) || max < 1 || max > 30) next.maxImagesPerListing = 'Enter a value between 1 and 30.';
    }
    setErrors(next);
    return !Object.keys(next).length;
  }

  /**
   * Saves a settings section. `overrides` lets callers persist a change in the same
   * tick it is requested — `setForm` is async, so reading `form` right after a state
   * update would send the previous values (this was silently dropping the
   * maintenance-mode toggle).
   */
  async function saveSection(name, message = 'Settings saved.', overrides = {}) {
    const payload = { ...form, ...overrides };
    if (!validateSection(name, payload)) return;
    setSaving(true);
    try {
      await adminService.saveSettings(payload);
      setForm(payload);
      toast.success(message);
      return true;
    } catch (err) {
      toast.error(err.message, 'Save failed');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function toggleMaintenance(targetOn) {
    if (targetOn) {
      const ok = await confirm({
        title: 'Enable maintenance mode?',
        message:
          'While maintenance mode is on, tenants and owners cannot log in or use the platform. Listings, messages and transactions stay untouched. This is a significant action.',
        confirmLabel: 'Enter maintenance mode',
        tone: 'danger',
      });
      if (!ok) return;
      const saved = await saveSection('moderation', 'Maintenance mode is now enabled.', { maintenanceMode: true });
      if (saved) toast.warning('Platform is now in read-only maintenance mode.');
    } else {
      await saveSection('moderation', 'Maintenance mode is now off.', { maintenanceMode: false });
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" subtitle="Platform configuration for RentLink." />
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <section key={i} className="rounded-xl border border-line bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <Skeleton className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-2/3" />
              </div>
              <div className="mt-6 flex justify-end border-t border-line pt-4">
                <Skeleton className="h-10 w-32" />
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" subtitle="Platform configuration for RentLink." />
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Platform configuration for identity, moderation, fees and notifications."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Platform */}
        <SectionCard
          title="Platform"
          description="Public identity and support contact details shown across the marketplace."
          icon="settings"
          onSave={() => saveSection('platform')}
          saving={saving}
        >
          <Input
            label="Platform name"
            required
            value={form.platformName}
            onChange={(e) => set('platformName')(e.target.value)}
            error={errors.platformName}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Support email"
              type="email"
              required
              value={form.supportEmail}
              onChange={(e) => set('supportEmail')(e.target.value)}
              error={errors.supportEmail}
              placeholder="support@rentlink.pk"
            />
            <Input
              label="Support phone"
              required
              value={form.supportPhone}
              onChange={(e) => set('supportPhone')(e.target.value)}
              error={errors.supportPhone}
              placeholder="+92 5811 456789"
            />
          </div>
        </SectionCard>

        {/* Moderation */}
        <SectionCard
          title="Moderation"
          description="Controls for listing approval, owner identity and platform availability."
          icon="shield"
          onSave={() => saveSection('moderation')}
          saving={saving}
        >
          <Toggle
            label="Require owner verification"
            hint="Owners must complete document verification before publishing listings."
            checked={form.requireVerification}
            onChange={set('requireVerification')}
          />
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5">
            <Toggle
              label="Auto-approve new listings"
              hint="Warning: listings go live immediately without a manual review. Only enable for a trusted, verified owner base."
              checked={form.autoApprove}
              onChange={set('autoApprove')}
            />
          </div>
          <Toggle
            label="Maintenance mode"
            hint="Put the platform in read-only mode for everyone except administrators."
            danger
            checked={form.maintenanceMode}
            onChange={toggleMaintenance}
          />
        </SectionCard>

        {/* Fees & limits */}
        <SectionCard
          title="Fees & limits"
          description="Commercial terms and operational caps for listings and visits."
          icon="coins"
          onSave={() => saveSection('fees')}
          saving={saving}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Platform fee (%)"
              type="number"
              min={0}
              max={20}
              step={0.5}
              required
              hint="0 – 20"
              value={form.platformFee}
              onChange={(e) => set('platformFee')(e.target.value)}
              error={errors.platformFee}
            />
            <Input
              label="Visit window (days)"
              type="number"
              min={1}
              max={60}
              required
              value={form.visitWindowDays}
              onChange={(e) => set('visitWindowDays')(e.target.value)}
              error={errors.visitWindowDays}
            />
            <Input
              label="Max images / listing"
              type="number"
              min={1}
              max={30}
              required
              value={form.maxImagesPerListing}
              onChange={(e) => set('maxImagesPerListing')(e.target.value)}
              error={errors.maxImagesPerListing}
            />
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            The default platform fee is 5%. Changing it affects all future completed rentals and the finance reports on the
            Transactions page.
          </p>
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          title="Notifications"
          description="Admin email digests and alert preferences."
          icon="bell"
          onSave={() => saveSection('notifications')}
          saving={saving}
        >
          <Toggle
            label="Email digests"
            hint="A daily summary of new listings, visits and messages."
            checked={form.emailDigests}
            onChange={set('emailDigests')}
          />
          <Toggle
            label="Report alerts"
            hint="Instant email when a new trust & safety report is filed."
            checked={form.reportAlerts}
            onChange={set('reportAlerts')}
          />
          <Toggle
            label="Weekly finance summary"
            hint="Revenue, fees and payout totals every Monday morning."
            checked={form.weeklyFinanceSummary}
            onChange={set('weeklyFinanceSummary')}
          />
        </SectionCard>
      </div>

      {/* Danger zone */}
      <SectionCard
        title="Danger zone"
        description="Actions with platform-wide consequences. These cannot be undone casually."
        icon="shield"
        danger
        actionLabel={form.maintenanceMode ? 'Exit maintenance mode' : 'Enter maintenance mode'}
        onSave={() => toggleMaintenance(!form.maintenanceMode)}
        saving={saving}
      >
        <div className={cn('rounded-xl border p-4', form.maintenanceMode ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50')}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={cn('text-sm font-semibold', form.maintenanceMode ? 'text-red-800' : 'text-emerald-800')}>
                {form.maintenanceMode ? 'The platform is in maintenance mode' : 'Put the platform into maintenance mode'}
              </p>
              <p className={cn('mt-0.5 text-xs leading-relaxed', form.maintenanceMode ? 'text-red-700/80' : 'text-emerald-700/90')}>
                {form.maintenanceMode
                  ? 'All tenant and owner access is paused — only administrators can sign in. Exit maintenance mode to restore access.'
                  : 'All tenant and owner access is paused. Only administrators can sign in. Turn it back off from this panel when you are done.'}
              </p>
            </div>
            <Icon name="info" className={cn('h-8 w-8 shrink-0', form.maintenanceMode ? 'text-red-400' : 'text-emerald-400')} />
          </div>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          Current state:{' '}
          <span className={cn('font-semibold', form.maintenanceMode ? 'text-red-600' : 'text-emerald-600')}>
            {form.maintenanceMode ? 'Maintenance mode ON' : 'Live and accepting traffic'}
          </span>
        </p>
      </SectionCard>
    </div>
  );
}