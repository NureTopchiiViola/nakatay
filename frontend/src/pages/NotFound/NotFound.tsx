import { Link } from 'react-router-dom';
import './NotFound.css';

export function NotFound() {
  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <p className="not-found-code">404</p>
      <h1 id="not-found-title">Сторінку не знайдено</h1>
      <p className="not-found-description">
        Можливо, адресу введено неправильно або сторінку переміщено.
      </p>
      <Link className="not-found-link" to="/">
        Повернутися до каталогу
      </Link>
    </section>
  );
}
