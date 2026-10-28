import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdArrowBack, MdArrowForward, MdFilterList, MdOutlineSearch } from 'react-icons/md';
import { API_BASE_URL } from '../../api';
import catalogUnavailableIcon from '../../assets/car-settings.svg';
import { VehicleCard } from '../../components/catalog/VehicleCard';
import type { VehicleCardProps } from '../../components/catalog/VehicleCard';
import { Input } from '../../components/ui/Input';
import { CatalogFiltersPanel } from './CatalogFilters';
import {
  EMPTY_CATALOG_FILTERS,
  PRICE_MAX,
  PRICE_MIN,
  type CatalogFilterKey,
  type CatalogFilters,
  type CatalogRange,
  YEAR_MAX,
  YEAR_MIN,
} from './catalogFilterOptions';
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
const SORT_OPTIONS = [
  { value: 'carModel.createdAt,desc', label: 'Найновіші' },
  { value: 'carModel.basePrice,asc', label: 'Від дешевих до дорогих' },
  { value: 'carModel.basePrice,desc', label: 'Від дорогих до дешевих' },
];

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
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [priceRange, setPriceRange] = useState<CatalogRange>([PRICE_MIN, PRICE_MAX]);
  const [yearRange, setYearRange] = useState<CatalogRange>([YEAR_MIN, YEAR_MAX]);
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_CATALOG_FILTERS);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuery(searchInput.trim());
      setPage(0);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCars() {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: String(page),
        size: String(PAGE_SIZE),
        sort,
      });
      if (query) params.set('query', query);
      if (priceRange[0] > PRICE_MIN) params.set('minPrice', String(priceRange[0]));
      if (priceRange[1] < PRICE_MAX) params.set('maxPrice', String(priceRange[1]));
      if (yearRange[0] > YEAR_MIN) params.set('minYear', String(yearRange[0]));
      if (yearRange[1] < YEAR_MAX) params.set('maxYear', String(yearRange[1]));
      filters.brands.forEach((value) => params.append('brands', value));
      filters.models.forEach((value) => params.append('models', value));
      filters.transmissions.forEach((value) => params.append('transmissions', value));
      filters.bodyTypes.forEach((value) => params.append('bodyTypes', value));

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
  }, [filters, page, priceRange, query, reloadKey, sort, yearRange]);

  const pageNumbers = getPageNumbers(page, totalPages);
  const hasActiveFilters = Object.values(filters).some((values) => values.length > 0)
    || priceRange[0] > PRICE_MIN
    || priceRange[1] < PRICE_MAX
    || yearRange[0] > YEAR_MIN
    || yearRange[1] < YEAR_MAX;

  function toggleFilter(key: CatalogFilterKey, value: string) {
    setFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((selected) => selected !== value)
        : [...current[key], value],
    }));
    setPage(0);
  }

  function resetFilters() {
    setFilters(EMPTY_CATALOG_FILTERS);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setYearRange([YEAR_MIN, YEAR_MAX]);
    setPage(0);
  }

  function resetSearchAndFilters() {
    resetFilters();
    setSearchInput('');
    setQuery('');
  }

  function updatePriceRange(range: CatalogRange) {
    setPriceRange(range);
    setPage(0);
  }

  function updateYearRange(range: CatalogRange) {
    setYearRange(range);
    setPage(0);
  }

  return (
    <div className="catalog-page">
      <section className="catalog-content" aria-labelledby="catalog-title">
        <div className="catalog-heading">
          <div>
            <h1 id="catalog-title">Автомобілі</h1>
            <p>Оберіть автомобіль або створіть власну комплектацію.</p>
          </div>
        </div>

        <div className="catalog-toolbar">
          <Input
            aria-label="Пошук автомобілів"
            className="catalog-search"
            iconLeft={<MdOutlineSearch size={20} />}
            placeholder="Пошук за маркою або моделлю"
            type="search"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(0);
            }}
          />
          <div className="catalog-toolbar-actions">
            <button
              type="button"
              className="catalog-filter-toggle"
              aria-controls="catalog-filters"
              aria-expanded={filtersVisible}
              onClick={() => setFiltersVisible((visible) => !visible)}
            >
              <MdFilterList aria-hidden="true" />
              {filtersVisible ? 'Приховати фільтри' : 'Показати фільтри'}
            </button>
            <label className="catalog-sort">
              <select
                aria-label="Сортувати автомобілі"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(0);
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className={`catalog-results-layout ${filtersVisible ? '' : 'filters-hidden'}`}>
          <CatalogFiltersPanel
            filters={filters}
            priceRange={priceRange}
            yearRange={yearRange}
            isVisible={filtersVisible}
            hasActiveFilters={hasActiveFilters}
            onToggleFilter={toggleFilter}
            onReset={resetFilters}
            onPriceRangeChange={updatePriceRange}
            onYearRangeChange={updateYearRange}
          />

          <section className="catalog-results" aria-label="Автомобілі каталогу">
        {error && (
          <div className="catalog-message catalog-error" role="alert">
            <img src={catalogUnavailableIcon} alt="" aria-hidden="true" />
            <h2>Не вдалося завантажити каталог</h2>
            <p>Будь ласка, перевірте з’єднання з інтернетом або спробуйте ще раз.</p>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
              Оновити сторінку
            </button>
          </div>
        )}

        {!error && isLoading && (
          <div className="catalog-message" role="status">Завантажуємо автомобілі…</div>
        )}

        {!error && !isLoading && cars.length === 0 && (
          <div className="catalog-message catalog-empty" role="status">
            <img src={catalogUnavailableIcon} alt="" aria-hidden="true" />
            <h2>За вашим запитом авто не знайдено</h2>
            <p>Спробуйте змінити параметри пошуку або скинути фільтри, щоб побачити інші варіанти.</p>
            <button type="button" onClick={resetSearchAndFilters}>
              Скинути фільтри
            </button>
          </div>
        )}

        {!error && !isLoading && cars.length > 0 && (
          <div className="catalog-grid">
            {cars.map((car) => <VehicleCard key={car.id} {...car} />)}
          </div>
        )}
          </section>
        </div>
        {!error && !isLoading && cars.length > 0 && totalPages > 1 && (
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
      </section>

      <section className="catalog-cta" aria-labelledby="catalog-cta-title">
        <h2 id="catalog-cta-title">Не знайшли те, що хотіли?</h2>
        <p>Створіть автомобіль своєї мрії у конфігураторі.</p>
        <Link to="/create">Перейти до конфігуратора <MdArrowForward aria-hidden="true" /></Link>
      </section>
    </div>
  );
}
