import { useContext } from 'react';
import { CarComparisonContext } from './CarComparisonContextValue';

export function useCarComparison() {
  const context = useContext(CarComparisonContext);
  if (!context) {
    throw new Error('useCarComparison must be used within a CarComparisonProvider');
  }
  return context;
}
