import { useRef, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Icon from '../common/icons';
import Input from '../common/Input';
import { generateCnicSvg } from '../../data/cnicTemplates';
import { cn } from '../../utils/format';

export function formatCnicNumber(value = '') {
  const digits = String(value).replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export default function CnicVerificationModal({
  open,
  onClose,
  user,
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState({
    cnic: user?.cnic || '',
    cnicName: user?.cnicName || user?.name || '',
    cnicDob: user?.cnicDob || '1990-01-01',
    cnicExpiry: user?.cnicExpiry === 'Lifetime' ? '' : (user?.cnicExpiry || '2030-01-01'),
    cnicLifetime: user?.cnicLifetime || user?.cnicExpiry === 'Lifetime' || false,
    cnicFront: user?.cnicFront || null,
    cnicBack: user?.cnicBack || null,
  });

  const [errors, setErrors] = useState({});
  const [dragFront, setDragFront] = useState(false);
  const [dragBack, setDragBack] = useState(false);

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function handleCnicChange(e) {
    const formatted = formatCnicNumber(e.target.value);
    updateField('cnic', formatted);
  }

  function handleFileRead(file, side) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, [side]: 'Only JPG, PNG or WebP image files are accepted.' }));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [side]: 'File size must be under 8MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      updateField(side, event.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleUseSampleCnic() {
    const sampleCnic = '71501-' + Math.floor(1000000 + Math.random() * 9000000) + '-1';
    const sampleFront = generateCnicSvg({
      name: user?.name || 'PAKISTAN CITIZEN',
      cnic: sampleCnic,
      dob: '15.08.1992',
      expiry: '15.08.2032',
      isBack: false,
    });
    const sampleBack = generateCnicSvg({
      cnic: sampleCnic,
      dob: '15.08.1992',
      expiry: '15.08.2032',
      isBack: true,
    });

    setForm({
      cnic: sampleCnic,
      cnicName: user?.name || 'PAKISTAN CITIZEN',
      cnicDob: '1992-08-15',
      cnicExpiry: '2032-08-15',
      cnicLifetime: false,
      cnicFront: sampleFront,
      cnicBack: sampleBack,
    });
    setErrors({});
  }

  function handleSubmit(e) {
    e?.preventDefault();
    const newErrors = {};

    const cleanCnic = form.cnic.replace(/\D/g, '');
    if (!cleanCnic) {
      newErrors.cnic = 'CNIC number is required.';
    } else if (cleanCnic.length !== 13) {
      newErrors.cnic = 'CNIC must be exactly 13 digits (format: XXXXX-XXXXXXX-X).';
    }

    if (!form.cnicName.trim()) {
      newErrors.cnicName = 'Name as per CNIC is required.';
    }

    if (!form.cnicDob) {
      newErrors.cnicDob = 'Date of birth is required for NADRA record matching.';
    }

    if (!form.cnicLifetime && !form.cnicExpiry) {
      newErrors.cnicExpiry = 'CNIC expiry date is required (or check Lifetime validity).';
    }

    if (!form.cnicFront) {
      newErrors.cnicFront = 'Please upload a photo of the FRONT side of your CNIC.';
    }

    if (!form.cnicBack) {
      newErrors.cnicBack = 'Please upload a photo of the BACK side of your CNIC.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      cnic: form.cnic,
      cnicName: form.cnicName.trim(),
      cnicDob: form.cnicDob,
      cnicExpiry: form.cnicLifetime ? 'Lifetime' : form.cnicExpiry,
      cnicLifetime: form.cnicLifetime,
      cnicFront: form.cnicFront,
      cnicBack: form.cnicBack,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="CNIC Identity Verification"
      description="Submit your Pakistani National Identity Card (CNIC) for automated NADRA database cross-referencing and landlord verification."
      size="xl"
      showClose={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NADRA Compliance Banner */}
        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white p-4.5 sm:p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Icon name="shield" className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-emerald-950">NADRA National Database Verification Pipeline</h4>
                  <span className="rounded-full bg-emerald-100/90 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-emerald-800 ring-1 ring-emerald-300">
                    Government Standard
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleUseSampleCnic}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline transition-colors"
                >
                  Fill with demo CNIC
                </button>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                To protect tenants from rental scams, landlord listings require verified identity deeds. Your 13-digit
                CNIC and high-resolution card scans are formatted to sync with Pakistan&apos;s National Database &amp;
                Registration Authority (NADRA) identity registry.
              </p>
            </div>
          </div>
        </div>

        {/* Text Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input
              label="CNIC Number (شناختی کارڈ نمبر)"
              required
              value={form.cnic}
              onChange={handleCnicChange}
              placeholder="71501-1234567-1"
              maxLength={15}
              error={errors.cnic}
              hint="13 numeric digits formatted with hyphens"
            />
          </div>

          <div>
            <Input
              label="Full Name (as printed on CNIC)"
              required
              value={form.cnicName}
              onChange={(e) => updateField('cnicName', e.target.value)}
              placeholder="e.g. KARIM ALI"
              error={errors.cnicName}
              hint="Must match the name on your identity card exactly"
            />
          </div>

          <div>
            <Input
              label="Date of Birth (تاریخ پیدائش)"
              type="date"
              required
              value={form.cnicDob}
              onChange={(e) => updateField('cnicDob', e.target.value)}
              error={errors.cnicDob}
              hint="Required for registry cross-matching"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">CNIC Expiry Date (تاریخ تنسیخ)</label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={form.cnicLifetime}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    updateField('cnicLifetime', checked);
                    if (checked) updateField('cnicExpiry', '');
                  }}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Lifetime / No Expiry
              </label>
            </div>
            <div className="mt-1.5">
              <Input
                type="date"
                value={form.cnicLifetime ? '' : form.cnicExpiry}
                onChange={(e) => updateField('cnicExpiry', e.target.value)}
                disabled={form.cnicLifetime}
                placeholder={form.cnicLifetime ? 'Lifetime Validity' : ''}
                error={errors.cnicExpiry}
                hint={form.cnicLifetime ? 'Marked as Lifetime validity' : 'Found on bottom right of CNIC card'}
              />
            </div>
          </div>
        </div>

        {/* CNIC Document Upload Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold tracking-wide uppercase text-slate-700">
              CNIC Document Scans / Photos (اصل شناختی کارڈ کی تصاویر)
            </label>
            <span className="text-xs text-slate-500">JPG, PNG, WebP · Max 8MB each</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* CNIC FRONT UPLOAD */}
            <div className="flex flex-col">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                    1
                  </span>
                  CNIC Front Side (سامنے والا حصہ)
                </span>
                {form.cnicFront && (
                  <button
                    type="button"
                    onClick={() => updateField('cnicFront', null)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              {form.cnicFront ? (
                <div className="group relative aspect-[1.58/1] w-full overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-slate-900 shadow-sm transition-all hover:border-emerald-600">
                  <img
                    src={form.cnicFront}
                    alt="CNIC Front Preview"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-3">
                    <span className="rounded-md bg-emerald-600/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-xs backdrop-blur-sm">
                      Front Side Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => frontInputRef.current?.click()}
                      className="rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-sm hover:bg-white transition-colors"
                    >
                      Change photo
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragFront(true);
                  }}
                  onDragLeave={() => setDragFront(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragFront(false);
                    if (e.dataTransfer.files?.[0]) handleFileRead(e.dataTransfer.files[0], 'cnicFront');
                  }}
                  onClick={() => frontInputRef.current?.click()}
                  className={cn(
                    'group aspect-[1.58/1] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all duration-200',
                    dragFront
                      ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                      : 'border-slate-300 bg-slate-50/60 hover:border-emerald-500 hover:bg-emerald-50/20'
                  )}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm border border-slate-200 group-hover:text-emerald-700 group-hover:border-emerald-300 transition-colors">
                    <Icon name="upload" className="h-5 w-5" />
                  </span>
                  <p className="mt-2.5 text-xs font-semibold text-slate-800">Upload CNIC Front Photo</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Photo &amp; 13-digit number must be clearly visible</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-slate-200 shadow-2xs">
                    Browse image
                  </span>
                </div>
              )}

              <input
                ref={frontInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileRead(e.target.files[0], 'cnicFront');
                  e.target.value = '';
                }}
              />
              {errors.cnicFront && (
                <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                  <Icon name="alert" className="h-3.5 w-3.5 shrink-0" />
                  {errors.cnicFront}
                </p>
              )}
            </div>

            {/* CNIC BACK UPLOAD */}
            <div className="flex flex-col">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                    2
                  </span>
                  CNIC Back Side (پیچھے والا حصہ)
                </span>
                {form.cnicBack && (
                  <button
                    type="button"
                    onClick={() => updateField('cnicBack', null)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              {form.cnicBack ? (
                <div className="group relative aspect-[1.58/1] w-full overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-slate-900 shadow-sm transition-all hover:border-emerald-600">
                  <img
                    src={form.cnicBack}
                    alt="CNIC Back Preview"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-3">
                    <span className="rounded-md bg-emerald-600/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-xs backdrop-blur-sm">
                      Back Side Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => backInputRef.current?.click()}
                      className="rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-sm hover:bg-white transition-colors"
                    >
                      Change photo
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragBack(true);
                  }}
                  onDragLeave={() => setDragBack(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragBack(false);
                    if (e.dataTransfer.files?.[0]) handleFileRead(e.dataTransfer.files[0], 'cnicBack');
                  }}
                  onClick={() => backInputRef.current?.click()}
                  className={cn(
                    'group aspect-[1.58/1] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all duration-200',
                    dragBack
                      ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                      : 'border-slate-300 bg-slate-50/60 hover:border-emerald-500 hover:bg-emerald-50/20'
                  )}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm border border-slate-200 group-hover:text-emerald-700 group-hover:border-emerald-300 transition-colors">
                    <Icon name="upload" className="h-5 w-5" />
                  </span>
                  <p className="mt-2.5 text-xs font-semibold text-slate-800">Upload CNIC Back Photo</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Address &amp; Family number must be legible</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-slate-200 shadow-2xs">
                    Browse image
                  </span>
                </div>
              )}

              <input
                ref={backInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileRead(e.target.files[0], 'cnicBack');
                  e.target.value = '';
                }}
              />
              {errors.cnicBack && (
                <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                  <Icon name="alert" className="h-3.5 w-3.5 shrink-0" />
                  {errors.cnicBack}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Verification Requirements Checklist */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">Submission Requirements:</p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2 list-disc list-inside">
            <li>Ensure all 4 corners of the CNIC are visible</li>
            <li>No flash glare obscuring the 13-digit identity number</li>
            <li>Photos must be original, high-resolution color scans</li>
            <li>Full name must correspond with rental property deeds</li>
          </ul>
        </div>

        {/* Footer buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} className="sm:min-w-[190px]">
            <Icon name="shield" className="h-4 w-4" />
            Submit for Verification
          </Button>
        </div>
      </form>
    </Modal>
  );
}
