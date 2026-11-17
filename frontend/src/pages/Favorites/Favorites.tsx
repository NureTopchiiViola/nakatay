import { Link } from 'react-router-dom';
import { VehicleCard } from '../../components/catalog/VehicleCard';
import { useFavorites } from '../../context/useFavorites';
import './Favorites.css';

function EmptyFavoritesIllustration() {
  return (
    <svg className="favorites-empty-illustration" viewBox="0 0 240 136" role="img" aria-label="Список обраного порожній">
      <path d="M22 18h196v7H22zM34 25v99h172V25M48 38h144v86H48z" />
      <path d="M58 48h124v56H58zM72 59h96v32H72z" />
      <path d="M120 66c-5-7-17-2-9 7l9 8 9-8c8-9-4-14-9-7z" />
      <path d="M85 104l18-13h34l18 13" />
    </svg>
  );
}

export function Favorites() {
  const { favorites, isLoading, error, refreshFavorites } = useFavorites();

  return (
    <section className="favorites-page" aria-labelledby="favorites-title">
      <h1 id="favorites-title">Обрані автомобілі{favorites.length > 0 ? ` (${favorites.length})` : ''}</h1>

      {isLoading ? (
        <p className="favorites-message" role="status">Завантажуємо обране…</p>
      ) : error ? (
        <div className="favorites-message favorites-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => void refreshFavorites()}>Спробувати ще раз</button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="favorites-empty">
          <EmptyFavoritesIllustration />
          <h2>Ваш список обраного порожній</h2>
          <p>Тут з’являться автомобілі, які ви додасте до обраного.<br />Перегляньте каталог, щоб знайти авто за своїми вподобаннями.</p>
          <Link className="btn btn-solid favorites-catalog-link" to="/">Перейти до каталогу</Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(car => <VehicleCard key={car.id} {...car} />)}
        </div>
      )}
    </section>
  );
}
