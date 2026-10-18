import { useState } from 'react';

import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import { RoleBadge } from '../../components/common/Badge';
import { ErrorState } from '../../components/common/Feedback';
import { StatSkeleton } from '../../components/common/Skeleton';
import { PageLoader } from '../../components/common/Spinner';
import Input from '../../components/common/Input';

import userService from '../../services/userService';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsync, useDocumentTitle, useStoreVersion } from '../../hooks';
import { formatDate } from '../../utils/format';

const PHONE_PATTERN = /^[+0-9][0-9\s-]{6,19}$/;

export default function AdminProfile() {
  useDocumentTitle('My Profile');
  const { user } = useAuth();
  const toast = useToast();
  const version = useStoreVersion();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: counts, loading, error, reload } = useAsync(
    () => adminService.counts(),
    [version],
    { immediate: Boolean(user) }
  );

  if (!user) return <PageLoader label="Loading your profile…" />;

  function startEditing() {
    setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    setErrors({});
    setEditing(true);
  }

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function save() {
    const found = {};
    if (form.name.trim().length < 2) found.name = 'Enter your full name.';
    if (form.phone.trim() && !PHONE_PATTERN.test(form.phone.trim())) {
      found.phone = 'Enter a valid phone number, e.g. +92 355 4120876.';
    }
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setSaving(true);
    try {
      await userService.updateProfile(user.id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
      });
      toast.success('Profile updated.', 'Saved');
      setEditing(false);
    } catch (err) {
      toast.error(err?.message || 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  }

  const statCards = [
    {
      label: 'Registered Users',
      value: counts?.users ?? 0,
      icon: <Icon name="users" className="h-5 w-5" />,
      tone: 'brand',
      hint: 'Tenants and owners',
    },
    {
      label: 'Properties Listed',
      value: counts?.properties ?? 0,
      icon: <Icon name="building" className="h-5 w-5" />,
      tone: 'info',
      hint: `${counts?.pending ?? 0} awaiting verification`,
    },
    {
      label: 'Open Reports',
      value: counts?.reports ?? 0,
      icon: <Icon name="alert" className="h-5 w-5" />,
      tone: counts?.reports ? 'warning' : 'neutral',
      hint: 'Needs your attention',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Your administrator account on RentLink."
        actions={
          !editing && (
            <Button variant="outline" onClick={startEditing}>
              <Icon name="edit" className="h-4 w-4" />
              Edit profile
            </Button>
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading && !counts
          ? Array.from({ length: 3 }).map((_, i) => <StatSkeleton key={i} />)
          : error
            ? <div className="sm:col-span-2 xl:col-span-3"><ErrorState message={error} onRetry={reload} compact /></div>
            : statCards.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Identity */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-line bg-white p-5 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar name={user.name} size="xl" />
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">{user.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <RoleBadge role={user.role} />
              </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-line pt-4 text-sm">
              {[
                ['Phone', user.phone || 'Not added'],
                ['Status', user.status === 'suspended' ? 'Suspended' : 'Active'],
                ['Joined', formatDate(user.joinedAt || user.memberSince)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <dt className="shrink-0 text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</dt>
                  <dd className="text-right text-sm break-words text-slate-700">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-brand-100 bg-brand-50 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white">
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-900">Administrator access</p>
                <p className="mt-1 text-xs leading-relaxed text-brand-700">
                  You can review listings, manage users and moderate reports. Every approval action is recorded against
                  your account.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Account details */}
        <section className="lg:col-span-2">
          <div className="rounded-xl border border-line bg-white">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">Account details</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Your email is used for sign-in and cannot be changed here.
                </p>
              </div>
              {!editing && (
                <Button size="sm" variant="outline" onClick={startEditing}>
                  Edit
                </Button>
              )}
            </header>

            <div className="px-5 py-6 sm:px-6">
              {!editing ? (
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {[
                    ['Full name', user.name],
                    ['Email', user.email],
                    ['Phone', user.phone || '–'],
                    ['Role', 'Administrator'],
                    ['Account status', user.status === 'suspended' ? 'Suspended' : 'Active'],
                    ['Joined', formatDate(user.joinedAt || user.memberSince)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-slate-700">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Full name"
                    required
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    error={errors.name}
                    placeholder="Your full name"
                  />
                  <Input label="Email" value={form.email} readOnly disabled hint="Contact support to change it" />
                  <Input
                    label="Phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    error={errors.phone}
                    placeholder="+92 355 4120876"
                  />

                  <div className="flex flex-col gap-2.5 border-t border-line pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditing(false);
                        setErrors({});
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button loading={saving} onClick={save}>
                      Save changes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
