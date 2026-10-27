import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import { API_BASE_URL } from '../../api';
import { VehicleCard } from '../../components/catalog/VehicleCard';
import type { VehicleCardProps } from '../../components/catalog/VehicleCard';
import './Catalog.css';

interface CatalogCar extends VehicleCardProps {
  id: number;
}

interface CatalogApiCar {
  trimId: number;
  title: string;
  year: number;
  engine: string;
  transmission: string;
  price: number;
  imageUrl: string | null;
}

interface CatalogResponse {
  content: CatalogApiCar[];
  number: number;
  totalPages: number;
}

const PAGE_SIZE = 12;

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('uk-UA').format(value)} ₴`;
}

function formatTransmission(value: string) {
  if (value === 'AUTOMATIC') return 'Автомат';
  if (value.startsWith('CVT')) return 'CVT';
  if (value.startsWith('PDK')) return 'PDK';
  return value;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Не вдалося завантажити каталог.';
}

function getPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const first = Math.max(0, Math.min(currentPage - 1, totalPages - 3));
  const pages = Array.from({ length: 3 }, (_, index) => first + index);
  if (!pages.includes(0)) pages.unshift(0);
  if (!pages.includes(totalPages - 1)) pages.push(totalPages - 1);
  return pages;
}

export function Catalog() {
  const [cars, setCars] = useState<CatalogCar[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCars() {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: String(page),
        size: String(PAGE_SIZE),
      });

      try {
        const response = await fetch(`${API_BASE_URL}/api/cars/search?${params}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`Помилка сервера: ${response.status}`);
        }

        const data = await response.json() as CatalogResponse;
        setCars(data.content.map((car) => ({
          id: car.trimId,
          imageSrc: car.imageUrl ?? '',
          title: car.title,
          year: car.year,
          engine: car.engine,
          transmission: formatTransmission(car.transmission),
          price: formatPrice(car.price),
        })));
        setTotalPages(data.totalPages);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setCars([]);
        setTotalPages(0);
        setError(getErrorMessage(requestError));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadCars();
    return () => controller.abort();
  }, [page, reloadKey]);

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="catalog-page">
      <section className="catalog-content" aria-labelledby="catalog-title">
        <div className="catalog-heading">
          <h1 id="catalog-title">Автомобілі</h1>
          <p>Оберіть автомобіль або створіть власну комплектацію.</p>
        </div>

        {error && (
          <div className="catalog-message catalog-error" role="alert">
            <p>Не вдалося завантажити автомобілі: {error}</p>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
              Спробувати ще раз
            </button>
          </div>
        )}

        {!error && isLoading && (
          <div className="catalog-message" role="status">Завантажуємо автомобілі…</div>
        )}

        {!error && !isLoading && cars.length === 0 && (
          <div className="catalog-message">
            <h2>Автомобілів поки немає</h2>
          </div>
        )}

        {!error && !isLoading && cars.length > 0 && (
          <>
            <div className="catalog-grid">
              {cars.map((car) => <VehicleCard key={car.id} {...car} />)}
            </div>

            {totalPages > 1 && (
              <nav className="catalog-pagination" aria-label="Сторінки каталогу">
                <button
                  type="button"
                  aria-label="Попередня сторінка"
                  disabled={page === 0}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <MdArrowBack aria-hidden="true" />
                </button>
                {pageNumbers.map((pageNumber, index) => (
                  <span className="catalog-page-number-wrap" key={pageNumber}>
                    {index > 0 && pageNumber - pageNumbers[index - 1] > 1 && <span aria-hidden="true">…</span>}
                    <button
                      type="button"
                      aria-current={pageNumber === page ? 'page' : undefined}
                      className={pageNumber === page ? 'current' : ''}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber + 1}
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  aria-label="Наступна сторінка"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((current) => current + 1)}
                >
                  <MdArrowForward aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        )}
      </section>

      <section className="catalog-cta" aria-labelledby="catalog-cta-title">
        <h2 id="catalog-cta-title">Не знайшли те, що хотіли?</h2>
        <p>Створіть автомобіль своєї мрії у конфігураторі.</p>
        <Link to="/create">Перейти до конфігуратора <MdArrowForward aria-hidden="true" /></Link>
      </section>
    </div>
  );
}
