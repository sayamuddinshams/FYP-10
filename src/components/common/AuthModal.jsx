import { useEffect, useState } from 'react';
import Modal from './Modal';
import Button from './Button';
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

function PasswordToggle({ show, onToggle, id }) {
  return (
    <button
      type="button"
      id={id}
      onClick={onToggle}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700"
    >
      {show ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
          <path d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8M9.9 4.2A10.7 10.7 0 0112 4c5 0 9 4 10 8a12.4 12.4 0 01-2.4 4.4M6.6 6.7A13.7 13.7 0 002 12c1 4 5 8 10 8 1.5 0 2.9-.4 4.1-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
          <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      )}
    </button>
  );
}

export default function AuthModal({ open, mode, intent, onClose, onSwitchMode }) {
  const { login, signup, loginWithGoogle } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'tenant', remember: true });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) {
      setErrors({});
      setBanner('');
      setSuccess('');
      setShowPassword(false);
    }
  }, [open, mode]);

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    setBanner('');
  };

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

    setLoading(true);
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
      setLoading(false);
    }
  }

  async function forgotPasswordFlow(email) {
    const res = await authService.forgotPassword({ email });
    return res.message;
  }

  async function google() {
    setBanner('');
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      toast.success(`Signed in with Google as ${user.name}.`, 'Signed in');
      onClose();
    } catch (err) {
      setBanner(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(email) {
    setForm((prev) => ({ ...prev, email, password: 'rentlink123' }));
    setErrors({});
    setBanner('');
  }

  const copy = TITLES[mode] || TITLES.login;

  return (
    <Modal open={open} onClose={onClose} size="lg" title={copy.title} description={copy.subtitle}>
      <div className="grid gap-6 sm:grid-cols-[1fr]">
        <div>
          {mode === 'forgot' && success ? (
            <div className="animate-fade-up rounded-xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-soft">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
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
            <form onSubmit={submit} noValidate className="space-y-4">
              {banner && (
                <div role="alert" className="animate-fade-in flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 5a1 1 0 012 0v6a1 1 0 11-2 0V5zm1 9a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z" clipRule="evenodd" />
                  </svg>
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
                  error={errors.name}
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
                error={errors.email}
              />

              {mode !== 'forgot' && (
                <div>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set('password')}
                    error={errors.password}
                    hint={mode === 'signup' ? 'Minimum 6 characters' : undefined}
                    inputClassName="pr-11"
                    rightIcon={<PasswordToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                  />
                </div>
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
                    error={errors.confirmPassword}
                    rightIcon={<PasswordToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                  />
                  <fieldset className="rounded-2xl border border-line bg-surface/60 p-4 shadow-soft">
                    <legend className="px-1.5 text-sm font-medium text-slate-700">Account type</legend>
                    <div className="space-y-2.5">
                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3.5 transition-all duration-200',
                          form.role === 'tenant' ? 'border-brand-300 ring-2 ring-brand-100' : 'border-line hover:border-brand-200'
                        )}
                      >
                        <input
                          type="radio"
                          name="role"
                          checked={form.role === 'tenant'}
                          onChange={() => setForm((p) => ({ ...p, role: 'tenant' }))}
                          className="mt-1 h-4 w-4 shrink-0 cursor-pointer border-line text-brand-700 accent-brand-700 focus:ring-brand-300"
                        />
                        <span className="select-none">
                          <span className="block text-sm font-semibold text-slate-800">Tenant</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                            Find and save properties, request visits, message owners.
                          </span>
                        </span>
                      </label>
                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3.5 transition-all duration-200',
                          form.role === 'owner' ? 'border-brand-300 ring-2 ring-brand-100' : 'border-line hover:border-brand-200'
                        )}
                      >
                        <input
                          type="radio"
                          name="role"
                          checked={form.role === 'owner'}
                          onChange={() => setForm((p) => ({ ...p, role: 'owner' }))}
                          className="mt-1 h-4 w-4 shrink-0 cursor-pointer border-line text-brand-700 accent-brand-700 focus:ring-brand-300"
                        />
                        <span className="select-none">
                          <span className="block text-sm font-semibold text-slate-800">Owner / Agent</span>
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
                <div className="flex items-center justify-between gap-3">
                  <Checkbox
                    checked={form.remember}
                    onChange={(e) => setForm((p) => ({ ...p, remember: e.target.checked }))}
                    label="Remember me"
                  />
                  <button
                    type="button"
                    onClick={() => onSwitchMode('forgot')}
                    className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" loading={loading} fullWidth size="lg">
                {mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Send reset link'}
              </Button>

              {mode !== 'forgot' && (
                <>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="h-px flex-1 bg-line" />
                    or continue with
                    <span className="h-px flex-1 bg-line" />
                  </div>
                  <Button type="button" variant="outline" fullWidth onClick={google} disabled={loading}>
                    <GoogleIcon />
                    Continue with Google
                  </Button>
                </>
              )}

              <p className="text-center text-sm text-slate-500">
                {mode === 'login' ? (
                  <>
                    New to RentLink?{' '}
                    <button type="button" onClick={() => onSwitchMode('signup')} className="font-semibold text-brand-700 hover:text-brand-900">
                      Create an account
                    </button>
                  </>
                ) : mode === 'signup' ? (
                  <>
                    Already have an account?{' '}
                    <button type="button" onClick={() => onSwitchMode('login')} className="font-semibold text-brand-700 hover:text-brand-900">
                      Login
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => onSwitchMode('login')} className="font-semibold text-brand-700 hover:text-brand-900">
                    Back to login
                  </button>
                )}
              </p>

              {mode === 'login' && (
                <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3.5">
                  <p className="text-xs font-bold tracking-wide text-brand-800 uppercase">Demo accounts · password rentlink123</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => fillDemo(acc.email)}
                        className={cn(
                          'rounded-lg border border-brand-100 bg-white px-2.5 py-1.5 text-xs font-medium text-brand-800 shadow-soft transition',
                          'hover:-translate-y-px hover:border-brand-300 hover:bg-brand-50 hover:text-brand-900'
                        )}
                      >
                        {acc.role}: {acc.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
      {intent?.type === 'favorite' && !success && (
        <p className="mt-4 text-center text-xs text-slate-400">Sign in to save this property to your favourites.</p>
      )}
    </Modal>
  );
}
