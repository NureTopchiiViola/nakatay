import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { addFavoriteCar, fetchFavoriteCars, removeFavoriteCar } from '../api';
import type { FavoriteCar } from '../api';
import { Snackbar } from '../components/ui/Snackbar';
import { FavoritesContextValue } from './FavoritesContextValue';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => getAuthenticatedUserId());
  const [favorites, setFavorites] = useState<FavoriteCar[]>([]);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const isLoading = Boolean(userId && (loadedUserId !== userId || isRefreshing));

  useEffect(() => {
    const updateUser = () => {
      setUserId(getAuthenticatedUserId());
      setFavorites([]);
      setLoadedUserId(null);
      setError(null);
      setNotification(null);
    };
    window.addEventListener('nakatay-auth-changed', updateUser);
    window.addEventListener('storage', updateUser);
    return () => {
      window.removeEventListener('nakatay-auth-changed', updateUser);
      window.removeEventListener('storage', updateUser);
    };
  }, []);

  const refreshFavorites = useCallback(async () => {
    if (!userId) {
      setFavorites([]);
      setError(null);
      return;
    }

    setIsRefreshing(true);
    try {
      setFavorites(await fetchFavoriteCars(userId));
      setError(null);
      setLoadedUserId(userId);
    } catch (requestError) {
      setError(requestError instanceof Error && requestError.message === 'Unauthorized'
        ? 'Сесія завершилася. Увійдіть знову, щоб переглянути обране.'
        : 'Не вдалося завантажити обране. Спробуйте ще раз.');
    } finally {
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let active = true;
    const controller = new AbortController();
    fetchFavoriteCars(userId, controller.signal)
      .then((loadedFavorites) => {
        if (!active) return;
        setFavorites(loadedFavorites);
        setError(null);
        setLoadedUserId(userId);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(requestError instanceof Error && requestError.message === 'Unauthorized'
          ? 'Сесія завершилася. Увійдіть знову, щоб переглянути обране.'
          : 'Не вдалося завантажити обране. Спробуйте ще раз.');
        setLoadedUserId(userId);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [userId]);

  async function toggleFavorite(car: FavoriteCar) {
    if (!userId || pendingIds.includes(car.id)) return;

    setPendingIds(current => [...current, car.id]);
    setNotification(null);
    let mutationCompleted = false;
    try {
      if (favorites.some(favorite => favorite.id === car.id)) {
        await removeFavoriteCar(userId, car.id);
      } else {
        await addFavoriteCar(userId, car.id);
      }
      mutationCompleted = true;
      setFavorites(await fetchFavoriteCars(userId));
      setError(null);
      setLoadedUserId(userId);
    } catch (requestError) {
      if (mutationCompleted) {
        setError('Зміну збережено, але не вдалося оновити обране. Спробуйте ще раз.');
        setNotification('Зміну збережено, але список не оновився.');
      } else {
        setNotification(requestError instanceof Error && requestError.message === 'Unauthorized'
          ? 'Сесія завершилася. Увійдіть знову, щоб змінити обране.'
          : 'Не вдалося оновити обране. Спробуйте ще раз.');
      }
    } finally {
      setPendingIds(current => current.filter(id => id !== car.id));
    }
  }

  return (
    <FavoritesContextValue.Provider value={{
      favorites,
      isLoading,
      error,
      isFavorite: id => Boolean(userId) && favorites.some(car => car.id === id),
      isPending: id => pendingIds.includes(id),
      toggleFavorite,
      refreshFavorites,
    }}>
      {children}
      <Snackbar
        isOpen={Boolean(notification)}
        message={notification ?? ''}
        onClose={() => setNotification(null)}
      />
    </FavoritesContextValue.Provider>
  );
}

function getAuthenticatedUserId(): string | null {
  if (!localStorage.getItem('accessToken')) return null;
  return localStorage.getItem('userId');
}

