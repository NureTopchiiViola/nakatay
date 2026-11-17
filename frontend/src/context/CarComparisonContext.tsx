import React, { useState, useEffect } from 'react';
import { CarComparisonContext } from './CarComparisonContextValue';

const STORAGE_KEY = 'nakatay_compared_car_ids';

export const CarComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparedCarIds, setComparedCarIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse compared cars from localStorage', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comparedCarIds));
  }, [comparedCarIds]);

  const addToComparison = (id: number) => {
    setComparedCarIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const removeFromComparison = (id: number) => {
    setComparedCarIds((prev) => prev.filter((carId) => carId !== id));
  };

  const isInComparison = (id: number) => {
    return comparedCarIds.includes(id);
  };

  const toggleCompare = (id: number) => {
    if (isInComparison(id)) {
      removeFromComparison(id);
    } else {
      addToComparison(id);
    }
  };

  return (
    <CarComparisonContext.Provider
      value={{ comparedCarIds, addToComparison, removeFromComparison, isInComparison, toggleCompare }}
    >
      {children}
    </CarComparisonContext.Provider>
  );
};
