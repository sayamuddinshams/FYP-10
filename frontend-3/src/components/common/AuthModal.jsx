import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Icon from './icons';
import { Input, Checkbox } from './Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail, validatePassword, validateRequired, validateMatch } from '../../utils/validation';
import authService from '../../services/authService';
import { DEMO_ACCOUNTS } from '../../data/users';
import { cn } from '../../utils/format';

const TITLES = {
  login: { title: 'Welcome back', subtitle: 'Sign in to continue your search.' },
  signup: { title: 'Create your account', subtitle: 'Join RentLink as a tenant or property owner.' },
  forgot: { title: 'Reset your password', subtitle: 'We will email you a secure reset link.' },
};

const INITIAL_FORM = { name: '', email: '', password: '', confirmPassword: '', role: 'tenant', remember: true };

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function PasswordToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={show}
      aria-label={show ? 'Hide password' : 'Show password'}
      title={show ? 'Hide password' : 'Show password'}
      className="absolute top-1/2 right-1.5 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <Icon name={show ? 'x' : 'eye'} className="h-4.5 w-4.5" />
    </button>
  );
}

export default function AuthModal({ open, mode, intent, onClose, onSwitchMode }) {
  const { login, signup, loginWithGoogle } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');

  const formRef = useRef(null);

  // Reset values, errors and server messages whenever the modal closes or the mode changes.
  useEffect(() => {
    setForm(INITIAL_FORM);
    setErrors({});
    setBanner('');
    setSuccess('');
    setShowPassword(false);
  }, [open, mode]);

  // Move focus to the first field on open and whenever the mode changes
  // (the shared Modal focuses its close button first — this refines that).
  // The delay also lets the mode-switch transition mount the new content.
  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => {
      const first = formRef.current?.querySelector('input');
      first?.focus();
    }, 180);
    return () => clearTimeout(timer);
  }, [open, mode]);

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    setBanner('');
  };

  /** Validates a single field on blur using the same rules as submit. */
  function validateField(key) {
    let err = '';
    if (key === 'name') {
      err = mode === 'signup' ? validateRequired(form.name, 'Full name is required.') : '';
    } else if (key === 'email') {
      err = validateEmail(form.email);
    } else if (key === 'password') {
      err = mode === 'signup' ? validatePassword(form.password) : validateRequired(form.password, 'Password is required.');
    } else if (key === 'confirmPassword') {
      err = !form.confirmPassword ? 'Confirm your password.' : validateMatch(form.password, form.confirmPassword);
    }
    setErrors((prev) => {
      if (!prev[key] && !err) return prev;
      if (prev[key] === err) return prev;
      return { ...prev, [key]: err };
    });
  }

  async function submit(e) {
    e.preventDefault();
    setBanner('');
    setSuccess('');
    const next = {};

    if (mode === 'login') {
      next.email = validateEmail(form.email);
      next.password = validateRequired(form.password, 'Password is required.');
    } else if (mode === 'signup') {
      next.name = validateRequired(form.name, 'Full name is required.');
      next.email = validateEmail(form.email);
      next.password = validatePassword(form.password);
      next.confirmPassword = !form.confirmPassword ? 'Confirm your password.' : validateMatch(form.password, form.confirmPassword);
    } else {
      next.email = validateEmail(form.email);
    }

    const cleaned = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    if (Object.keys(cleaned).length) {
      setErrors(cleaned);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        const user = await login({ email: form.email, password: form.password, remember: form.remember });
        toast.success(`Welcome back, ${user.name.split(' ')[0]}.`, 'Signed in');
        onClose();
      } else if (mode === 'signup') {
        const user = await signup(form);
        toast.success(`Your ${user.role === 'owner' ? 'owner' : 'tenant'} account is ready.`, 'Account created');
        onClose();
      } else {
        const res = await forgotPasswordFlow(form.email);
        setSuccess(res);
      }
    } catch (err) {
      const message = err?.message || 'Network error. Please try again.';
      setBanner(message);
      if (/email already exists/i.test(message)) setErrors({ email: message });
      if (/invalid credentials/i.test(message)) setErrors({ password: '' });
    } finally {
      setSubmitting(false);
    }
  }

  async function forgotPasswordFlow(email) {
    const res = await authService.forgotPassword({ email });
    return res.message;
  }

  async function google() {
    setBanner('');
    setGooglePending(true);
    try {
      const user = await loginWithGoogle();
      toast.success(`Signed in with Google as ${user.name}.`, 'Signed in');
      onClose();
    } catch (err) {
      setBanner(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGooglePending(false);
    }
  }

  function fillDemo(email) {
    setForm((prev) => ({ ...prev, email, password: 'rentlink123' }));
    setErrors({});
    setBanner('');
  }

  const copy = TITLES[mode] || TITLES.login;
  const busy = submitting || googlePending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size={mode === 'signup' ? 'lg' : 'md'}
      title={copy.title}
      description={copy.subtitle}
    >
      <div ref={formRef}>
        {mode === 'forgot' && success ? (
          <div
            key="success"
            role="status"
            className="animate-fade-in rounded-xl border border-emerald-100 bg-emerald-50 p-5"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-soft">
                <Icon name="check" className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Reset link sent</p>
                <p className="mt-1 text-sm leading-relaxed text-emerald-700">{success}</p>
              </div>
            </div>
            <Button variant="outline" fullWidth className="mt-5" onClick={() => onSwitchMode('login')}>
              Back to login
            </Button>
          </div>
        ) : (
          <form
            key={mode}
            onSubmit={submit}
            noValidate
            className="animate-fade-in space-y-4"
          >
            {banner && (
              <div role="alert" className="animate-fade-in flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                {banner}
              </div>
            )}

            {mode === 'signup' && (
              <Input
                label="Full name"
                required
                autoComplete="name"
                placeholder="e.g. Ayesha Khan"
                value={form.name}
                onChange={set('name')}
                onBlur={() => validateField('name')}
                error={errors.name}
                disabled={busy}
              />
            )}

            <Input
              label="Email address"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              onBlur={() => validateField('email')}
              error={errors.email}
              disabled={busy}
            />

            {mode !== 'forgot' && (
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                onBlur={() => validateField('password')}
                error={errors.password}
                hint={mode === 'signup' ? 'Minimum 6 characters' : undefined}
                inputClassName="pr-11"
                rightIcon={<PasswordToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                disabled={busy}
              />
            )}

            {mode === 'signup' && (
              <>
                <Input
                  label="Confirm password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  onBlur={() => validateField('confirmPassword')}
                  error={errors.confirmPassword}
                  inputClassName="pr-11"
                  rightIcon={<PasswordToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                  disabled={busy}
                />
                <fieldset className="rounded-2xl border border-slate-900/10 bg-slate-50/50 p-4 shadow-sm">
                  <legend className="px-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">Account type</legend>
                  <div className="space-y-2.5">
                    <label
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3.5 transition-all duration-200 shadow-sm',
                        form.role === 'tenant' ? 'border-[#D97706] ring-2 ring-[#FE932C]/20 bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        checked={form.role === 'tenant'}
                        disabled={busy}
                        onChange={() => setForm((p) => ({ ...p, role: 'tenant' }))}
                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer border-slate-300 text-[#D97706] accent-[#D97706] focus:ring-[#D97706]/20"
                      />
                      <span className="select-none">
                        <span className="block text-sm font-bold text-slate-900">Tenant</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                          Find and save properties, request visits, message verified owners.
                        </span>
                      </span>
                    </label>
                    <label
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3.5 transition-all duration-200 shadow-sm',
                        form.role === 'owner' ? 'border-[#D97706] ring-2 ring-[#FE932C]/20 bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        checked={form.role === 'owner'}
                        disabled={busy}
                        onChange={() => setForm((p) => ({ ...p, role: 'owner' }))}
                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer border-slate-300 text-[#D97706] accent-[#D97706] focus:ring-[#D97706]/20"
                      />
                      <span className="select-none">
                        <span className="block text-sm font-bold text-slate-900">Owner / Agent</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                          Publish listings, manage visit requests and track earnings.
                        </span>
                      </span>
                    </label>
                  </div>
                </fieldset>
              </>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between gap-3 text-sm">
                <Checkbox
                  checked={form.remember}
                  onChange={(e) => setForm((p) => ({ ...p, remember: e.target.checked }))}
                  label="Remember me"
                  disabled={busy}
                />
                <button
                  type="button"
                  onClick={() => onSwitchMode('forgot')}
                  disabled={busy}
                  className="inline-flex min-h-10 items-center text-xs font-bold uppercase tracking-wider text-[#D97706] transition hover:text-[#904D00]"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" loading={submitting} disabled={googlePending} fullWidth size="lg">
              {mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Send reset link'}
            </Button>

            {mode !== 'forgot' && (
              <>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  or continue with
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <Button type="button" variant="outline" fullWidth onClick={google} loading={googlePending} disabled={submitting}>
                  <GoogleIcon />
                  Continue with Google
                </Button>
              </>
            )}

            <p className="text-center text-sm text-slate-600">
              {mode === 'login' ? (
                <>
                  New to RentLink?{' '}
                  <button type="button" onClick={() => onSwitchMode('signup')} className="font-bold text-[#D97706] hover:text-[#904D00]">
                    Create an account
                  </button>
                </>
              ) : mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => onSwitchMode('login')} className="font-bold text-[#D97706] hover:text-[#904D00]">
                    Login
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => onSwitchMode('login')} className="font-bold text-[#D97706] hover:text-[#904D00]">
                  Back to login
                </button>
              )}
            </p>

            {mode === 'login' && (
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-4 shadow-sm">
                <p className="text-xs font-bold tracking-wider text-[#904D00] uppercase">Demo Accounts · Password: rentlink123</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fillDemo(acc.email)}
                      disabled={busy}
                      className={cn(
                        'inline-flex min-h-9 items-center rounded-lg border border-amber-200 bg-white px-3 text-xs font-semibold text-[#904D00] shadow-sm transition',
                        'hover:-translate-y-0.5 hover:border-[#D97706] hover:bg-amber-100/50 hover:text-[#663500]'
                      )}
                    >
                      {acc.role.toUpperCase()}: {acc.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}
      </div>
      {intent?.type === 'favorite' && !success && (
        <p className="mt-4 text-center text-xs text-slate-500">Sign in to save this property to your favourites.</p>
      )}
    </Modal>
  );
}
