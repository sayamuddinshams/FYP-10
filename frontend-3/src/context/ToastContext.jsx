import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Toast from '../components/common/Toast';

const ToastContext = createContext(null);

const MAX_TOASTS = 4;
const DASHBOARD_ROUTE = /^\/(owner|tenant|admin)(\/|$)/;

export function ToastProvider({ children }) {
  const { pathname } = useLocation();
  const isDashboard = DASHBOARD_ROUTE.test(pathname);
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message, title) => {
      const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setToasts((list) => [...list, { id, type, message, title }].slice(-MAX_TOASTS));
      window.setTimeout(() => remove(id), 4500);
      return id;
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      push,
      remove,
      success: (message, title) => push('success', message, title),
      error: (message, title) => push('error', message, title),
      info: (message, title) => push('info', message, title),
      warning: (message, title) => push('warning', message, title),
    }),
    [push, remove]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={`${isDashboard ? 'dash-theme ' : ''}pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end`}>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

export default ToastContext;
