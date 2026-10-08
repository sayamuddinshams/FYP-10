import { useMemo, useState } from 'react';

import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import { RoleBadge, VerificationBadge } from '../../components/common/Badge';
import { ErrorState } from '../../components/common/Feedback';
import { StatSkeleton } from '../../components/common/Skeleton';
import { PageLoader } from '../../components/common/Spinner';
import Input, { Select } from '../../components/common/Input';

import userService from '../../services/userService';
import transactionService from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsync, useDocumentTitle, useStoreVersion } from '../../hooks';
import { DISTRICTS, getCities, getAreas } from '../../data/locations';
import { cn, formatDate } from '../../utils/format';

const PHONE_PATTERN = /^[+0-9][0-9\s-]{6,19}$/;

export default function Profile() {
  useDocumentTitle('My Profile');
  const { user } = useAuth();
  const toast = useToast();
  const version = useStoreVersion();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const { data: stats, loading, error, reload } = useAsync(
    () => transactionService.ownerSummary(user.id),
    [user?.id, version],
    { immediate: Boolean(user) }
  );

  const cities = useMemo(() => getCities(form?.district), [form?.district]);
  const areas = useMemo(() => getAreas(form?.district, form?.city), [form?.district, form?.city]);

  if (!user) return <PageLoader label="Loading your profile…" />;

  function startEditing() {
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      district: user.district || '',
      city: user.city || '',
      area: user.area || '',
      address: user.address || '',
    });
    setErrors({});
    setEditing(true);
  }

  function update(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'district') {
        next.city = '';
        next.area = '';
      }
      if (key === 'city') next.area = '';
      return next;
    });
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
    if (!form.phone.trim()) found.phone = 'Add a phone number so tenants can reach you.';
    else if (!PHONE_PATTERN.test(form.phone.trim())) found.phone = 'Enter a valid phone number, e.g. +92 355 4120876.';
    if (!form.district) found.district = 'Select your district.';
    if (!form.city) found.city = 'Select your city or town.';
    if (!form.address.trim()) found.address = 'Enter your address for the records.';
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setSaving(true);
    try {
      await userService.updateProfile(user.id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        district: form.district,
        city: form.city,
        area: form.area,
        address: form.address.trim(),
      });
      toast.success('Profile updated.', 'Saved');
      setEditing(false);
    } catch (err) {
      toast.error(err?.message || 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  }

  async function submitVerification() {
    setVerifying(true);
    try {
      await userService.setVerification(user.id, 'pending');
      toast.warning('Your owner verification is incomplete.', 'Verification');
      toast.success('Verification submitted for review.');
    } catch (err) {
      toast.error(err?.message || 'Unable to submit verification.');
    } finally {
      setVerifying(false);
    }
  }

  const verified = user.verification === 'verified';
  const pending = user.verification === 'pending';

  const statCards = [
    {
      label: 'Properties Managed',
      value: stats?.totalProperties || 0,
      icon: <Icon name="building" className="h-5 w-5" />,
      tone: 'brand',
      hint: `${stats?.activeListings || 0} live right now`,
    },
    {
      label: 'Total Views',
      value: stats?.totalViews || 0,
      icon: <Icon name="eye" className="h-5 w-5" />,
      tone: 'info',
      hint: 'Across all listings',
    },
    {
      label: 'Member Since',
      value: formatDate(user.joinedAt || user.memberSince),
      numeric: false,
      icon: <Icon name="calendar" className="h-5 w-5" />,
      tone: 'neutral',
      hint: user.memberSince || '',
    },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Profile"
        subtitle="How tenants and the RentLink team see you across the platform."
        actions={
          !editing && (
            <Button variant="outline" onClick={startEditing}>
              <Icon name="edit" className="h-4 w-4" />
              Edit profile
            </Button>
          )
        }
      />

      {/* Stats strip */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading && !stats
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
                <VerificationBadge status={user.verification} />
              </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-line pt-4 text-sm">
              {[
                ['Phone', user.phone || 'Not added'],
                ['Location', [user.area, user.city, user.district].filter(Boolean).join(', ') || 'Not set'],
                ['Address', user.address || 'Not set'],
                ['Joined', formatDate(user.joinedAt || user.memberSince)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <dt className="shrink-0 text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</dt>
                  <dd className="text-right text-sm break-words text-slate-700">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Verification */}
          {verified ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 animate-fade-up">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Icon name="check" className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Verified owner</p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                    Your identity and documents are confirmed. Verified listings carry a badge tenants look for.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 animate-fade-up">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                  <Icon name="alert" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-800">
                    {pending ? 'Verification under review' : 'Owner verification incomplete'}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-700">
                    {pending
                      ? 'Our trust team is checking your documents. You will be notified as soon as the review finishes.'
                      : 'Complete verification to earn the verified badge, build tenant trust and unlock priority placement.'}
                  </p>
                  <Button
                    className="mt-3"
                    size="sm"
                    variant="warning"
                    loading={verifying}
                    disabled={pending || verifying}
                    onClick={submitVerification}
                  >
                    {pending ? 'Verification in review' : 'Complete Verification'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Personal form */}
        <section className="lg:col-span-2">
          <div className="rounded-xl border border-line bg-white">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">Personal details</h2>
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
                    ['Phone', user.phone || '—'],
                    ['District', user.district || '—'],
                    ['City / Town', user.city || '—'],
                    ['Area', user.area || '—'],
                    ['Address', user.address || '—'],
                    ['Bio', user.bio || 'No bio added yet.'],
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
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    error={errors.phone}
                    placeholder="+92 355 4120876"
                  />
                  <Select
                    label="District"
                    required
                    placeholder="Select district"
                    value={form.district}
                    onChange={(e) => update('district', e.target.value)}
                    error={errors.district}
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label="City / Town"
                    required
                    placeholder={form.district ? 'Select city' : 'Select district first'}
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    error={errors.city}
                    disabled={!form.district}
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label="Area / Locality"
                    placeholder={form.city ? 'Select area' : 'Select city first'}
                    value={form.area}
                    onChange={(e) => update('area', e.target.value)}
                    disabled={!form.city}
                  >
                    {areas.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </Select>
                  <div className="sm:col-span-2">
                    <Input
                      label="Address"
                      required
                      value={form.address}
                      onChange={(e) => update('address', e.target.value)}
                      error={errors.address}
                      placeholder="House 14, Street 3, near the bazaar"
                    />
                  </div>

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

          <div className="mt-5 rounded-xl border border-line bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">About you</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {user.bio || 'Add a short bio so tenants know who they are dealing with — it appears on your listings and builds trust before the first visit.'}
            </p>
            <p className={cn('mt-4 rounded-lg px-3.5 py-3 text-xs leading-relaxed', verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
              {verified
                ? 'Your account is fully verified — listings you publish are reviewed within 24 hours.'
                : 'Unverified owners can still publish listings, but verified profiles receive priority review and a visible badge.'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
