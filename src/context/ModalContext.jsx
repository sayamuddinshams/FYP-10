import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import AuthModal from '../components/common/AuthModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ModalContext = createContext(null);

/**
 * Global modal host:
 * - auth modal (login / signup / forgot password)
 * - promise-based confirmation dialog for destructive actions
 */
export function ModalProvider({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [pendingIntent, setPendingIntent] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const confirmResolver = useRef(null);

  const openAuth = useCallback((mode = 'login', intent = null) => {
    setAuthMode(mode);
    setPendingIntent(intent);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    setPendingIntent(null);
  }, []);

  const switchAuthMode = useCallback((mode) => setAuthMode(mode), []);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      confirmResolver.current = resolve;
      setConfirmState({
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        tone: options.tone || 'danger',
      });
    });
  }, []);

  const settleConfirm = useCallback((result) => {
    if (confirmResolver.current) {
      confirmResolver.current(result);
      confirmResolver.current = null;
    }
    setConfirmState(null);
  }, []);

  const value = useMemo(
    () => ({ openAuth, closeAuth, switchAuthMode, authOpen, authMode, pendingIntent, confirm }),
    [openAuth, closeAuth, switchAuthMode, authOpen, authMode, pendingIntent, confirm]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <AuthModal open={authOpen} mode={authMode} intent={pendingIntent} onClose={closeAuth} onSwitchMode={switchAuthMode} />
      <ConfirmDialog state={confirmState} onConfirm={() => settleConfirm(true)} onCancel={() => settleConfirm(false)} />
    </ModalContext.Provider>
  );
}

export function useModals() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModals must be used inside <ModalProvider>');
  return ctx;
}

export default ModalContext;
