import { createContext } from 'react';

export interface FavoriteCar {
  id: number;
  imageSrc: string;
  title: string;
  year: string | number;
  engine: string;
  transmission: string;
  price: string;
}

interface FavoritesContextType {
  favorites: FavoriteCar[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (car: FavoriteCar) => void;
}

export const FavoritesContextValue = createContext<FavoritesContextType | undefined>(undefined);
