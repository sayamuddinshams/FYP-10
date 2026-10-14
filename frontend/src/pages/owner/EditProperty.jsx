import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import PageHeader from '../../components/dashboard/PageHeader';
import Button from '../../components/common/Button';
import Icon from '../../components/common/icons';
import Input, { Textarea, Select } from '../../components/common/Input';
import { ListingStatusBadge } from '../../components/common/Badge';
import { ErrorState } from '../../components/common/Feedback';
import { PageLoader } from '../../components/common/Spinner';

import propertyService from '../../services/propertyService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModals } from '../../context/ModalContext';
import { useAsync, useDocumentTitle } from '../../hooks';
import { PROPERTY_TYPES, AMENITIES, FURNISHING_OPTIONS, AMENITY_MAP } from '../../utils/constants';
import { DISTRICTS, getCities, getAreas } from '../../data/locations';
import { cn, formatDate, formatNumber } from '../../utils/format';

const MAX_IMAGES = 8;
const MIN_DESCRIPTION = 80;
const MIN_TITLE = 10;

/** Scroll-spy rail sections — ids must match the Section elements below. */
/** Which rail section owns a given form field — used by "Fix the first issue". */
const FIELD_SECTION = {
  title: "sec-basics",
  type: "sec-basics",
  description: "sec-basics",
  district: "sec-location",
  city: "sec-location",
  area: "sec-location",
  address: "sec-location",
  price: "sec-details",
  bedrooms: "sec-details",
  bathrooms: "sec-details",
  size: "sec-details",
  furnishing: "sec-details",
  availableFrom: "sec-details",
  images: "sec-photos",
};

const RAIL_SECTIONS = [
  { id: 'sec-basics', label: 'Basics' },
  { id: 'sec-location', label: 'Location' },
  { id: 'sec-details', label: 'Rent & details' },
  { id: 'sec-amenities', label: 'Amenities' },
  { id: 'sec-photos', label: 'Photos' },
  { id: 'sec-availability', label: 'Availability' },
  { id: 'sec-review', label: 'Review & submit' },
];

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return 'Photo ready';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

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

function toForm(property) {
  return {
    title: property.title || '',
    type: property.type || '',
    description: property.description || '',
    district: property.district || '',
    city: property.city || '',
    area: property.area || '',
    address: property.address || '',
    price: property.price ?? '',
    bedrooms: property.bedrooms ?? '',
    bathrooms: property.bathrooms ?? '',
    size: property.size ?? '',
    furnishing: property.furnishing || '',
    availableFrom: property.availableFrom || '',
    amenities: [...(property.amenities || [])],
    images: [...(property.images || [])],
  };
}

function Section({ id, title, description, children }) {
  return (
    <section id={id} className="scroll-mt-36 border-b border-line px-5 py-6 last:border-b-0 sm:px-6">
      <header className="mb-5">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">{title}</h2>
        {description && <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>}
      </header>
      {children}
    </section>
  );
}

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { confirm } = useModals();
  const fileInput = useRef(null);

  useDocumentTitle('Edit Property');

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState('');
  const [formError, setFormError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [activeSection, setActiveSection] = useState(RAIL_SECTIONS[0].id);
  const [loadedId, setLoadedId] = useState(null);
  const [baseline, setBaseline] = useState('');
  // UI-only upload state: files skipped during selection (with reasons) and
  // per-image metadata for the status chips. Never part of the submit payload.
  const [rejected, setRejected] = useState([]);
  const [fileMeta, setFileMeta] = useState({});

  const { data: property, loading, error, reload } = useAsync(
    () => propertyService.getById(id),
    [id],
    { immediate: Boolean(id) }
  );

  // Prefill once per property id — re-prefills correctly if the route id changes,
  // and never clobbers in-progress edits on a background reload.
  useEffect(() => {
    if (property && !loading && loadedId !== id) {
      setForm(toForm(property));
      setBaseline(JSON.stringify(toForm(property)));
      setLoadedId(id);
      setErrors({});
      setRejected([]);
      setFileMeta({});
    }
  }, [property, loading, id, loadedId]);

  const dirty = Boolean(form && baseline) && JSON.stringify(form) !== baseline;

  // Warn before losing edits on refresh / tab close. Never discards user input.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Scroll-spy for the sticky section rail (rAF-throttled).
  useEffect(() => {
    if (!form) return undefined;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const OFFSET = 150;
        let current = RAIL_SECTIONS[0].id;
        RAIL_SECTIONS.forEach((s) => {
          const el = document.getElementById(s.id);
          if (el && el.getBoundingClientRect().top <= OFFSET) current = s.id;
        });
        setActiveSection((prev) => (prev === current ? prev : current));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [Boolean(form)]);

  const cities = useMemo(() => getCities(form?.district), [form?.district]);
  const areas = useMemo(() => getAreas(form?.district, form?.city), [form?.district, form?.city]);

  if (loading && !property) return <PageLoader label="Loading listing…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!form) return <PageLoader label="Preparing the editor…" />;

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

  function validate(isDraft) {
    const e = {};
    if (form.title.trim().length < MIN_TITLE) e.title = `Add a descriptive title of at least ${MIN_TITLE} characters.`;
    if (!form.type) e.type = 'Choose the type of property you are listing.';
    if (form.description.trim().length < MIN_DESCRIPTION)
      e.description = `Describe the property in at least ${MIN_DESCRIPTION} characters so tenants know what to expect.`;
    if (!form.district) e.district = 'Select a district in Gilgit-Baltistan.';
    if (!form.city) e.city = 'Select a city or town.';
    if (!form.area) e.area = 'Select the area or locality.';
    if (!form.address.trim()) e.address = 'Enter the street address tenants should reach.';
    if (!form.price || Number(form.price) <= 0) e.price = 'Enter a monthly rent greater than zero.';
    if (form.bedrooms === '' || Number(form.bedrooms) < 0) e.bedrooms = 'Enter the number of bedrooms (use 0 for commercial space).';
    if (form.bathrooms === '' || Number(form.bathrooms) < 0) e.bathrooms = 'Enter the number of bathrooms.';
    if (!form.size || Number(form.size) <= 0) e.size = 'Enter the covered area in square feet.';
    if (!form.furnishing) e.furnishing = 'Select the furnishing status.';
    if (!form.availableFrom) e.availableFrom = 'Pick the date the property becomes available.';
    if (!isDraft && form.images.length === 0)
      e.images = 'Add at least one photo. Listings without photos are rarely trusted.';
    return e;
  }

  function addFiles(fileList) {
    const all = Array.from(fileList || []);
    const files = all.filter((f) => f.type.startsWith('image/'));
    const skipped = all
      .filter((f) => !f.type.startsWith('image/'))
      .map((f) => ({ name: f.name, reason: 'Not a supported image. Use JPG or PNG.' }));
    if (!files.length) {
      setRejected(skipped);
      toast.warning('Only image files can be uploaded.', 'Unsupported file');
      return;
    }
    const room = MAX_IMAGES - form.images.length;
    if (room <= 0) {
      setRejected(
        skipped.concat(
          files.map((f) => ({ name: f.name, reason: `Photo limit of ${MAX_IMAGES} reached. Remove a photo first.` }))
        )
      );
      toast.warning(`You can upload up to ${MAX_IMAGES} photos per listing.`, 'Photo limit reached');
      return;
    }
    const accepted = files.slice(0, room);
    const overflow = files.slice(room).map((f) => ({
      name: f.name,
      reason: `Photo limit of ${MAX_IMAGES} reached. This file was not added.`,
    }));
    const urls = accepted.map((f) => URL.createObjectURL(f));
    setFileMeta((prev) => {
      const next = { ...prev };
      accepted.forEach((f, i) => {
        next[urls[i]] = { name: f.name, size: f.size };
      });
      return next;
    });
    setRejected(skipped.concat(overflow));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    if (files.length > room) {
      toast.warning(`Only ${room} more photo${room === 1 ? '' : 's'} could be added.`, 'Photo limit reached');
    }
  }

  function removeImage(index) {
    const target = form.images[index];
    setFileMeta((prev) => {
      if (!target || !prev[target]) return prev;
      const next = { ...prev };
      delete next[target];
      return next;
    });
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
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

  function payload() {
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
    };
  }

  async function handleSave(isDraft) {
    const found = validate(isDraft);
    if (Object.keys(found).length) {
      setErrors(found);
      setFormError(
        isDraft
          ? 'Some required details are still missing before this draft can be saved.'
          : 'Fix the highlighted fields before sending the listing back for review.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(isDraft ? 'draft' : 'review');
    setFormError('');
    try {
      if (isDraft) {
        await propertyService.saveDraft(id, payload(), user.id);
        toast.success('Listing saved as draft.');
      } else {
        await propertyService.update(id, payload());
        toast.success('Listing updated. Sent for re-review.');
      }
      navigate('/owner/properties');
    } catch (err) {
      const message = err?.message || (isDraft ? 'Unable to save the draft.' : 'Unable to update the listing.');
      setFormError(message);
      toast.error(message);
      setSaving('');
    }
  }

  async function handleCancel() {
    const ok = await confirm({
      title: 'Discard your changes?',
      message: 'Anything you edited since opening this page will be lost.',
      confirmLabel: 'Discard changes',
      tone: 'danger',
    });
    if (ok) navigate(`/owner/properties/${id}`);
  }

  // Read-only completion snapshot for the rail — derived from the same validate()
  // rules that gate submit, so the rail can never disagree with validation.
  const draftErrors = validate(true);
  const submitErrors = validate(false);
  const ready = Object.keys(submitErrors).length === 0;
  const completeFor = (fields) => fields.every((field) => !draftErrors[field]);
  const sections = RAIL_SECTIONS.map((s) => {
    let complete = false;
    if (s.id === 'sec-basics') complete = completeFor(['title', 'type', 'description']);
    else if (s.id === 'sec-location') complete = completeFor(['district', 'city', 'area', 'address']);
    else if (s.id === 'sec-details')
      complete = completeFor(['price', 'bedrooms', 'bathrooms', 'size', 'furnishing', 'availableFrom']);
    else if (s.id === 'sec-amenities') complete = true;
    else if (s.id === 'sec-photos') complete = form.images.length > 0;
    else if (s.id === 'sec-availability') complete = completeFor(['price', 'availableFrom']);
    else if (s.id === 'sec-review') complete = ready;
    return { ...s, complete };
  });
  const completeCount = sections.filter((s) => s.complete).length;

  function scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (!el) return;
    setActiveSection(sectionId);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Edit listing"
        subtitle={property?.title}
        back={`/owner/properties/${id}`}
        backLabel="Back to listing"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {dirty && (
              <span
                role="status"
                className="inline-flex animate-fade-in items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"
              >
                <Icon name="alert" className="h-3.5 w-3.5" />
                You have unsaved changes
              </span>
            )}
            <ListingStatusBadge status={property?.status} />
          </div>
        }
      />

      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-xs leading-relaxed text-amber-800">
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Changes to a published listing are re-checked by an admin before going live again. Your listing stays
          visible to tenants until the update is approved.
        </p>
      </div>

      {formError && (
        <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-up">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
        {/* Sticky scroll-spy section rail */}
        <aside className="sticky top-[68px] z-10 lg:top-[92px]">
          <nav
            aria-label="Form sections"
            className="rounded-xl border border-line bg-white/95 p-2 shadow-soft backdrop-blur"
          >
            <p className="hidden px-2 pt-1 pb-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase lg:block">
              Sections · {completeCount}/{sections.length}
            </p>
            <ol className="flex gap-1.5 overflow-x-auto no-scrollbar lg:flex-col lg:gap-1 lg:overflow-visible">
              {sections.map((s, i) => {
                const active = activeSection === s.id;
                return (
                  <li key={s.id} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      data-rail={s.id}
                      onClick={() => scrollToSection(s.id)}
                      aria-current={active ? 'true' : undefined}
                      aria-label={`Go to ${s.label}: ${s.complete ? 'complete' : 'in progress'}`}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 lg:w-full lg:whitespace-normal',
                        active
                          ? 'bg-brand-50 text-brand-800'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                          s.complete
                            ? 'bg-brand-700 text-white'
                            : active
                              ? 'bg-white text-brand-700 ring-1 ring-brand-300'
                              : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        {s.complete ? (
                          <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                        ) : (
                          i + 1
                        )}
                      </span>
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </aside>

        <div className="overflow-hidden rounded-xl border border-line bg-white pb-24">
        {/* Basic information */}
        <Section id="sec-basics" title="Basic information" description="What tenants see first in search results.">
          <div className="grid gap-5">
            <Input
              label="Listing title"
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              error={errors.title}
              hint={`${form.title.trim().length}/${MIN_TITLE} min characters`}
              maxLength={80}
              placeholder="e.g. Sunlit 3-bedroom house with garden in Jutial"
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
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              error={errors.description}
              hint={`${form.description.trim().length}/${MIN_DESCRIPTION} min characters`}
              placeholder="Describe the layout, light, surroundings, nearby landmarks, parking and water supply."
            />
          </div>
        </Section>

        {/* Location */}
        <Section id="sec-location" title="Location" description="District, city and area power the filters tenants use.">
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
          <div className="mt-5">
            <Input
              label="Street address"
              required
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              error={errors.address}
              placeholder="House 14, Street 3, near the bazaar"
            />
          </div>
        </Section>

        {/* Details */}
        <Section id="sec-details" title="Rent and details" description="Keep the rent and availability accurate: tenants filter on them.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Monthly rent (PKR)"
              required
              type="number"
              min="1"
              inputMode="numeric"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              error={errors.price}
            />
            <Input
              label="Covered area (sq ft)"
              required
              type="number"
              min="1"
              inputMode="numeric"
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
        </Section>

        {/* Amenities */}
        <Section id="sec-amenities" title="Amenities" description="Selected amenities appear as filters on your listing.">
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
                    className={cn('h-4 w-4', active ? 'text-brand-700' : 'text-slate-500')}
                    strokeWidth={2.2}
                  />
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-slate-500">{form.amenities.length} amenities selected</p>
        </Section>

        {/* Images */}
        <Section id="sec-photos" title="Photos" description="The first photo is the cover image tenants see in search.">
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
              'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors duration-200',
              dragging ? 'border-brand-500 bg-brand-50' : 'border-line bg-slate-50'
            )}
          >
            <Icon name="image" className="h-6 w-6 text-slate-500" />
            <p className="mt-2 text-sm font-semibold text-slate-700">Drop new photos here</p>
            <p className="mt-1 text-xs text-slate-500">JPG or PNG · up to {MAX_IMAGES} images</p>
            <input
              ref={fileInput}
              id="edit-images"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <Button variant="outline" size="sm" className="mt-3" onClick={() => fileInput.current?.click()}>
              Choose photos
            </Button>
            {errors.images && (
              <p role="alert" className="mt-3 text-xs font-medium text-red-600">
                {errors.images}
              </p>
            )}
          </div>

          {rejected.length > 0 && (
            <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 animate-fade-up">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-red-700">
                    <Icon name="alert" className="h-4 w-4 shrink-0" />
                    {rejected.length} photo{rejected.length === 1 ? '' : 's'} could not be added
                  </p>
                  <ul className="mt-2 space-y-1">
                    {rejected.map((r, i) => (
                      <li key={`${r.name}-${i}`} className="text-xs leading-relaxed text-red-700">
                        <span className="font-semibold">{r.name}</span>: {r.reason}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => setRejected([])}
                  aria-label="Dismiss photo errors"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-100 hover:text-red-700"
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {form.images.map((url, index) => (
              <li
                key={url + index}
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

                <p className="flex items-center gap-1.5 px-2.5 pt-2 text-[10px] font-medium text-slate-500">
                  {saving === 'review' ? (
                    <>
                      <span
                        className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"
                        aria-hidden="true"
                      />
                      <span className="truncate">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <Icon name="check" className="h-3 w-3 shrink-0 text-emerald-600" strokeWidth={2.5} />
                      <span className="truncate">
                        {fileMeta[url] ? `${fileMeta[url].name} · ${formatFileSize(fileMeta[url].size)}` : 'Photo ready'}
                      </span>
                    </>
                  )}
                </p>
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
                      onClick={() => {
                        setForm((prev) => {
                          const images = [...prev.images];
                          const [picked] = images.splice(index, 1);
                          return { ...prev, images: [picked, ...images] };
                        });
                      }}
                      className="rounded-md px-1.5 py-1 text-[11px] font-semibold text-brand-700 transition hover:bg-brand-50"
                    >
                      Set as main
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {form.images.length === 0 && (
            <p className="mt-4 text-center text-sm text-slate-500">No photos yet. Add at least one before submitting.</p>
          )}

          <p className="mt-3 text-center text-xs text-slate-500" aria-live="polite">
            {form.images.length} of {MAX_IMAGES} photos used
          </p>
        </Section>

        {/* Availability summary */}
        <Section id="sec-availability" title="Availability" description="Tenants can see when the property becomes usable.">
          <div className="rounded-xl border border-line bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <p>
              Available from{' '}
              <strong className="text-slate-900">
                {form.availableFrom ? new Date(form.availableFrom).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'not set'}
              </strong>{' '}
              · renting at{' '}
              <strong className="text-slate-900">Rs {formatNumber(form.price || 0)} per month</strong>
            </p>
          </div>
        </Section>

        {/* Read-only review before submitting */}
        <Section
          id="sec-review"
          title="Review and submit"
          description="A read-only summary of exactly what will be sent to the review team."
        >
          <dl className="divide-y divide-line rounded-xl border border-line">
            {[
              ['Title', form.title],
              ['Type', PROPERTY_TYPES.find((t) => t.value === form.type)?.label || '–'],
              ['Monthly rent', `Rs ${formatNumber(form.price || 0)}`],
              ['Location', `${form.area}, ${form.city}, ${form.district}`],
              ['Address', form.address],
              ['Bedrooms / Bathrooms', `${form.bedrooms} / ${form.bathrooms}`],
              ['Covered area', `${formatNumber(form.size || 0)} sq ft`],
              ['Furnishing', form.furnishing],
              ['Available from', form.availableFrom ? formatDate(form.availableFrom) : '–'],
              [
                'Amenities',
                form.amenities.length ? form.amenities.map((a) => AMENITY_MAP[a]).join(', ') : 'None selected',
              ],
              ['Photos', `${form.images.length} of ${MAX_IMAGES}`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 px-4 py-3">
                <dt className="shrink-0 text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</dt>
                <dd className="text-right text-sm text-slate-700">{value || '–'}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 rounded-xl border border-line px-4 py-3.5">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Description</p>
            <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-slate-600">{form.description || '–'}</p>
          </div>

          {ready ? (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-xs leading-relaxed text-emerald-800">
              <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
              <p>
                <strong className="font-semibold">Ready to submit.</strong> This summary is read-only. Scroll up to
                change any detail, then use Submit changes below.
              </p>
            </div>
          ) : (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-xs leading-relaxed text-amber-800"
            >
              <p className="font-semibold">
                Still needed before submitting ({Object.keys(submitErrors).length} item
                {Object.keys(submitErrors).length === 1 ? '' : 's'}):
              </p>
              <ul className="mt-2 space-y-1">
                {Object.entries(submitErrors).map(([field, message]) => (
                  <li key={field}>• {message}</li>
                ))}
              </ul>
              <Button
                size="xs"
                variant="outline"
                className="mt-3"
                onClick={() =>
                  scrollToSection(FIELD_SECTION[Object.keys(submitErrors)[0]] || 'sec-basics')
                }
              >
                Fix the first issue
              </Button>
            </div>
          )}
        </Section>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-5 flex flex-col-reverse gap-3 border-t border-line bg-white/95 px-4 pt-3.5 pb-[calc(0.875rem_+_env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={handleCancel} disabled={Boolean(saving)}>
            Cancel
          </Button>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button variant="outline" loading={saving === 'draft'} disabled={Boolean(saving)} onClick={() => handleSave(true)}>
              Save Draft
            </Button>
            <Button loading={saving === 'review'} disabled={Boolean(saving)} onClick={() => handleSave(false)}>
              Submit changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
