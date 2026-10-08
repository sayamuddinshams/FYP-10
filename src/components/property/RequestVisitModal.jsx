import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Textarea, Select } from '../common/Input';
import ImageWithFallback from '../common/ImageWithFallback';
import Icon from '../common/icons';
import visitService from '../../services/visitService';
import { useAuth } from '../../context/AuthContext';
import { useModals } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { TIME_SLOTS } from '../../utils/constants';
import { validateDate, validateRequired, validateFutureDate } from '../../utils/validation';
import { formatPrice } from '../../utils/format';

export default function RequestVisitModal({ open, onClose, property, onSuccess }) {
  const { user, isAuthenticated } = useAuth();
  const { openAuth } = useModals();
  const toast = useToast();

  const [form, setForm] = useState({ date: '', time: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ date: '', time: '', message: '' });
      setErrors({});
      setError('');
      setDone(false);
      setLoading(false);
    }
  }, [open]);

  const today = new Date().toISOString().slice(0, 10);

  async function submit(e) {
    e.preventDefault();
    setError('');
    const next = {};
    next.date = validateFutureDate(form.date, 'Choose an upcoming date for the visit.');
    next.time = validateRequired(form.time, 'Select a preferred time.');
    const cleaned = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    if (Object.keys(cleaned).length) {
      setErrors(cleaned);
      return;
    }

    if (!isAuthenticated) {
      openAuth('login', { type: 'visit', propertyId: property.id });
      return;
    }

    setLoading(true);
    try {
      await visitService.create({
        propertyId: property.id,
        tenantId: user.id,
        date: form.date,
        time: form.time,
        message: form.message.trim(),
      });
      setDone(true);
      toast.success('Your visit request has been sent.', 'Request submitted');
      onSuccess?.();
    } catch (err) {
      setError(err?.message || 'Unable to send the visit request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={done ? 'Visit requested' : 'Request a visit'}
      description={done ? undefined : 'Choose a convenient time — the owner will confirm or suggest another slot.'}
      size="md"
    >
      {property && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-line bg-slate-50 p-3">
          <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-white">
            <ImageWithFallback src={property.images?.[0]} alt={property.title} />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-semibold text-slate-900">{property.title}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <Icon name="pin" className="h-3.5 w-3.5" />
              {property.area}, {property.city}, {property.district}
            </p>
            <p className="mt-0.5 text-sm font-bold text-brand-800">
              {formatPrice(property.price)}
              <span className="text-xs font-medium text-slate-400">/month</span>
            </p>
          </div>
        </div>
      )}

      {done ? (
        <div className="py-4 text-center animate-fade-up">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Icon name="check" className="h-7 w-7" strokeWidth={2.5} />
          </div>
          <p className="text-base font-semibold text-slate-900">Your visit request has been sent.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            You will receive a notification as soon as the owner confirms. Track updates in your visit requests.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button onClick={onClose}>Done</Button>
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                window.location.assign('/tenant/visits');
              }}
            >
              View my visits
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          {error && (
            <div role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Preferred date<span className="ml-0.5 text-red-500">*</span>
              </span>
              <input
                type="date"
                min={today}
                value={form.date}
                onChange={(e) => {
                  setForm((p) => ({ ...p, date: e.target.value }));
                  setErrors((p) => ({ ...p, date: '' }));
                }}
                aria-invalid={errors.date ? 'true' : undefined}
                className={`h-11 w-full rounded-lg border px-3.5 text-sm focus:ring-2 focus:outline-none ${
                  errors.date ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-line focus:border-brand-400 focus:ring-brand-100'
                }`}
              />
              {errors.date && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.date}</p>}
            </label>

            <Select
              label="Preferred time"
              required
              placeholder="Select a time"
              value={form.time}
              error={errors.time}
              onChange={(e) => {
                setForm((p) => ({ ...p, time: e.target.value }));
                setErrors((p) => ({ ...p, time: '' }));
              }}
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Message to the owner"
            hint="Optional"
            rows={4}
            placeholder="Introduce yourself and mention anything the owner should know before the visit."
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          />

          <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Request Visit
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
