import React, { useState, useMemo } from 'react';
import { MdClose, MdAdd } from 'react-icons/md';
import { Button } from '../../components/ui/Button';
import type { ComparisonCar, SpecDefinition } from '../../types/CarComparison';
import './CarComparison.css';

const SPEC_DEFINITIONS: SpecDefinition[] = [
  { key: 'year', label: 'Рік випуску' },
  { key: 'fuel', label: 'Паливо' },
  { key: 'transmission', label: 'Трансмісія' },
  { key: 'bodyType', label: 'Тип кузова' },
];

const DEFAULT_CARS: ComparisonCar[] = [
  {
    id: '1',
    brand: 'BMW',
    modelName: 'iX3 M60',
    price: 300000,
    imageUrl: 'https://placehold.co/300x200/2e2e2e/cec6bd?text=BMW+iX3',
    specs: {
      year: 2026,
      fuel: 'Електрика',
      transmission: 'Автомат',
      bodyType: 'Хетчбек'
    }
  },
  {
    id: '2',
    brand: 'Toyota',
    modelName: 'Camry',
    price: 300000,
    imageUrl: 'https://placehold.co/300x200/2e2e2e/cec6bd?text=Toyota+Camry',
    specs: {
      year: 2024,
      fuel: 'Гібрид',
      transmission: 'Автомат',
      bodyType: 'Седан'
    }
  },
  {
    id: '3',
    brand: 'Subaru',
    modelName: 'Outback',
    price: 300000,
    imageUrl: 'https://placehold.co/300x200/2e2e2e/cec6bd?text=Subaru+Outback',
    specs: {
      year: 2010,
      fuel: 'Бензин',
      transmission: 'Автомат',
      bodyType: 'Седан'
    }
  }
];

interface CarComparisonProps {
  initialCars?: ComparisonCar[];
  onNavigateToCatalog?: () => void;
}

export function CarComparison({
  initialCars = DEFAULT_CARS,
  onNavigateToCatalog = () => (window.location.href = '#catalog')
}: CarComparisonProps) {
  const [cars, setCars] = useState<ComparisonCar[]>(initialCars);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  // Видалення авто з порівняння працює тільки якщо авто > 2
  const handleRemoveCar = (id: string | number) => {
    if (cars.length > 2) {
      setCars((prev) => prev.filter((car) => car.id !== id));
    }
  };

  const visibleSpecs = useMemo(() => {
    if (!showOnlyDifferences) {
      return SPEC_DEFINITIONS;
    }

    return SPEC_DEFINITIONS.filter((specDef) => {
      if (cars.length <= 1) return true;
      const firstValue = cars[0]?.specs[specDef.key];
      return cars.some((car) => car.specs[specDef.key] !== firstValue);
    });
  }, [cars, showOnlyDifferences]);

  const canRemove = cars.length > 2;
  const canAddMore = cars.length < 4;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('uk-UA').format(price) + ' ₴';

  return (
    <div className="comparison-page">
      <div className="comparison-container">
        <h1 className="comparison-title">Порівняння авто</h1>

        {/* тільки відмінності */}
        <div className="comparison-filter-bar">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showOnlyDifferences}
              onChange={(e) => setShowOnlyDifferences(e.target.checked)}
            />
            <span className="custom-checkbox"></span>
            <span className="checkbox-text">Показувати тільки відмінності</span>
          </label>
        </div>

        {/* таблиця */}
        <div className="comparison-table-wrapper">
          <div className="comparison-grid" style={{ '--col-count': cars.length } as React.CSSProperties}>
            
            {/* Картки авто + Кнопка додавання */}
            <div className="grid-row row-header">
              <div className="spec-label-cell"></div>
              
              {cars.map((car) => (
                <div key={car.id} className="car-card-cell">
                  {canRemove && (
                    <button
                      className="remove-car-btn"
                      onClick={() => handleRemoveCar(car.id)}
                      aria-label="Видалити з порівняння"
                    >
                      <MdClose size={18} />
                    </button>
                  )}
                  <div className="car-image-container">
                    {car.imageUrl ? (
                      <img src={car.imageUrl} alt={`${car.brand} ${car.modelName}`} />
                    ) : (
                      <div className="image-placeholder" />
                    )}
                  </div>
                  <h3 className="car-card-name">{car.brand} {car.modelName}</h3>
                  <p className="car-card-price">{formatPrice(car.price)}</p>
                </div>
              ))}

              {canAddMore && (
                <div className="add-car-cell" onClick={onNavigateToCatalog}>
                  <div className="add-car-content">
                    <span>Додати авто</span>
                    <MdAdd size={20} />
                  </div>
                </div>
              )}
            </div>

            {/* характеристики */}
            {visibleSpecs.map((spec) => (
              <div key={spec.key} className="grid-row spec-row">
                <div className="spec-label-cell">{spec.label}</div>
                
                {cars.map((car) => (
                  <div key={car.id} className="spec-value-cell">
                    <span className="mobile-spec-label">{spec.label}</span>
                    <span className="spec-value-text">
                      {car.specs[spec.key] ?? '—'}
                    </span>
                  </div>
                ))}

                {canAddMore && <div className="spec-value-cell empty-cell" />}
              </div>
            ))}

          </div>
        </div>

        {/* повернення в каталог */}
        <div className="comparison-footer-action">
          <Button variant="outline" onClick={onNavigateToCatalog}>
            Назад до каталогу
          </Button>
        </div>

      </div>
    </div>
  );
}