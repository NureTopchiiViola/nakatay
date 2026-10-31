import React, { useState, useMemo, useEffect } from 'react';
import { MdClose, MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useCarComparison } from '../../context/CarComparisonContext';
import { API_BASE_URL } from '../../api';
import type { CarDetailsData } from '../../types/Car';
import './CarComparison.css';

const SPEC_DEFINITIONS = [
  { key: 'year', label: 'Рік випуску' },
  { key: 'engine', label: 'Двигун/Паливо' },
  { key: 'transmission', label: 'Трансмісія' },
  { key: 'bodyType', label: 'Тип кузова' },
];

interface CarComparisonProps {
  onNavigateToCatalog?: () => void;
}

export function CarComparison({ onNavigateToCatalog }: CarComparisonProps) {
  const navigate = useNavigate();
  const { comparedCarIds, removeFromComparison } = useCarComparison();
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  
  const [cars, setCars] = useState<CarDetailsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCatalogClick = () => {
    if (onNavigateToCatalog) {
      onNavigateToCatalog();
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const fetchCars = async () => {
      if (comparedCarIds.length === 0) {
        setCars([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const promises = comparedCarIds.map(id => 
          fetch(`${API_BASE_URL}/api/cars/${id}`, {
            headers: { 
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
        );
        
        const results = await Promise.all(promises);
        setCars(results);
      } catch (error) {
        console.error("Помилка завантаження даних порівняння:", error);
        setCars([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCars();
  }, [comparedCarIds]);

  const visibleSpecs = useMemo(() => {
    if (!showOnlyDifferences) {
      return SPEC_DEFINITIONS;
    }

    return SPEC_DEFINITIONS.filter((specDef) => {
      if (cars.length <= 1) return true;
      const firstValue = cars[0][specDef.key as keyof CarDetailsData];
      return cars.some((car) => car[specDef.key as keyof CarDetailsData] !== firstValue);
    });
  }, [cars, showOnlyDifferences]);

  const canRemove = cars.length > 0;
  const canAddMore = comparedCarIds.length < 4;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('uk-UA').format(price) + ' ₴';

  if (comparedCarIds.length === 0) {
    return (
      <div className="comparison-page">
        <div className="comparison-container" style={{ textAlign: 'center', padding: '40px' }}>
          <h1 className="comparison-title">Порівняння авто</h1>
          <p style={{ margin: '20px 0', color: '#888' }}>Список порівняння порожній.</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="solid" onClick={handleCatalogClick}>
              Перейти до каталогу
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#fff' }}>Завантаження даних...</div>
        ) : (
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
                        onClick={() => removeFromComparison(car.id)}
                        aria-label="Видалити з порівняння"
                      >
                        <MdClose size={18} />
                      </button>
                    )}
                    <div className="car-image-container">
                      {car.galleryUrls && car.galleryUrls.length > 0 ? (
                        <img src={car.galleryUrls[0]} alt={`${car.brand} ${car.modelName}`} />
                      ) : (
                        <div className="image-placeholder" />
                      )}
                    </div>
                    <h3 className="car-card-name">{car.brand} {car.modelName}</h3>
                    <p className="car-card-price">{formatPrice(car.price)}</p>
                  </div>
                ))}

                {canAddMore && (
                  <div className="add-car-cell" onClick={handleCatalogClick}>
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
                      <span className="spec-value-text" style={{ textTransform: spec.key === 'bodyType' ? 'capitalize' : 'none' }}>
                        {car[spec.key as keyof CarDetailsData] ?? '—'}
                      </span>
                    </div>
                  ))}

                  {canAddMore && <div className="spec-value-cell empty-cell" />}
                </div>
              ))}

            </div>
          </div>
        )}

        {/* повернення в каталог */}
        <div className="comparison-footer-action">
          <Button variant="outline" onClick={handleCatalogClick}>
            Назад до каталогу
          </Button>
        </div>

      </div>
    </div>
  );
}