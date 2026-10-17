import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModals } from '../context/ModalContext';
import { PageLoader } from '../components/common/Spinner';
import Button from '../components/common/Button';
import Icon from '../components/common/icons';

function dashboardPath(role) {
  if (role === 'owner') return '/owner/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/tenant/dashboard';
}

function SignInRequired({ message, onSignIn, onBrowse }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <Icon name="key" className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to continue</h1>
      <p className="mt-2.5 max-w-md text-sm leading-relaxed text-slate-500">{message}</p>
      <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
        <Button size="lg" onClick={onSignIn}>
          Login / Sign Up
        </Button>
        <Button size="lg" variant="outline" onClick={onBrowse}>
          Keep browsing
        </Button>
      </div>
    </div>
  );
}

/**
 * Route guard. Authentication happens in the global modal — there are no
 * standalone login/signup pages.
 */
export default function RequireAuth({ role, allowedRoles, children, message }) {
  const { user, initializing } = useAuth();
  const { openAuth } = useModals();
  const navigate = useNavigate();
  const [prompted, setPrompted] = useState(false);

  useEffect(() => {
    if (!initializing && !user && !prompted) {
      setPrompted(true);
      openAuth('login');
    }
  }, [initializing, user, prompted, openAuth]);

  if (initializing) return <PageLoader label="Checking your session…" />;

  if (!user) {
    return (
      <SignInRequired
        message={message || 'This area is only available to signed-in members. Sign in to manage your visits, messages and saved properties.'}
        onSignIn={() => openAuth('login')}
        onBrowse={() => navigate('/browse')}
      />
    );
  }

  const roles = allowedRoles || (role ? [role] : null);
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }

  return children;
}
