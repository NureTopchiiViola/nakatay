import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MdOutlineShare, 
  MdOutlineFavoriteBorder, 
  MdFavorite,
  MdAdd,
  MdRemove,
  MdOutlineCalendarMonth,
  MdOutlineLocalGasStation,
  MdOutlineSettings,
  MdOutlineDirectionsCar,
  MdOutlineBalance
} from 'react-icons/md';
import balanceCheckIcon from '../../assets/BalanceCheck.svg';
import { API_BASE_URL, getCarImageUrls } from '../../api';
import { Button } from '../../components/ui/Button';
import type { CarDetailsData } from '../../types/Car';
import './CarDetails.css';
import { useCarComparison } from '../../context/useCarComparison';
import { useFavorites } from '../../context/useFavorites';
import { useAuthModal } from '../../context/useAuthModal';

const mockCar: CarDetailsData = {
  id: 1,
  brand: "BMW",
  modelName: "M4",
  trimName: "Competition",
  year: 2024,
  engine: "3.0L Twin-Turbo I6",
  transmission: "AUTOMATIC",
  bodyType: "COUPE",
  price: 3500000.00,
  galleryUrls: [
    "https://placehold.co/800x450/212223/cec6bd?text=BMW+M4+Main",
    "https://placehold.co/150x100/212223/cec6bd?text=Side",
    "https://placehold.co/150x100/212223/cec6bd?text=Interior"
  ]
};

export function CarDetails() {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate(); 
  
  const [carState, setCarState] = useState<{ id: string; car: CarDetailsData | null } | null>(null);
  const isMockCar = id === 'mock';
  const car = isMockCar ? mockCar : carState && carState.id === id ? carState.car : null;
  const isLoading = !isMockCar && Boolean(id) && carState?.id !== id;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const { toggleCompare, isInComparison } = useCarComparison();
  const { isFavorite, isPending, toggleFavorite } = useFavorites();
  const { openAuthModal, openAuthPrompt } = useAuthModal();
  const isAuthenticated = Boolean(localStorage.getItem('accessToken'));
  const currentlyCompared = car ? isInComparison(car.id) : false;
  const currentlyFavorite = isAuthenticated && car ? isFavorite(car.id) : false;

  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const scrollToPurchase = () => {
    document.querySelector('.summary-title')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!id || id === 'mock') return;
    let active = true;

    const fetchCarData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cars/${id}`, {
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data: CarDetailsData = await response.json();
        if (active) setCarState({ id, car: { ...data, galleryUrls: getCarImageUrls(data.galleryUrls) } });
      } catch (error) {
        if (active) {
          console.error("Backend is offline or car not found:", error);
          setCarState({ id, car: null });
        }
      }
    };

    void fetchCarData();
    return () => { active = false; };
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
                <img src={car.galleryUrls[Math.min(activeImageIndex, car.galleryUrls.length - 1)]} alt={`${car.brand} ${car.modelName}`} />
              ) : (
                <div style={{ height: '100%', background: '#2e2e2e' }} />
              )}
            </div>
            
            {car.galleryUrls && car.galleryUrls.length > 0 && (
              <div className="car-gallery-thumbnails">
                {car.galleryUrls.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail-btn ${idx === Math.min(activeImageIndex, car.galleryUrls.length - 1) ? 'active' : ''}`}
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
                onClick={() => toggleCompare(car.id)}
                iconLeft={currentlyCompared ? <img src={balanceCheckIcon} alt="" /> : <MdOutlineBalance />}
              >
                {currentlyCompared ? 'У порівнянні' : 'Порівняти'}
              </Button>
            </div>
            <button
              type="button"
              className="favorite-btn"
              aria-label={currentlyFavorite ? 'Видалити з обраного' : 'Додати в обране'}
              aria-pressed={currentlyFavorite}
              disabled={isPending(car.id)}
              onClick={() => {
                if (!car) return;
                if (!isAuthenticated) {
                  openAuthPrompt();
                  return;
                }
                void toggleFavorite({
                  id: car.id,
                  imageSrc: car.galleryUrls?.[0] ?? '',
                  title: `${car.brand} ${car.modelName} ${car.trimName}`,
                  year: car.year,
                  engine: car.engine,
                  transmission: car.transmission,
                  price: `${new Intl.NumberFormat('uk-UA').format(car.price)} ₴`,
                });
              }}
            >
              {currentlyFavorite ? <MdFavorite size={28} /> : <MdOutlineFavoriteBorder size={28} />}
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
              <span style={{ textTransform: 'capitalize' }}>{car.bodyType?.toLowerCase() || 'N/A'}</span>
            </div>
          </div>

<div className="car-details-accordion">
            <div className="car-color-row">
              <span className="color-label">Колір кузова</span>
              {/* сюди передаватиметься configurator option exteriorColor */}
              <span className="color-value">"Чорна ніч"</span>
            </div>

            <div className="car-color-row">
              <span className="color-label">Колір салону</span>
              {/* сюди передаватиметься configurator option interiorColor */}
              <span className="color-value">Штучна шкіра ARTICO "Чорний"</span>
            </div>

            <hr className="details-divider" />

            <div className="configurator-action-wrapper">
              <Button
                variant="outline"
                className="full-width"
                onClick={() => navigate(`/create?carId=${car.id}`)}
              >
                Змінити комплектацію
              </Button>
            </div>

            <div className={`accordion-item ${openAccordion === 'warranty' ? 'open' : ''}`}>
              <button className="accordion-trigger" onClick={() => toggleAccordion('warranty')}>
                <h3>Гарантійні умови</h3>
                {openAccordion === 'warranty' ? <MdRemove size={24} /> : <MdAdd size={24} />}
              </button>
              {openAccordion === 'warranty' && (
                <div className="accordion-content">
                  <p style={{ padding: '0 1rem 1rem', lineHeight: '1.5', color: '#a0a0a0' }}>
                    Базова гарантія від виробника діє протягом 3 років або до досягнення 100 000 км пробігу (залежно від того, що настане раніше). 
                    Також надається 3 роки гарантії на лакофарбове покриття та 12 років від наскрізної корозії кузова.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="car-purchase-section">
          <h2 className="section-title">Розпочати покупку</h2>

          <div className="purchase-options-grid">
            <button className="purchase-card active" onClick={() => navigate(`/order/${car.id}`)}>
              <h4>Подати заявку на придбання</h4>
              <p>{formattedPrice} ₴</p>
            </button>
            <button className="purchase-card" onClick={scrollToPurchase}>
              <h4>Забронювати авто</h4>
              <p className="purchase-card-subtext">Ми зв'яжемось з вами для підтвердження деталізації та зафіксуємо авто за вами.</p>
            </button>
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
                <Button variant="solid" className="full-width" onClick={() => navigate(`/order/${car.id}`)}>Подати заявку на придбання</Button>
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