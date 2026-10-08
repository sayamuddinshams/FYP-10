import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../../components/dashboard/PageHeader';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import Input, { Textarea, Select } from '../../components/common/Input';
import { ListingStatusBadge } from '../../components/common/Badge';

import { PROPERTY_TYPES, AMENITIES, FURNISHING_OPTIONS, AMENITY_MAP } from '../../utils/constants';
import { DISTRICTS, getCities, getAreas } from '../../data/locations';
import propertyService from '../../services/propertyService';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks';
import { cn, formatDate, formatNumber } from '../../utils/format';

const MAX_IMAGES = 8;
const MIN_DESCRIPTION = 80;
const MIN_TITLE = 10;

const STEPS = [
  { label: 'Basics', title: 'Basic information', hint: 'What are you renting out?' },
  { label: 'Location', title: 'Location', hint: 'Where is the property?' },
  { label: 'Details', title: 'Property details', hint: 'Rent, size and availability' },
  { label: 'Amenities', title: 'Amenities', hint: 'What is included' },
  { label: 'Images', title: 'Photos', hint: 'Up to 8 bright, clear images' },
  { label: 'Review', title: 'Review and publish', hint: 'Check everything before submitting' },
];

const AMENITY_GLYPHS = {
  parking: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M10 16.5V7.5h3a2.75 2.75 0 0 1 0 5.5h-3" />
    </>
  ),
  water: <path d="M12 3.5s5.5 5.6 5.5 9.4a5.5 5.5 0 1 1-11 0C6.5 9.1 12 3.5 12 3.5z" />,
  electricity: <path d="M13.5 3 6 13.5h5L10.5 21 18 10.5h-5L13.5 3z" />,
  heating: (
    <>
      <circle cx="12" cy="12" r="3.75" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" />
    </>
  ),
  internet: (
    <>
      <path d="M4 9.7a12.4 12.4 0 0 1 16 0M7 13.2a7.6 7.6 0 0 1 10 0" />
      <circle cx="12" cy="17.3" r="1.2" />
    </>
  ),
  kitchen: <path d="M7.5 3v8M5.5 3.5v3.8a2 2 0 0 0 4 0V3.5M7.5 11v10M17.5 3c-1.6 1.1-2.5 3-2.5 5.3 0 1.6.9 2.7 2.5 3.1V21" />,
  balcony: <path d="M4.5 21V5.2L12 3l7.5 2.2V21M4.5 12.5h15M9.5 12.5V21M14.5 12.5V21M4.5 8.5h15" />,
  security: <path d="M12 3.5 5.5 6v6c0 4 2.8 6.9 6.5 8 3.7-1.1 6.5-4 6.5-8V6L12 3.5z" />,
};

function AmenityGlyph({ name, className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      {AMENITY_GLYPHS[name] || AMENITY_GLYPHS.parking}
    </svg>
  );
}

const emptyForm = {
  title: '',
  type: '',
  description: '',
  district: '',
  city: '',
  area: '',
  address: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  size: '',
  furnishing: '',
  availableFrom: '',
  amenities: [],
  images: [],
};

export default function AddProperty() {
  useDocumentTitle('Add Property');
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const fileInput = useRef(null);

  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState('');
  const [formError, setFormError] = useState('');
  const [dragging, setDragging] = useState(false);

  const cities = useMemo(() => getCities(form.district), [form.district]);
  const areas = useMemo(() => getAreas(form.district, form.city), [form.district, form.city]);

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

  function toggleAmenity(value) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(value)
        ? prev.amenities.filter((a) => a !== value)
        : [...prev.amenities, value],
    }));
  }

  function validateStep(index, isDraft = false) {
    const e = {};

    if (index === 0) {
      if (form.title.trim().length < MIN_TITLE) e.title = `Add a descriptive title of at least ${MIN_TITLE} characters.`;
      if (!form.type) e.type = 'Choose the type of property you are listing.';
      if (form.description.trim().length < MIN_DESCRIPTION)
        e.description = `Describe the property in at least ${MIN_DESCRIPTION} characters so tenants know what to expect.`;
    }

    if (index === 1) {
      if (!form.district) e.district = 'Select a district in Gilgit-Baltistan.';
      if (!form.city) e.city = 'Select a city or town.';
      if (!form.area) e.area = 'Select the area or locality.';
      if (!form.address.trim()) e.address = 'Enter the street address tenants should reach.';
    }

    if (index === 2) {
      if (!form.price || Number(form.price) <= 0) e.price = 'Enter a monthly rent greater than zero.';
      if (form.bedrooms === '' || Number(form.bedrooms) < 0) e.bedrooms = 'Enter the number of bedrooms (use 0 for commercial space).';
      if (form.bathrooms === '' || Number(form.bathrooms) < 0) e.bathrooms = 'Enter the number of bathrooms.';
      if (!form.size || Number(form.size) <= 0) e.size = 'Enter the covered area in square feet.';
      if (!form.furnishing) e.furnishing = 'Select the furnishing status.';
      if (!form.availableFrom) e.availableFrom = 'Pick the date the property becomes available.';
    }

    if (index === 4 && !isDraft && form.images.length === 0) {
      e.images = 'Add at least one photo — listings without photos are rarely trusted.';
    }

    return e;
  }

  function validateAll(isDraft) {
    const all = {};
    let firstStep = null;
    STEPS.forEach((_, i) => {
      const e = validateStep(i, isDraft);
      if (firstStep === null && Object.keys(e).length) firstStep = i;
      Object.assign(all, e);
    });
    return { errors: all, firstStep: firstStep === null ? null : firstStep };
  }

  function goTo(next) {
    const target = Math.max(0, Math.min(next, STEPS.length - 1));
    setStep(target);
    setMaxVisited((prev) => Math.max(prev, target));
    setFormError('');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleNext() {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length) {
      setFormError('Some details are missing — fix the highlighted fields to continue.');
      return;
    }
    setFormError('');
    goTo(step + 1);
  }

  function addFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) {
      toast.warning('Only image files can be uploaded.', 'Unsupported file');
      return;
    }
    const room = MAX_IMAGES - form.images.length;
    if (room <= 0) {
      toast.warning(`You can upload up to ${MAX_IMAGES} photos per listing.`, 'Photo limit reached');
      return;
    }
    const accepted = files.slice(0, room);
    const urls = accepted.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    if (files.length > room) {
      toast.warning(`Only ${room} more photo${room === 1 ? '' : 's'} could be added.`, 'Photo limit reached');
    }
  }

  function moveImage(index, direction) {
    setForm((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.images.length) return prev;
      const images = [...prev.images];
      [images[index], images[target]] = [images[target], images[index]];
      return { ...prev, images };
    });
  }

  function removeImage(index) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  }

  function makeMain(index) {
    if (index === 0) return;
    setForm((prev) => {
      const images = [...prev.images];
      const [picked] = images.splice(index, 1);
      return { ...prev, images: [picked, ...images] };
    });
    toast.info('Main photo updated.', 'Cover image');
  }

  function payload(isDraft) {
    return {
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim(),
      price: Number(form.price),
      district: form.district,
      city: form.city,
      area: form.area,
      address: form.address.trim(),
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      size: Number(form.size) || 0,
      furnishing: form.furnishing,
      availableFrom: form.availableFrom,
      amenities: form.amenities,
      images: form.images,
      status: isDraft ? 'draft' : 'pending',
    };
  }

  async function handleSave(isDraft) {
    const { errors: all, firstStep } = validateAll(isDraft);
    if (firstStep !== null) {
      setErrors(all);
      setStep(firstStep);
      setFormError(
        isDraft
          ? 'A few required details are still missing before this draft can be saved.'
          : 'Some details are missing — fix the highlighted fields before submitting.'
      );
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(isDraft ? 'draft' : 'review');
    setFormError('');
    try {
      await propertyService.create(payload(isDraft), user.id);
      toast.success(isDraft ? 'Listing saved as draft.' : 'Property submitted for review.');
      navigate('/owner/properties');
    } catch (err) {
      const message = err?.message || (isDraft ? 'Unable to save the draft.' : 'Unable to submit property.');
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving('');
    }
  }

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Add a new property"
        subtitle="Six short steps. Your listing is reviewed by our team before it goes live."
        back="/owner/properties"
        backLabel="My properties"
      />

      {/* Stepper */}
      <div className="mb-6 rounded-xl border border-line bg-white p-4 sm:p-5">
        <ol className="flex items-start justify-between gap-1 sm:gap-3">
          {STEPS.map((s, i) => {
            const completed = i < step;
            const current = i === step;
            const reachable = i <= maxVisited;
            return (
              <li key={s.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => reachable && goTo(i)}
                  aria-current={current ? 'step' : undefined}
                  aria-label={`Step ${i + 1}: ${s.label}`}
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300',
                    completed && 'bg-brand-700 text-white hover:bg-brand-800',
                    current && 'bg-white text-brand-800 ring-2 ring-brand-600 ring-offset-2',
                    !completed && !current && 'bg-slate-100 text-slate-400',
                    reachable && 'cursor-pointer',
                    !reachable && 'cursor-not-allowed'
                  )}
                >
                  {completed ? (
                    <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    i + 1
                  )}
                </button>
                <span
                  className={cn(
                    'hidden text-[11px] font-semibold sm:block',
                    current ? 'text-brand-800' : completed ? 'text-slate-600' : 'text-slate-400'
                  )}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-700 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-label="Listing progress"
          />
        </div>
      </div>

      {formError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 animate-fade-up"
        >
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Step content */}
      <div key={step} className="rounded-xl border border-line bg-white p-5 animate-fade-up sm:p-6">
        <header className="mb-6 border-b border-line pb-4">
          <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{STEPS[step].title}</h2>
          <p className="mt-1 text-sm text-slate-500">{STEPS[step].hint}</p>
        </header>

        {/* ---------- Step 1: Basics ---------- */}
        {step === 0 && (
          <div className="space-y-5">
            <Input
              label="Listing title"
              required
              placeholder="e.g. Sunlit 3-bedroom house with garden in Jutial"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              error={errors.title}
              hint={`${form.title.trim().length}/${MIN_TITLE} min characters`}
              maxLength={80}
            />

            <Select
              label="Property type"
              required
              placeholder="Select a property type"
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              error={errors.type}
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>

            <Textarea
              label="Description"
              required
              rows={7}
              placeholder="Describe the layout, light, surroundings, nearby landmarks, parking, water supply and anything a tenant should know before booking a visit."
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              error={errors.description}
              hint={`${form.description.trim().length}/${MIN_DESCRIPTION} min characters`}
            />

            <div className="flex items-start gap-2.5 rounded-lg bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800">
              <Icon name="spark" className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Listings with a specific title and a full description are approved faster and receive significantly
                more visit requests.
              </p>
            </div>
          </div>
        )}

        {/* ---------- Step 2: Location ---------- */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-3">
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
                required
                placeholder={form.city ? 'Select area' : 'Select city first'}
                value={form.area}
                onChange={(e) => update('area', e.target.value)}
                error={errors.area}
                disabled={!form.city}
              >
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </div>

            <Input
              label="Street address"
              required
              placeholder="House 14, Street 3, near the bazaar"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              error={errors.address}
            />

            <div className="rounded-xl border border-dashed border-line bg-slate-50 px-4 py-6 text-center">
              <Icon name="pin" className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-600">Map pinning will be available at launch</p>
              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-400">
                Your written address is enough for now — the exact pin is shared with a tenant only after you approve
                their visit request.
              </p>
            </div>
          </div>
        )}

        {/* ---------- Step 3: Details ---------- */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Monthly rent (PKR)"
                required
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="45000"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                error={errors.price}
                rightIcon={
                  <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-xs font-medium text-slate-400">
                    Rs / mo
                  </span>
                }
              />

              <Input
                label="Covered area (sq ft)"
                required
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="1200"
                value={form.size}
                onChange={(e) => update('size', e.target.value)}
                error={errors.size}
              />

              <Input
                label="Bedrooms"
                required
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="3"
                value={form.bedrooms}
                onChange={(e) => update('bedrooms', e.target.value)}
                error={errors.bedrooms}
              />

              <Input
                label="Bathrooms"
                required
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="2"
                value={form.bathrooms}
                onChange={(e) => update('bathrooms', e.target.value)}
                error={errors.bathrooms}
              />

              <Select
                label="Furnishing"
                required
                placeholder="Select furnishing"
                value={form.furnishing}
                onChange={(e) => update('furnishing', e.target.value)}
                error={errors.furnishing}
              >
                {FURNISHING_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>

              <Input
                label="Available from"
                required
                type="date"
                value={form.availableFrom}
                onChange={(e) => update('availableFrom', e.target.value)}
                error={errors.availableFrom}
              />
            </div>

            {form.price && Number(form.price) > 0 && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <span>
                  Rent:{' '}
                  <strong className="text-slate-900">Rs {formatNumber(form.price)} / month</strong>
                </span>
                <span>
                  Tenant pays once:{' '}
                  <strong className="text-slate-900">Rs {formatNumber(Number(form.price) * 2)}</strong> (rent + refundable security)
                </span>
              </div>
            )}
          </div>
        )}

        {/* ---------- Step 4: Amenities ---------- */}
        {step === 3 && (
          <div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {AMENITIES.map((a) => {
                const active = form.amenities.includes(a.value);
                return (
                  <button
                    key={a.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleAmenity(a.value)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200',
                      active
                        ? 'border-brand-600 bg-brand-50 text-brand-800 shadow-sm'
                        : 'border-line bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/40'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                        active ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      <AmenityGlyph name={a.value} />
                    </span>
                    <span className="flex-1">{a.label}</span>
                    <Icon
                      name={active ? 'check' : 'plus'}
                      className={cn('h-4 w-4', active ? 'text-brand-700' : 'text-slate-300')}
                      strokeWidth={2.2}
                    />
                  </button>
                );
              })}
            </div>

            <p
              className={cn(
                'mt-5 rounded-lg px-4 py-3 text-xs leading-relaxed',
                form.amenities.length >= 3 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'
              )}
            >
              {form.amenities.length} selected · {form.amenities.length >= 3 ? 'Nice — this listing now covers the essentials most tenants filter for.' : 'Selecting three or more amenities is recommended — they are the filters tenants use most.'}
            </p>
          </div>
        )}

        {/* ---------- Step 5: Images ---------- */}
        {step === 4 && (
          <div className="space-y-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              className={cn(
                'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-200',
                dragging ? 'border-brand-500 bg-brand-50' : 'border-line bg-slate-50'
              )}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-700 shadow-sm">
                <Icon name="image" className="h-6 w-6" />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-800">Drag photos here, or browse</p>
              <p className="mt-1 text-xs text-slate-500">
                JPG or PNG · up to {MAX_IMAGES} images · the first photo is your cover image
              </p>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                id="property-images"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => fileInput.current?.click()}
                disabled={form.images.length >= MAX_IMAGES}
              >
                <Icon name="plus" className="h-4 w-4" />
                Choose photos
              </Button>
              {errors.images && (
                <p role="alert" className="mt-3 text-xs font-medium text-red-600">
                  {errors.images}
                </p>
              )}
            </div>

            {form.images.length > 0 ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {form.images.map((url, index) => (
                  <li
                    key={url}
                    className="group overflow-hidden rounded-xl border border-line bg-white animate-pop"
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <div className="relative aspect-[4/3] bg-slate-100">
                      <img src={url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 rounded-md bg-brand-900/90 px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
                          Main image
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label={`Remove photo ${index + 1}`}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Icon name="trash" className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1 px-2 py-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveImage(index, -1)}
                          aria-label={`Move photo ${index + 1} earlier`}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-slate-500 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Icon name="chevronLeft" className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === form.images.length - 1}
                          onClick={() => moveImage(index, 1)}
                          aria-label={`Move photo ${index + 1} later`}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-slate-500 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Icon name="chevronRight" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => makeMain(index)}
                          className="rounded-md px-1.5 py-1 text-[11px] font-semibold text-brand-700 transition hover:bg-brand-50"
                        >
                          Set as main
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-sm text-slate-400">
                No photos added yet. Drafts can be saved without photos, but submissions need at least one.
              </p>
            )}

            <p className="text-center text-xs text-slate-400">
              {form.images.length} of {MAX_IMAGES} photos used
            </p>
          </div>
        )}

        {/* ---------- Step 6: Review ---------- */}
        {step === 5 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Preview */}
            <div className="overflow-hidden rounded-xl border border-line transition hover:shadow-lg hover:shadow-brand-900/5">
              <div className="relative aspect-[4/3] bg-slate-100">
                {form.images[0] ? (
                  <img src={form.images[0]} alt={form.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                    <Icon name="image" className="h-8 w-8" />
                    <span className="text-xs">No cover photo yet</span>
                  </div>
                )}
                <span className="absolute top-3 left-3 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-800 shadow-sm">
                  Preview
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-lg font-bold text-slate-900">
                    Rs {formatNumber(form.price)}
                    <span className="text-sm font-medium text-slate-500"> / month</span>
                  </p>
                  <ListingStatusBadge status="pending" />
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">
                  {form.title || 'Your listing title'}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {form.area}, {form.city}, {form.district}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>{form.bedrooms || 0} bed</span>
                  <span>{form.bathrooms || 0} bath</span>
                  <span>{formatNumber(form.size || 0)} sq ft</span>
                  <span>{form.furnishing || 'Unfurnished'}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <dl className="divide-y divide-line rounded-xl border border-line">
              {[
                ['Title', form.title],
                ['Type', PROPERTY_TYPES.find((t) => t.value === form.type)?.label || '—'],
                ['Monthly rent', `Rs ${formatNumber(form.price || 0)}`],
                ['Location', `${form.area}, ${form.city}, ${form.district}`],
                ['Address', form.address],
                ['Bedrooms / Bathrooms', `${form.bedrooms} / ${form.bathrooms}`],
                ['Covered area', `${formatNumber(form.size || 0)} sq ft`],
                ['Furnishing', form.furnishing],
                ['Available from', form.availableFrom ? formatDate(form.availableFrom) : '—'],
                [
                  'Amenities',
                  form.amenities.length
                    ? form.amenities.map((a) => AMENITY_MAP[a]).join(', ')
                    : 'None selected',
                ],
                ['Photos', `${form.images.length} of ${MAX_IMAGES}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 px-4 py-3">
                  <dt className="shrink-0 text-xs font-semibold tracking-wide text-slate-400 uppercase">{label}</dt>
                  <dd className="text-right text-sm text-slate-700">{value || '—'}</dd>
                </div>
              ))}
            </dl>

            <div className="lg:col-span-2">
              <div className="flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3.5 text-xs leading-relaxed text-brand-800">
                <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Submitting sends your listing to the RentLink review team. Most listings are checked within 24
                  hours — you will be notified as soon as it is approved, and any required changes will be listed for
                  you here.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 z-20 mt-5 flex flex-col-reverse gap-3 rounded-xl border border-line bg-white/95 px-4 py-3.5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <Button variant="ghost" onClick={() => goTo(step - 1)} disabled={step === 0 || Boolean(saving)}>
          <Icon name="arrowLeft" className="h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={Boolean(saving)}>
              Continue
              <Icon name="arrowRight" className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                loading={saving === 'draft'}
                disabled={Boolean(saving)}
                onClick={() => handleSave(true)}
              >
                Save Draft
              </Button>
              <Button loading={saving === 'review'} disabled={Boolean(saving)} onClick={() => handleSave(false)}>
                Submit for Review
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
