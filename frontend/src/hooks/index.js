import { useEffect, useState, useSyncExternalStore } from 'react';
import { subscribe, getVersion } from '../data/store';
import notificationService from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

export { default as useAsync } from './useAsync';

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = `${title} · RentLink`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

/** Re-renders whenever the in-memory store changes. */
export function useStoreVersion() {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}

export function useUnreadNotifications() {
  const { user } = useAuth();
  useStoreVersion();
  return user ? notificationService.unreadCount(user.id) : 0;
}

export function useUnreadMessages(conversations) {
  if (!Array.isArray(conversations)) return 0;
  return conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
}
