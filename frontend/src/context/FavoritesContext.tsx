import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { FavoritesContextValue } from './FavoritesContextValue';
import type { FavoriteCar } from './FavoritesContextValue';

const STORAGE_KEY = 'nakatay_favorite_cars';

function getAuthenticatedUserId(): string | null {
  if (!localStorage.getItem('accessToken')) return null;
  return localStorage.getItem('userId');
}

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY}:${userId}`;
}

function isFavoriteCar(value: unknown): value is FavoriteCar {
  if (!value || typeof value !== 'object') return false;
  const car = value as Record<string, unknown>;
  return Number.isSafeInteger(car.id)
    && typeof car.title === 'string'
    && (typeof car.year === 'string' || typeof car.year === 'number')
    && typeof car.imageSrc === 'string'
    && typeof car.engine === 'string'
    && typeof car.transmission === 'string'
    && typeof car.price === 'string';
}

function readFavorites(userId: string | null): FavoriteCar[] {
  if (!userId) return [];

  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error('Очікувався список обраних автомобілів.');
    return parsed.filter(isFavoriteCar);
  } catch (error) {
    console.error('Не вдалося завантажити обрані автомобілі:', error);
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const userId = getAuthenticatedUserId();
  const [favorites, setFavorites] = useState<FavoriteCar[]>(() => readFavorites(userId));

  useEffect(() => {
    const currentUserId = getAuthenticatedUserId();
    if (!currentUserId) return;

    try {
      localStorage.setItem(getStorageKey(currentUserId), JSON.stringify(favorites));
    } catch (error) {
      console.error('Не вдалося зберегти обрані автомобілі:', error);
    }
  }, [favorites]);

  function toggleFavorite(car: FavoriteCar) {
    if (!getAuthenticatedUserId()) return;

    setFavorites(current => current.some(favorite => favorite.id === car.id)
      ? current.filter(favorite => favorite.id !== car.id)
      : [...current, car]);
  }

  return (
    <FavoritesContextValue.Provider value={{
      favorites,
      isFavorite: id => Boolean(userId) && favorites.some(car => car.id === id),
      toggleFavorite,
    }}>
      {children}
    </FavoritesContextValue.Provider>
  );
}

