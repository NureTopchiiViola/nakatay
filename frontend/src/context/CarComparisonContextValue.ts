import { createContext } from 'react';

export interface CarComparisonContextType {
  comparedCarIds: number[];
  addToComparison: (id: number) => void;
  removeFromComparison: (id: number) => void;
  isInComparison: (id: number) => boolean;
  toggleCompare: (id: number) => void;
}

export const CarComparisonContext = createContext<CarComparisonContextType | undefined>(undefined);
