import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ModalProvider } from './context/ModalContext';
import AppRoutes from './routes/AppRoutes';

/**
 * Root Application Component
 * --------------------------
 * Sets up the global context providers that give child components access to:
 *  - AuthProvider: Current authenticated user state, roles, and login/logout methods
 *  - ToastProvider: System-wide alert/notification toast messages
 *  - ModalProvider: Global modal manager (AuthModal, VisitRequestModal, ShareModal, etc.)
 *  - AppRoutes: Complete routing tree with public, tenant, owner, and admin sections
 */
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ModalProvider>
          <AppRoutes />
        </ModalProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
