import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ComparisonCar } from '../types/CarComparison';

interface CarComparisonContextType {
  comparedCars: ComparisonCar[];
  addToComparison: (car: ComparisonCar) => void;
  removeFromComparison: (id: string | number) => void;
  isInComparison: (id: string | number) => boolean;
}

const CarComparisonContext = createContext<CarComparisonContextType | undefined>(undefined);

const STORAGE_KEY = 'nakatay_compared_cars';

export const CarComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparedCars, setComparedCars] = useState<ComparisonCar[]>(() => {
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comparedCars));
  }, [comparedCars]);

  const addToComparison = (car: ComparisonCar) => {
    setComparedCars((prev) => {
      if (prev.some((item) => item.id === car.id)) return prev;
      if (prev.length >= 4) return prev;
      return [...prev, car];
    });
  };

  const removeFromComparison = (id: string | number) => {
    setComparedCars((prev) => prev.filter((car) => car.id !== id));
  };

  const isInComparison = (id: string | number) => {
    return comparedCars.some((car) => car.id === id);
  };

  return (
    <CarComparisonContext.Provider
      value={{ comparedCars, addToComparison, removeFromComparison, isInComparison }}
    >
      {children}
    </CarComparisonContext.Provider>
  );
};

export const useCarComparison = () => {
  const context = useContext(CarComparisonContext);
  if (!context) {
    throw new Error('useCarComparison must be used within a CarComparisonProvider');
  }
  return context;
};