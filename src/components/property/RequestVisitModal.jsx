import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Input, Textarea, Select } from '../common/Input';
import ImageWithFallback from '../common/ImageWithFallback';
import Icon from '../common/icons';
import visitService from '../../services/visitService';
import { useAuth } from '../../context/AuthContext';
import { useModals } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { TIME_SLOTS } from '../../utils/constants';
import { validateRequired, validateFutureDate } from '../../utils/validation';
import { cn, formatDate, formatPrice } from '../../utils/format';

const STEPS = [
  { key: 'date', label: 'Date', icon: 'calendar' },
  { key: 'time', label: 'Time', icon: 'clock' },
  { key: 'message', label: 'Message', icon: 'chat' },
  { key: 'review', label: 'Review', icon: 'eye' },
  { key: 'send', label: 'Send', icon: 'send' },
];

export default function RequestVisitModal({ open, onClose, property, onSuccess }) {
  const { user, isAuthenticated } = useAuth();
  const { openAuth } = useModals();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ date: '', time: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) {
      setForm({ date: '', time: '', message: '' });
      setErrors({});
      setError('');
      setDone(false);
      setLoading(false);
      setStep(0);
    }
  }, [open]);

  const today = new Date().toISOString().slice(0, 10);
  const isLast = step === STEPS.length - 1;

  /** Per-step validation — the same rules the single-step form used. */
  function validateStep(index) {
    const next = {};
    if (index === 0) next.date = validateFutureDate(form.date, 'Choose an upcoming date for the visit.');
    if (index === 1) next.time = validateRequired(form.time, 'Select a preferred time.');
    const cleaned = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    setErrors((prev) => ({ ...prev, ...cleaned, ...(index === 0 && !cleaned.date ? { date: '' } : {}), ...(index === 1 && !cleaned.time ? { time: '' } : {}) }));
    return !Object.keys(cleaned).length;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError('');
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function send() {
    setError('');
    const next = {};
    next.date = validateFutureDate(form.date, 'Choose an upcoming date for the visit.');
    next.time = validateRequired(form.time, 'Select a preferred time.');
    const cleaned = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    if (Object.keys(cleaned).length) {
      setErrors(cleaned);
      setStep(cleaned.date ? 0 : 1);
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

  function onSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (isLast) send();
    else goNext();
  }

  const progressStep = done ? STEPS.length : step;
  const stepIndex = Math.min(step, STEPS.length - 1);

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
              <span className="text-xs font-medium text-slate-500">/month</span>
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
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
            You will receive a notification as soon as the owner confirms. Track updates in your visit requests.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button onClick={onClose}>Done</Button>
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                navigate('/tenant/visits');
              }}
            >
              View my visits
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {/* Step progress */}
          <div className="relative pb-1">
            <div className="absolute top-4 right-4 left-4 h-0.5 bg-slate-200" aria-hidden="true" />
            <div
              className="absolute top-4 left-4 h-0.5 bg-brand-600 transition-[width] duration-300"
              style={{ width: `calc((100% - 2rem) * ${stepIndex / (STEPS.length - 1)})` }}
              aria-hidden="true"
            />
            <ol className="relative flex justify-between" aria-label="Visit request steps">
              {STEPS.map((s, i) => {
                const state = i < progressStep ? 'done' : i === progressStep ? 'current' : 'todo';
                return (
                  <li
                    key={s.key}
                    aria-current={state === 'current' ? 'step' : undefined}
                    className="flex w-1/5 flex-col items-center gap-1.5"
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                        state === 'done' && 'bg-brand-700 text-white',
                        state === 'current' && 'border-2 border-brand-700 bg-white text-brand-800 ring-4 ring-brand-100',
                        state === 'todo' && 'border border-line bg-white text-slate-500'
                      )}
                    >
                      {state === 'done' ? <Icon name="check" className="h-4 w-4" strokeWidth={2.6} /> : i + 1}
                      <span className="sr-only">{state === 'done' ? 'Completed: ' : ''}</span>
                    </span>
                    <span
                      className={cn(
                        'text-center text-xs leading-tight',
                        state === 'current' ? 'font-semibold text-brand-800' : 'text-slate-500'
                      )}
                    >
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="sr-only" aria-live="polite">
              Step {stepIndex + 1} of {STEPS.length}: {STEPS[stepIndex].label}
            </p>
          </div>

          {error && (
            <div role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-3 animate-fade-in">
              <Input
                label="Preferred date"
                required
                type="date"
                min={today}
                value={form.date}
                error={errors.date}
                hint="Upcoming dates only"
                onChange={(e) => {
                  setForm((p) => ({ ...p, date: e.target.value }));
                  setErrors((p) => ({ ...p, date: '' }));
                }}
              />
              {property?.availableFrom && (
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon name="calendar" className="h-3.5 w-3.5 text-slate-500" />
                  Available from {formatDate(property.availableFrom)}
                </p>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in">
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
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <Textarea
                label="Message to the owner"
                hint="Optional"
                rows={4}
                placeholder="Introduce yourself and mention anything the owner should know before the visit."
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-sm text-slate-600">Check your request before continuing.</p>
              <dl className="divide-y divide-line rounded-xl border border-line bg-slate-50 px-4">
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="text-sm text-slate-500">Date</dt>
                  <dd className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-800">{formatDate(form.date)}</span>
                    <Button variant="ghost" size="sm" className="min-h-10" onClick={() => setStep(0)}>
                      Change<span className="sr-only"> date</span>
                    </Button>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="text-sm text-slate-500">Time</dt>
                  <dd className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-800">{form.time || '—'}</span>
                    <Button variant="ghost" size="sm" className="min-h-10" onClick={() => setStep(1)}>
                      Change<span className="sr-only"> time</span>
                    </Button>
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3 py-3">
                  <dt className="shrink-0 text-sm text-slate-500">Message</dt>
                  <dd className="flex items-start gap-3">
                    <span className="max-w-[16rem] text-right text-sm text-slate-700">
                      {form.message.trim() || <span className="text-slate-500">No message</span>}
                    </span>
                    <Button variant="ghost" size="sm" className="min-h-10 shrink-0" onClick={() => setStep(2)}>
                      Change<span className="sr-only"> message</span>
                    </Button>
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4">
                <Icon name="send" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-700" />
                <p className="text-sm leading-relaxed text-brand-900">
                  Send a visit request for this property on{' '}
                  <strong className="font-semibold">{formatDate(form.date)}</strong> at{' '}
                  <strong className="font-semibold">{form.time}</strong>. The owner can confirm, decline or suggest
                  another slot.
                </p>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                You can track the response under your visit requests. Never send money before viewing a property.
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            {step > 0 && (
              <Button type="button" variant="outline" onClick={goBack} disabled={loading}>
                <Icon name="chevronLeft" className="h-4 w-4" />
                Back
              </Button>
            )}
            <Button type="submit" loading={loading}>
              {isLast ? 'Send request' : 'Continue'}
              {!isLast && <Icon name="arrowRight" className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
