import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  MdOutlineShare, 
  MdOutlineFavoriteBorder, 
  MdAdd,
  MdOutlineCalendarMonth,
  MdOutlineLocalGasStation,
  MdOutlineSettings,
  MdOutlineDirectionsCar,
  MdOutlineBalance
} from 'react-icons/md';
import balanceCheckIcon from '../../assets/BalanceCheck.svg';
import { Button } from '../../components/ui/Button';
import type { CarDetailsData } from '../../types/Car';
import './CarDetails.css';

export function CarDetails() {
  const { id } = useParams<{ id: string }>(); 
  
  const [car, setCar] = useState<CarDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCompared, setIsCompared] = useState(false);

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://ignition-arose-confider.ngrok-free.dev/api/cars/${id}`, {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data: CarDetailsData = await response.json();
        setCar(data);
      } catch (error) {
        console.error("Error fetching car data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchCarData();
  }, [id]);

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: '#fff' }}>Завантаження даних...</div>;
  }

  if (!car) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: '#fff' }}>Автомобіль не знайдено (404)</div>;
  }

  const formattedPrice = new Intl.NumberFormat('uk-UA').format(car.price);

  return (
    <div className="car-page-container">
      <div className="car-page-grid">
        <section className="car-info-section">
          <header className="car-page-header">
            <div className="car-title-block">
              <h1 className="car-title">{car.brand} {car.modelName}</h1>
              <span className="car-trim">{car.trimName}</span>
            </div>
            <div className="car-price-main">{formattedPrice} ₴</div>
          </header>

          <div className="car-gallery">
            <div className="car-gallery-main">
              <div className="car-availability-badge">В наявності</div>
              {car.galleryUrls && car.galleryUrls.length > 0 ? (
                <img src={car.galleryUrls[activeImageIndex]} alt={`${car.brand} ${car.modelName}`} />
              ) : (
                <div style={{ height: '100%', background: '#2e2e2e' }} /> // Fallback if no images
              )}
            </div>
            
            {car.galleryUrls && car.galleryUrls.length > 0 && (
              <div className="car-gallery-thumbnails">
                {car.galleryUrls.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail-btn ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="car-actions-bar">
            <div className="actions-group">
              <Button variant="ghost" iconLeft={<MdOutlineShare />}>Поділитися</Button>
              <Button
                variant="ghost"
                onClick={() => setIsCompared(!isCompared)}
                iconLeft={isCompared ? <img src={balanceCheckIcon} alt="" /> : <MdOutlineBalance />}
              >
                {isCompared ? 'У порівнянні' : 'Порівняти'}
              </Button>
            </div>
            <button className="favorite-btn" aria-label="Додати в обране">
              <MdOutlineFavoriteBorder size={28} />
            </button>
          </div>

          <div className="car-specs-icons">
            <div className="spec-item">
              <MdOutlineCalendarMonth size={24} />
              <span>{car.year}</span>
            </div>
            <div className="spec-item">
              <MdOutlineLocalGasStation size={24} />
              <span>{car.engine}</span>
            </div>
            <div className="spec-item">
              <MdOutlineSettings size={24} />
              <span>{car.transmission}</span>
            </div>
            <div className="spec-item">
              <MdOutlineDirectionsCar size={24} />
              <span style={{ textTransform: 'capitalize' }}>{car.bodyType.toLowerCase()}</span>
            </div>
          </div>

          <div className="car-details-accordion">
            <div className="accordion-item">
              <h3>Колір кузова</h3>
            </div>
            <div className="accordion-item">
              <h3>Колір салону</h3>
            </div>

            <div className="configurator-action-wrapper">
              <Button
                variant="outline"
                className="full-width"
                onClick={() => window.location.href = '#configurator'}
              >
                Відкрити конфігуратор
              </Button>
            </div>

            <button className="accordion-item accordion-trigger">
              <h3>Гарантійні умови</h3>
              <MdAdd size={24} />
            </button>
          </div>
        </section>

        <aside className="car-purchase-section">
          <h2 className="section-title">Розпочати покупку</h2>

          <div className="purchase-options-grid">
            <div className="purchase-card active">
              <h4>Подати заявку на придбання</h4>
              <p>{formattedPrice} ₴</p>
            </div>
            <div className="purchase-card">
              <h4>Забронювати авто</h4>
              <p className="purchase-card-subtext">Ми зв'яжемось з вами для підтвердження деталізації та зафіксуємо авто за вами.</p>
            </div>
          </div>

          <div className="purchase-legal-grid">
            <div className="legal-text">
              <p><strong>{formattedPrice} ₴*</strong></p>
              <p>*Вказано вартість авто у базовій комплектації. Фінальна ціна може змінюватися залежно від обраних додаткових опцій у конфігураторі. Подання заявки є безкоштовним і не потребує передплат.</p>
            </div>
            <div className="legal-text">
              <p><strong>*Умови проведення тест-драйву:</strong></p>
              <p>Для проходження тест-драйву необхідно мати при собі дійсне посвідчення водія категорії B та документ, що посвідчує особу. Запис синхронізується з розкладом автосалону та буде доступний у вашому особистому кабінеті.</p>
            </div>
          </div>

          <h2 className="section-title summary-title">Підсумок щодо комерційної пропозиції</h2>

          <div className="summary-panel">
            <div className="summary-header">
              <div className="summary-info">
                <h3>{car.brand} {car.modelName}</h3>
                <span className="summary-trim">{car.trimName}</span>
                <div className="summary-price">{formattedPrice} ₴</div>
                <span className="summary-price-note">Зафіксована ціна за обрану комплектацію</span>
              </div>
              {car.galleryUrls && car.galleryUrls.length > 0 && (
                <img src={car.galleryUrls[0]} alt="Car thumbnail" className="summary-thumbnail" />
              )}
            </div>

            <div className="summary-actions">
              <div className="action-group">
                <Button variant="solid" className="full-width">Подати заявку на придбання</Button>
                <span className="action-helper-text">Без грошових передплат та прив'язки картки.</span>
              </div>
              <div className="action-group">
                <Button variant="outline" className="full-width">Запис на тест-драйв</Button>
                <span className="action-helper-text">Оберіть зручну дату та вільний часовий слот у нашому календарі.</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}