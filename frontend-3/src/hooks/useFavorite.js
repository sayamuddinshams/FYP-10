import { useCallback } from 'react';
import propertyService from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import { useModals } from '../context/ModalContext';
import { useStoreVersion } from './index';

/** Reactive favourite state backed by the store. */
export default function useFavorite(propertyId) {
  const { user, isAuthenticated } = useAuth();
  const { openAuth } = useModals();
  useStoreVersion();

  const favorites = user ? propertyService.favoritesOf(user.id) : [];
  const favorited = Boolean(propertyId && favorites.includes(propertyId));

  const toggle = useCallback(
    async () => {
      if (!isAuthenticated) {
        openAuth('login', { type: 'favorite', propertyId });
        return { requiresAuth: true };
      }
      const result = await propertyService.toggleFavorite(propertyId, user.id);
      return result;
    },
    [isAuthenticated, openAuth, propertyId, user]
  );

  return { favorited, toggle, favorites };
}
