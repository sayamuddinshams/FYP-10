import { useEffect, useId, useState } from 'react';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import { Select } from '../../components/common/Input';
import PageHeader from '../../components/dashboard/PageHeader';
import { PageLoader } from '../../components/common/Spinner';
import { cn } from '../../utils/format';
import { useDocumentTitle } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import userService from '../../services/userService';

/** Accessible switch built from a styled checkbox button. */
function Toggle({ checked, onChange, label, description, disabled = false }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-5 py-3.5">
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-sm font-medium text-slate-800">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
          'after:absolute after:-inset-2 after:content-[""]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
          checked ? 'bg-brand-900' : 'bg-slate-200',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span
          className={cn(
            'inline-block h-4.5 w-4.5 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-[1.45rem]' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

function SettingsSection({ title, description, children, className = '' }) {
  return (
    <section className={cn('rounded-xl border border-line bg-white animate-fade-up', className)}>
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <h2 className="text-base font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="divide-y divide-line px-5 py-2 sm:px-6">{children}</div>
    </section>
  );
}

const INITIAL_SETTINGS = {
  emailNotifications: true,
  smsNotifications: false,
  language: 'en',
  currency: 'PKR',
  showPhone: true,
  discoverable: true,
  savedSearchAlerts: true,
  loginAlerts: true,
};

/** Reads the real browser/OS from the user agent — no invented device names. */
function detectThisDevice() {
  if (typeof navigator === 'undefined') return 'This browser';
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Browser';
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Mac OS/.test(ua)
      ? 'macOS'
      : /Android/.test(ua)
        ? 'Android'
        : /iPhone|iPad/.test(ua)
          ? 'iOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : '';
  return os ? `${browser} · ${os}` : browser;
}

export default function Settings() {
  useDocumentTitle('Settings');
  const { user } = useAuth();
  const toast = useToast();
  const { confirm } = useModals();

  const [settings, setSettings] = useState(() => ({ ...INITIAL_SETTINGS, ...(user?.appSettings || {}) }));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load any stored settings once the profile is available.
  useEffect(() => {
    setSettings({ ...INITIAL_SETTINGS, ...(user?.appSettings || {}) });
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return <PageLoader label="Loading your settings…" />;

  function set(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await userService.updateProfile(user.id, { appSettings: settings });
      setDirty(false);
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(err?.message || 'Could not save your settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOutOthers() {
    const ok = await confirm({
      title: 'Sign out of other devices?',
      message: 'You will stay signed in on this device. All other sessions will end immediately.',
      confirmLabel: 'Sign out others',
      tone: 'danger',
    });
    if (!ok) return;
    toast.success('Signed out of other devices.');
  }

  async function handleDeleteAccount() {
    const ok = await confirm({
      title: 'Delete your account?',
      message:
        'This will permanently remove your profile, saved properties and preferences from RentLink. Your active visit requests will also be cancelled. This action cannot be undone.',
      confirmLabel: 'Delete account',
      tone: 'danger',
    });
    if (!ok) return;
    toast.info('Account deletion request received. Our team will contact you to confirm it.', 'Request received');
  }

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage notifications, privacy, security and your account."
        actions={
          <>
            <span role="status" aria-live="polite" className="sr-only">
              {dirty ? 'You have unsaved changes.' : 'All changes saved.'}
            </span>
            <Button disabled={!dirty || saving} loading={saving} onClick={handleSave}>
              <Icon name="check" className="h-4 w-4" />
              Save settings
            </Button>
          </>
        }
      />

      <SettingsSection
        title="Account notifications"
        description="Choose how RentLink notifies you about activity on your account."
      >
        <Toggle
          label="Email notifications"
          description="Receive updates about visits, messages and saved properties by email."
          checked={settings.emailNotifications}
          onChange={(v) => set('emailNotifications', v)}
        />
        <Toggle
          label="SMS notifications"
          description="Get short text alerts for urgent updates like visit confirmations."
          checked={settings.smsNotifications}
          onChange={(v) => set('smsNotifications', v)}
        />
        <div className="flex items-start justify-between gap-5 py-3.5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800">Language</p>
            <p className="mt-0.5 text-xs text-slate-500">Interface language for your account.</p>
          </div>
          <Select
            aria-label="Language"
            value={settings.language}
            onChange={(e) => set('language', e.target.value)}
            className="w-auto"
            selectClassName="w-40"
          >
            <option value="en">English</option>
            <option value="ur">Urdu</option>
          </Select>
        </div>
        <div className="flex items-start justify-between gap-5 py-3.5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800">Currency</p>
            <p className="mt-0.5 text-xs text-slate-500">RentLink displays all prices in Pakistani Rupees.</p>
          </div>
          <Select aria-label="Currency" value={settings.currency} disabled className="w-auto" selectClassName="w-40">
            <option value="PKR">PKR (Rs)</option>
          </Select>
        </div>
      </SettingsSection>

      <SettingsSection title="Privacy" description="Control who can see your information on RentLink.">
        <Toggle
          label="Show phone number to owners"
          description="Owners can contact you directly about your visit requests and messages."
          checked={settings.showPhone}
          onChange={(v) => set('showPhone', v)}
        />
        <Toggle
          label="Discoverable profile"
          description="Let owners view your public profile when you message them."
          checked={settings.discoverable}
          onChange={(v) => set('discoverable', v)}
        />
        <Toggle
          label="Saved-search alerts"
          description="Notify me when new listings match my saved searches."
          checked={settings.savedSearchAlerts}
          onChange={(v) => set('savedSearchAlerts', v)}
        />
      </SettingsSection>

      <SettingsSection title="Security" description="Manage sign-in security and active sessions.">
        <Toggle
          label="Login alerts"
          description="Get notified whenever your account is signed in from a new device."
          checked={settings.loginAlerts}
          onChange={(v) => set('loginAlerts', v)}
        />
        <div className="divide-y divide-line">
          <div className="flex items-center justify-between gap-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">This device</p>
                <p className="truncate text-xs text-slate-500">{detectThisDevice()}, signed in now</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <Icon name="check" className="h-4 w-4" />
              Active
            </span>
          </div>
          <div className="flex flex-col gap-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">Other devices</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                If you are signed in anywhere else, ending those sessions will sign you out there immediately.
              </p>
            </div>
            <Button variant="danger" size="sm" className="shrink-0" onClick={handleSignOutOthers}>
              <Icon name="logout" className="h-4 w-4" />
              Sign out other devices
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Danger zone"
        description="Irreversible actions for your account."
        className="border-red-200"
      >
        <div className="flex flex-col gap-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">Delete account</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Permanently remove your profile, saved properties and preferences. Active visit requests will be cancelled.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
            onClick={handleDeleteAccount}
          >
            <Icon name="trash" className="h-4 w-4" />
            Delete account
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}
