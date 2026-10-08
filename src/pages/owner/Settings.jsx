import { useId, useState } from 'react';

import PageHeader from '../../components/dashboard/PageHeader';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import Input, { Select } from '../../components/common/Input';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { useDocumentTitle } from '../../hooks';
import { cn } from '../../utils/format';

/** Local switch used across the settings cards. */
function Toggle({ checked, onChange, label, description, disabled = false }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <label className="text-sm font-medium text-slate-800" htmlFor={id}>
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
          checked ? 'bg-brand-700' : 'bg-slate-300',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked && 'translate-x-5'
          )}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

function Card({ icon, tone = 'brand', title, description, children, onSave, saving, error }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    info: 'bg-sky-50 text-sky-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
  };
  return (
    <section className="rounded-xl border border-line bg-white">
      <header className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', tones[tone])}>
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">{title}</h2>
          {description && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>}
        </div>
      </header>

      <div className="px-5 py-2 sm:px-6">{children}</div>

      {error && (
        <p role="alert" className="mx-5 mb-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-600 sm:mx-6">
          {error}
        </p>
      )}

      <footer className="flex justify-end border-t border-line bg-slate-50/60 px-5 py-3.5 sm:px-6">
        <Button size="sm" loading={saving} onClick={onSave}>
          Save changes
        </Button>
      </footer>
    </section>
  );
}

export default function Settings() {
  useDocumentTitle('Settings');
  const { user } = useAuth();
  const toast = useToast();
  const { confirm } = useModals();

  const [settings, setSettings] = useState({
    autoPublish: false,
    showPhone: true,
    autoAcceptVisits: false,
    emailDigest: true,
    visitAlerts: true,
    messageAlerts: true,
    weeklyReport: false,
    payoutMethod: '',
    payoutSchedule: '',
    taxInfo: '',
    loginAlerts: true,
  });
  const [errors, setErrors] = useState({});
  const [savingCard, setSavingCard] = useState('');
  const [closing, setClosing] = useState(false);

  function set(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function saveCard(card, validator) {
    const found = validator ? validator() : {};
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setSavingCard(card);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setSavingCard('');
    toast.success('Settings saved.');
  }

  function validatePayments() {
    const found = {};
    if (!settings.payoutMethod) found.payoutMethod = 'Choose where your payouts should be sent.';
    if (!settings.payoutSchedule) found.payoutSchedule = 'Choose how often you want to be paid.';
    if (settings.taxInfo.trim() && settings.taxInfo.trim().length < 5)
      found.taxInfo = 'Enter a valid NTN or CNIC, or leave the field empty.';
    return found;
  }

  async function signOutOtherDevices() {
    const ok = await confirm({
      title: 'Sign out of all other devices?',
      message: 'Sessions on phones and computers other than this one will end immediately. You will stay signed in here.',
      confirmLabel: 'Sign out devices',
      tone: 'danger',
    });
    if (!ok) return;
    toast.success('All other devices have been signed out.', 'Security');
  }

  async function closeAccount() {
    const ok = await confirm({
      title: 'Close your owner account?',
      message:
        'Your listings, visits and conversations will be hidden from tenants and cannot be recovered. Earnings still pending must be settled before closure. This action is permanent.',
      confirmLabel: 'Request closure',
      tone: 'danger',
    });
    if (!ok) return;
    setClosing(true);
    toast.info('Your account closure request has been received. Our team will contact you within 2 business days.', 'Request received');
    setTimeout(() => setClosing(false), 800);
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Settings"
        subtitle="Control how your listings behave, what you get notified about, and how you are paid."
      />

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Listing preferences */}
        <Card
          icon="building"
          title="Listing preferences"
          description="Defaults applied to every property you publish."
          saving={savingCard === 'listing'}
          onSave={() => saveCard('listing')}
        >
          <div className="divide-y divide-line">
            <Toggle
              label="Auto-publish after approval"
              description="Disabled for now — every approved listing still requires your explicit publish action so nothing goes live without your review."
              checked={settings.autoPublish}
              onChange={() => {}}
              disabled
            />
            <Toggle
              label="Show my phone number on listings"
              description="Tenants can call you directly from the listing page."
              checked={settings.showPhone}
              onChange={(v) => set('showPhone', v)}
            />
            <Toggle
              label="Accept visit requests automatically"
              description="Requests for available slots are approved instantly without your confirmation."
              checked={settings.autoAcceptVisits}
              onChange={(v) => set('autoAcceptVisits', v)}
            />
          </div>
        </Card>

        {/* Notifications */}
        <Card
          icon="bell"
          tone="info"
          title="Notifications"
          description="Choose what reaches your inbox."
          saving={savingCard === 'notifications'}
          onSave={() => saveCard('notifications')}
        >
          <div className="divide-y divide-line">
            <Toggle
              label="Weekly email digest"
              description="A summary of views, saves and requests every Monday."
              checked={settings.emailDigest}
              onChange={(v) => set('emailDigest', v)}
            />
            <Toggle
              label="New visit request alerts"
              description="Get notified the moment a tenant requests a visit."
              checked={settings.visitAlerts}
              onChange={(v) => set('visitAlerts', v)}
            />
            <Toggle
              label="New message alerts"
              description="Ping me when a tenant replies in Messages."
              checked={settings.messageAlerts}
              onChange={(v) => set('messageAlerts', v)}
            />
            <Toggle
              label="Monthly performance report"
              description="Views, conversion and top performing listings for the month."
              checked={settings.weeklyReport}
              onChange={(v) => set('weeklyReport', v)}
            />
          </div>
        </Card>

        {/* Payments */}
        <Card
          icon="wallet"
          tone="warning"
          title="Payments"
          description="Where and how your rental payouts arrive."
          saving={savingCard === 'payments'}
          onSave={() => saveCard('payments', validatePayments)}
          error={errors.payoutMethod || errors.payoutSchedule || errors.taxInfo}
        >
          <div className="space-y-5 py-4">
            <Select
              label="Payout method"
              required
              placeholder="Select payout method"
              value={settings.payoutMethod}
              onChange={(e) => set('payoutMethod', e.target.value)}
              error={errors.payoutMethod}
            >
              <option value="bank">Bank transfer (IBAN)</option>
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">EasyPaisa</option>
            </Select>

            <Select
              label="Payout schedule"
              required
              placeholder="Select schedule"
              value={settings.payoutSchedule}
              onChange={(e) => set('payoutSchedule', e.target.value)}
              error={errors.payoutSchedule}
            >
              <option value="weekly">Weekly — every Monday</option>
              <option value="biweekly">Every two weeks</option>
              <option value="monthly">Monthly — 1st of each month</option>
            </Select>

            <Input
              label="Tax information"
              hint="Optional"
              placeholder="NTN or CNIC"
              value={settings.taxInfo}
              onChange={(e) => set('taxInfo', e.target.value)}
              error={errors.taxInfo}
            />

            <p className="rounded-lg bg-slate-50 px-3.5 py-3 text-xs leading-relaxed text-slate-500">
              A platform fee of 5% is deducted from each completed rental transaction before payout. You will receive
              a statement with every release.
            </p>
          </div>
        </Card>

        {/* Security */}
        <Card
          icon="shield"
          tone="danger"
          title="Security"
          description="Keep your listings and earnings protected."
          saving={savingCard === 'security'}
          onSave={() => saveCard('security')}
        >
          <div className="divide-y divide-line">
            <Toggle
              label="Login alerts"
              description="Email me when my account is accessed from a new device."
              checked={settings.loginAlerts}
              onChange={(v) => set('loginAlerts', v)}
            />
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">Other devices</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                  End every session except the one you are using right now.
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50" onClick={signOutOtherDevices}>
                <Icon name="logout" className="h-4 w-4" />
                Sign out other devices
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Danger zone */}
      <section className="mt-5 rounded-xl border border-red-200 bg-white">
        <header className="border-b border-red-100 px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold tracking-tight text-red-700 sm:text-base">Danger zone</h2>
          <p className="mt-0.5 text-xs text-slate-500">Actions here affect your entire account.</p>
        </header>
        <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800">Close account</p>
            <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-slate-500">
              Permanently remove your profile, listings and message history from RentLink. Pending earnings must be
              settled first, and this cannot be undone.
            </p>
          </div>
          <Button variant="danger" size="sm" loading={closing} onClick={closeAccount}>
            <Icon name="flag" className="h-4 w-4" />
            Close account
          </Button>
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-slate-500">
        Signed in as {user?.email} · RentLink Owner / Agent portal
      </p>
    </div>
  );
}
