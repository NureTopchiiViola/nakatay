import { createContext } from 'react';
import type { FavoriteCar } from '../api';

interface FavoritesContextType {
  favorites: FavoriteCar[];
  isLoading: boolean;
  error: string | null;
  isFavorite: (id: number) => boolean;
  isPending: (id: number) => boolean;
  toggleFavorite: (car: FavoriteCar) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

export const FavoritesContextValue = createContext<FavoritesContextType | undefined>(undefined);
