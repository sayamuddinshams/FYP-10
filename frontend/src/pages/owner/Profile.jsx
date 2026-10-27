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
import Modal from '../../components/common/Modal';
import CnicVerificationModal from '../../components/owner/CnicVerificationModal';
import { DISTRICTS, getCities, getAreas } from '../../data/locations';
import { cn, formatDate } from '../../utils/format';

const PHONE_PATTERN = /^[+0-9][0-9\s-]{6,19}$/;

function maskCnic(cnic) {
  if (!cnic) return '–';
  const clean = String(cnic).replace(/\D/g, '');
  if (clean.length === 13) {
    return `${clean.slice(0, 5)}-*******-${clean.slice(12)}`;
  }
  return cnic;
}

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
  const [cnicModalOpen, setCnicModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [syncingNadra, setSyncingNadra] = useState(false);

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

  async function handleSubmitCnic(data) {
    setVerifying(true);
    try {
      await userService.submitCnicVerification(user.id, data);
      toast.success('CNIC documents submitted! Queued for NADRA database verification.', 'Verification Submitted');
      setCnicModalOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Unable to submit CNIC verification.');
    } finally {
      setVerifying(false);
    }
  }

  async function handleSimulateNadraSync(approve = true) {
    setSyncingNadra(true);
    try {
      await userService.simulateNadraSync(user.id, approve);
      if (approve) {
        toast.success('NADRA sync matched! Your account is now a Verified Landlord.', 'NADRA Verified');
      } else {
        toast.info('NADRA sync verification rejected.', 'Verification Update');
      }
    } catch (err) {
      toast.error(err?.message || 'NADRA verification simulation failed.');
    } finally {
      setSyncingNadra(false);
    }
  }

  const verified = user.verification === 'verified';
  const pending = user.verification === 'pending';
  const rejected = user.verification === 'rejected';

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
    <div>
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
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                  <Icon name="check" className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-emerald-900">Verified Landlord</p>
                    <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      NADRA
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                    Your Pakistani CNIC deed is verified against national records. Your listings feature the emerald trust badge.
                  </p>
                  {user.cnic && (
                    <div className="mt-2.5 flex items-center justify-between border-t border-emerald-200/60 pt-2 text-xs">
                      <span className="font-mono text-emerald-800 font-semibold">{maskCnic(user.cnic)}</span>
                      <button
                        type="button"
                        onClick={() => setCnicModalOpen(true)}
                        className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline"
                      >
                        View / Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : rejected ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-xs">
                  <Icon name="alert" className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-red-900">Verification Rejected</p>
                  <p className="mt-1 text-xs leading-relaxed text-red-700">
                    {user.verificationNotes || 'Your submitted CNIC documents could not be authenticated. Please re-upload clear photos.'}
                  </p>
                  <Button
                    className="mt-3"
                    size="sm"
                    variant="danger"
                    onClick={() => setCnicModalOpen(true)}
                  >
                    <Icon name="upload" className="h-4 w-4" />
                    Re-upload CNIC
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                  <Icon name="shield" className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    {pending ? 'Verification Under Review' : 'CNIC Verification Required'}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800">
                    {pending
                      ? 'Your CNIC is queued for NADRA registry cross-reference and landlord authenticity check.'
                      : 'Upload your CNIC (front & back) to qualify for NADRA synchronization and verified status.'}
                  </p>
                  {user.cnic && (
                    <div className="mt-2.5 flex items-center justify-between border-t border-amber-200/60 pt-2 text-xs">
                      <span className="font-mono text-amber-900 font-semibold">{maskCnic(user.cnic)}</span>
                      <span className="text-[10px] uppercase font-bold text-amber-700">Queued</span>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={pending ? 'outline' : 'warning'}
                      onClick={() => setCnicModalOpen(true)}
                    >
                      <Icon name="upload" className="h-4 w-4" />
                      {pending ? 'Update CNIC' : 'Upload CNIC'}
                    </Button>
                  </div>
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
                    ['Phone', user.phone || '–'],
                    ['District', user.district || '–'],
                    ['City / Town', user.city || '–'],
                    ['Area', user.area || '–'],
                    ['Address', user.address || '–'],
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
              {user.bio || 'Add a short bio so tenants know who they are dealing with. It appears on your listings and builds trust before the first visit.'}
            </p>
            <p className={cn('mt-4 rounded-lg px-3.5 py-3 text-xs leading-relaxed', verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
              {verified
                ? 'Your account is fully verified.'
                : 'Unverified owners can still publish listings, but verified profiles receive priority review and a visible badge.'}
            </p>
          </div>

          {/* CNIC & NADRA Verification Section */}
          <div className="mt-5 rounded-xl border border-line bg-white overflow-hidden shadow-xs">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                    CNIC &amp; NADRA Verification
                  </h2>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase',
                      verified
                        ? 'bg-emerald-100 text-emerald-800'
                        : pending
                          ? 'bg-amber-100 text-amber-800'
                          : rejected
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    {verified ? 'NADRA Verified' : pending ? 'Sync Queued' : rejected ? 'Rejected' : 'Not Submitted'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  National identity credentials for government registry match and landlord deed authentication.
                </p>
              </div>
              <Button size="sm" variant={user.cnic ? 'outline' : 'primary'} onClick={() => setCnicModalOpen(true)}>
                <Icon name="upload" className="h-4 w-4" />
                {user.cnic ? 'Update CNIC' : 'Upload CNIC'}
              </Button>
            </header>

            <div className="p-5 sm:p-6">
              {user.cnic ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div
                    className={cn(
                      'rounded-xl border p-4 text-xs',
                      verified
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : pending
                          ? 'border-amber-200 bg-amber-50 text-amber-900'
                          : 'border-red-200 bg-red-50 text-red-900'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white font-bold',
                          verified ? 'bg-emerald-600' : pending ? 'bg-amber-500' : 'bg-red-600'
                        )}
                      >
                        <Icon name={verified ? 'check' : pending ? 'shield' : 'alert'} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm">
                          {verified
                            ? 'National Identity Authenticated via NADRA'
                            : pending
                              ? 'CNIC Details Queued for NADRA Database Verification'
                              : 'CNIC Submission Not Accepted'}
                        </p>
                        <p className="mt-1 leading-relaxed opacity-90">
                          {verified
                            ? `Identity record matched with Pakistani national database. Verified on ${formatDate(user.verifiedAt || user.joinedAt)}.`
                            : pending
                              ? 'Your 13-digit identity number and photo documents are stored securely and formatted for automated synchronization with the NADRA government database.'
                              : user.verificationNotes || 'Your documents were rejected. Please review and upload clear photos.'}
                        </p>
                        {user.nadraTrackingId && (
                          <p className="mt-2 text-[11px] font-mono font-medium">
                            Tracking Reference: <span className="font-bold underline">{user.nadraTrackingId}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-line bg-slate-50/50 p-4 text-xs">
                    <div>
                      <dt className="font-semibold text-slate-500 uppercase tracking-wide">CNIC Number</dt>
                      <dd className="mt-1 font-mono text-sm font-bold text-slate-900">{user.cnic}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500 uppercase tracking-wide">Name on CNIC</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">{user.cnicName || user.name}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500 uppercase tracking-wide">Date of Birth</dt>
                      <dd className="mt-1 text-sm text-slate-700">{user.cnicDob || '–'}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-500 uppercase tracking-wide">CNIC Expiry</dt>
                      <dd className="mt-1 text-sm text-slate-700">{user.cnicExpiry || 'Lifetime'}</dd>
                    </div>
                  </dl>

                  {/* Document Scans Preview */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                      Uploaded Identity Documents (اصل شناختی دستاویزات)
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Front Card */}
                      <div className="rounded-xl border border-line bg-slate-50 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-white">
                              1
                            </span>
                            CNIC Front Side
                          </span>
                          {user.cnicFront && (
                            <button
                              type="button"
                              onClick={() => setPreviewDoc({ title: 'CNIC Front Side', image: user.cnicFront })}
                              className="text-xs font-semibold text-brand-700 hover:text-brand-900 hover:underline flex items-center gap-1"
                            >
                              <Icon name="eye" className="h-3.5 w-3.5" />
                              View full size
                            </button>
                          )}
                        </div>
                        {user.cnicFront ? (
                          <div
                            onClick={() => setPreviewDoc({ title: 'CNIC Front Side', image: user.cnicFront })}
                            className="group relative aspect-[1.58/1] overflow-hidden rounded-lg border border-slate-300 bg-white cursor-pointer shadow-2xs hover:shadow-md transition-all"
                          >
                            <img
                              src={user.cnicFront}
                              alt="CNIC Front"
                              className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm">
                                Click to enlarge
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-[1.58/1] rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                            No front photo uploaded
                          </div>
                        )}
                      </div>

                      {/* Back Card */}
                      <div className="rounded-xl border border-line bg-slate-50 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-white">
                              2
                            </span>
                            CNIC Back Side
                          </span>
                          {user.cnicBack && (
                            <button
                              type="button"
                              onClick={() => setPreviewDoc({ title: 'CNIC Back Side', image: user.cnicBack })}
                              className="text-xs font-semibold text-brand-700 hover:text-brand-900 hover:underline flex items-center gap-1"
                            >
                              <Icon name="eye" className="h-3.5 w-3.5" />
                              View full size
                            </button>
                          )}
                        </div>
                        {user.cnicBack ? (
                          <div
                            onClick={() => setPreviewDoc({ title: 'CNIC Back Side', image: user.cnicBack })}
                            className="group relative aspect-[1.58/1] overflow-hidden rounded-lg border border-slate-300 bg-white cursor-pointer shadow-2xs hover:shadow-md transition-all"
                          >
                            <img
                              src={user.cnicBack}
                              alt="CNIC Back"
                              className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm">
                                Click to enlarge
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-[1.58/1] rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                            No back photo uploaded
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* NADRA Sync Simulation Action (for testing & development) */}
                  {pending && (
                    <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                            <Icon name="spark" className="h-4 w-4 text-emerald-600" />
                            Prototype NADRA Database Sync Simulation
                          </p>
                          <p className="text-xs text-emerald-800 mt-0.5">
                            Test the automated NADRA database integration to immediately simulate successful registry matching.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="success"
                          loading={syncingNadra}
                          onClick={() => handleSimulateNadraSync(true)}
                          className="shrink-0"
                        >
                          <Icon name="check" className="h-4 w-4" />
                          Simulate NADRA Sync Match
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center bg-slate-50/30">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-100">
                    <Icon name="shield" className="h-7 w-7" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">Upload your CNIC for Landlord Verification</h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Verified landlords enjoy higher tenant inquiries, verified listings badges, and priority search rankings.
                    Upload front and back photos of your Pakistani National Identity Card to initiate verification.
                  </p>
                  <Button className="mt-4" onClick={() => setCnicModalOpen(true)}>
                    <Icon name="upload" className="h-4 w-4" />
                    Upload CNIC for Verification
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* CNIC Upload & Verification Modal */}
      <CnicVerificationModal
        open={cnicModalOpen}
        onClose={() => setCnicModalOpen(false)}
        user={user}
        onSubmit={handleSubmitCnic}
        loading={verifying}
      />

      {/* Document Full-Resolution Preview Modal */}
      <Modal
        open={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title || 'CNIC Document'}
        size="lg"
      >
        {previewDoc && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-inner flex items-center justify-center p-2">
              <img
                src={previewDoc.image}
                alt={previewDoc.title}
                className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

