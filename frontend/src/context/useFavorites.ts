import { useContext } from 'react';
import { FavoritesContextValue } from './FavoritesContextValue';

export function useFavorites() {
  const context = useContext(FavoritesContextValue);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
}
