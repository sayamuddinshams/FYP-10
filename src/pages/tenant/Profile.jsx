import { useEffect, useState } from 'react';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import Input, { Textarea, Select, Checkbox } from '../../components/common/Input';
import PageHeader from '../../components/dashboard/PageHeader';
import Badge, { RoleBadge, VerificationBadge } from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Spinner';
import { formatDate } from '../../utils/format';
import { useDocumentTitle } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import userService from '../../services/userService';
import { DISTRICTS, getAreas, getCities } from '../../data/locations';
import { PROPERTY_TYPES } from '../../utils/constants';

const EMPTY_FORM = { name: '', phone: '', district: '', city: '', area: '', address: '' };
const EMPTY_PREFS = { preferredType: '', budgetMax: '' };

function validPhone(value) {
  return String(value).replace(/\D/g, '').length >= 10;
}

export default function Profile() {
  useDocumentTitle('Profile');
  const { user } = useAuth();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [prefs, setPrefs] = useState(EMPTY_PREFS);
  const [errors, setErrors] = useState({});

  const [notifPrefs, setNotifPrefs] = useState({
    emailAlerts: true,
    visitUpdates: true,
    newMessages: true,
    recommendations: true,
  });

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      district: user.district || '',
      city: user.city || '',
      area: user.area || '',
      address: user.address || '',
    });
    setPrefs({
      preferredType: user.preferredType || '',
      budgetMax: user.budgetMax ? String(user.budgetMax) : '',
    });
    setNotifPrefs((prev) => ({ ...prev, ...(user.notificationPrefs || {}) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return <PageLoader label="Loading your profile…" />;

  const cities = getCities(form.district);
  const areas = form.district ? getAreas(form.district, form.city) : [];

  function setField(key, value) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'district') {
        next.city = '';
        next.area = '';
      }
      if (key === 'city') next.area = '';
      return next;
    });
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function resetFromUser() {
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      district: user.district || '',
      city: user.city || '',
      area: user.area || '',
      address: user.address || '',
    });
    setPrefs({
      preferredType: user.preferredType || '',
      budgetMax: user.budgetMax ? String(user.budgetMax) : '',
    });
    setErrors({});
    setEditing(false);
  }

  function validateProfile() {
    const e = {};
    if (!String(form.name).trim()) e.name = 'Full name is required.';
    if (!String(form.phone).trim()) e.phone = 'Phone number is required.';
    else if (!validPhone(form.phone)) e.phone = 'Enter a valid phone number (at least 10 digits).';
    if (form.district && !form.city) e.city = 'Select a city for this district.';
    return e;
  }

  async function handleSave() {
    const e = validateProfile();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error('Please fix the highlighted fields.', 'Check your details');
      return;
    }
    setSaving(true);
    try {
      await userService.updateProfile(user.id, {
        ...form,
        name: form.name.trim(),
        preferredType: prefs.preferredType || null,
        budgetMax: prefs.budgetMax ? Number(prefs.budgetMax) : null,
      });
      toast.success('Profile updated.');
      setEditing(false);
    } catch (err) {
      toast.error(err?.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function validatePassword() {
    const e = {};
    if (!pw.current) e.current = 'Enter your current password.';
    if (!pw.next) e.next = 'Enter a new password.';
    else if (pw.next.length < 8) e.next = 'Use at least 8 characters.';
    if (pw.next !== pw.confirm) e.confirm = 'Passwords do not match.';
    return e;
  }

  async function handleChangePassword() {
    const e = validatePassword();
    setPwErrors(e);
    if (Object.keys(e).length) {
      toast.error('Please fix the highlighted fields.', 'Check your password');
      return;
    }
    setPwSaving(true);
    try {
      await userService.updateProfile(user.id, { password: pw.next });
      toast.success('Password changed. Use it next time you sign in.');
      setPw({ current: '', next: '', confirm: '' });
      setPwErrors({});
    } catch (err) {
      toast.error(err?.message || 'Could not change the password. Please try again.');
    } finally {
      setPwSaving(false);
    }
  }

  async function handleSaveNotifPrefs() {
    setPrefsSaving(true);
    try {
      await userService.updateProfile(user.id, { notificationPrefs: notifPrefs });
      toast.success('Notification preferences saved.');
    } catch (err) {
      toast.error(err?.message || 'Could not save preferences.');
    } finally {
      setPrefsSaving(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Profile"
        subtitle="Manage your personal details, password and account preferences."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* identity card */}
        <aside className="h-fit rounded-xl border border-line bg-white p-6 text-center lg:sticky lg:top-24">
          <Avatar name={user.name} size="xl" className="mx-auto" />
          <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900">{user.name}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{user.email}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <RoleBadge role={user.role} />
            <VerificationBadge status={user.verification} />
          </div>

          <dl className="mt-5 divide-y divide-line rounded-xl border border-line text-left text-sm">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="flex items-center gap-2 text-slate-500">
                <Icon name="calendar" className="h-4 w-4 text-slate-500" />
                Member since
              </dt>
              <dd className="font-medium text-slate-800">
                {user.memberSince || formatDate(user.joinedAt, { month: 'long', year: 'numeric' })}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="flex items-center gap-2 text-slate-500">
                <Icon name="pin" className="h-4 w-4 text-slate-500" />
                Location
              </dt>
              <dd className="font-medium text-slate-800">{user.city ? `${user.city}, ${user.district}` : 'Not set'}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="flex items-center gap-2 text-slate-500">
                <Icon name="phone" className="h-4 w-4 text-slate-500" />
                Phone
              </dt>
              <dd className="font-medium text-slate-800">{user.phone || 'Not set'}</dd>
            </div>
          </dl>
        </aside>

        <div className="space-y-6">
          {/* personal information */}
          <section className="rounded-xl border border-line bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900">Personal information</h2>
                <p className="mt-0.5 text-sm text-slate-500">Update your contact details and location.</p>
              </div>
              {editing ? (
                <Badge tone="warning">Editing enabled</Badge>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                  <Icon name="edit" className="h-4 w-4" />
                  Edit profile
                </Button>
              )}
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar name={user.name} size="lg" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role} account</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => toast.info('Profile photo upload is coming soon.', 'Change photo')}
                >
                  <Icon name="image" className="h-4 w-4" />
                  Change photo
                </Button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Full name"
                  required
                  value={form.name}
                  error={errors.name}
                  disabled={!editing}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Your full name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={user.email}
                  disabled
                  hint="Managed by RentLink"
                />
                <Input
                  label="Phone"
                  required
                  value={form.phone}
                  error={errors.phone}
                  disabled={!editing}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="+92 3XX XXXXXXX"
                />
                <Select
                  label="District"
                  value={form.district}
                  error={errors.district}
                  disabled={!editing}
                  onChange={(e) => setField('district', e.target.value)}
                  placeholder="Select district"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
                <Select
                  label="City"
                  value={form.city}
                  error={errors.city}
                  disabled={!editing || !form.district}
                  onChange={(e) => setField('city', e.target.value)}
                  placeholder={form.district ? 'Select city' : 'Choose a district first'}
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Area"
                  value={form.area}
                  disabled={!editing || !form.city}
                  onChange={(e) => setField('area', e.target.value)}
                  placeholder={form.city ? 'Select area (optional)' : 'Choose a city first'}
                >
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </Select>
              </div>

              <Textarea
                label="Address"
                rows={3}
                value={form.address}
                disabled={!editing}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Street, building and nearby landmarks"
              />
            </div>
          </section>

          {/* account & preferences */}
          <section className="rounded-xl border border-line bg-white">
            <div className="border-b border-line px-5 py-4 sm:px-6">
              <h2 className="text-base font-bold tracking-tight text-slate-900">Account &amp; preferences</h2>
              <p className="mt-0.5 text-sm text-slate-500">Password, notifications and your rental preferences.</p>
            </div>

            <div className="space-y-6 px-5 py-5 sm:px-6">
              {/* change password */}
              <div>
                <h3 className="text-sm font-bold text-slate-800">Change password</h3>
                <p className="mt-0.5 text-xs text-slate-500">Use at least 8 characters.</p>
                <div className="mt-4 grid gap-5 sm:grid-cols-3">
                  <Input
                    label="Current password"
                    type="password"
                    value={pw.current}
                    error={pwErrors.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <Input
                    label="New password"
                    type="password"
                    value={pw.next}
                    error={pwErrors.next}
                    onChange={(e) => setPw({ ...pw, next: e.target.value })}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                  <Input
                    label="Confirm new password"
                    type="password"
                    value={pw.confirm}
                    error={pwErrors.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" loading={pwSaving} onClick={handleChangePassword}>
                    <Icon name="key" className="h-4 w-4" />
                    Update password
                  </Button>
                </div>
              </div>

              {/* notification preferences */}
              <div className="border-t border-line pt-6">
                <h3 className="text-sm font-bold text-slate-800">Notification preferences</h3>
                <p className="mt-0.5 text-xs text-slate-500">Choose what you want to hear about.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Checkbox
                    label="Email alerts"
                    checked={notifPrefs.emailAlerts}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, emailAlerts: e.target.checked })}
                  />
                  <Checkbox
                    label="Visit updates"
                    checked={notifPrefs.visitUpdates}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, visitUpdates: e.target.checked })}
                  />
                  <Checkbox
                    label="New messages"
                    checked={notifPrefs.newMessages}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, newMessages: e.target.checked })}
                  />
                  <Checkbox
                    label="Property recommendations"
                    checked={notifPrefs.recommendations}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, recommendations: e.target.checked })}
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" loading={prefsSaving} onClick={handleSaveNotifPrefs}>
                    <Icon name="check" className="h-4 w-4" />
                    Save preferences
                  </Button>
                </div>
              </div>

              {/* rental preferences */}
              <div className="border-t border-line pt-6">
                <h3 className="text-sm font-bold text-slate-800">Rental preferences</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Used to tailor recommendations in your dashboard{editing ? ' — saved with Save changes.' : '.'}
                </p>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <Select
                    label="Preferred property type"
                    value={prefs.preferredType}
                    disabled={!editing}
                    onChange={(e) => setPrefs({ ...prefs, preferredType: e.target.value })}
                    placeholder="Any type"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Maximum monthly budget (Rs)"
                    type="number"
                    min={0}
                    step={1000}
                    value={prefs.budgetMax}
                    disabled={!editing}
                    onChange={(e) => setPrefs({ ...prefs, budgetMax: e.target.value })}
                    placeholder="e.g. 45000"
                  />
                </div>
              </div>
            </div>
          </section>

          {editing && (
            <div className="flex flex-wrap items-center justify-end gap-2 rounded-xl border border-line bg-white p-4">
              <Button variant="ghost" onClick={resetFromUser}>
                Cancel
              </Button>
              <Button loading={saving} onClick={handleSave}>
                <Icon name="check" className="h-4 w-4" />
                Save changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}