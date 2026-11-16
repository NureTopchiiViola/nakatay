import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdDirectionsCarFilled } from 'react-icons/md';
import { formatMoney } from '../Configurator/configuration';
import { getMockApplications, type ApplicationStatus, type MockApplication } from '../../mocks/applications';
import './Applications.css';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: 'Нова',
  in_progress: 'В обробці',
  completed: 'Завершена',
  cancelled: 'Скасована',
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function ApplicationCard({ application }: { application: MockApplication }) {
  return (
    <article className="application-card">
      <div className="application-image">
        {application.imageUrl
          ? <img src={application.imageUrl} alt={application.vehicleName} />
          : <MdDirectionsCarFilled aria-hidden="true" />}
      </div>

      <div className="application-info">
        <h2>{application.vehicleName}</h2>
        <p>{application.year ?? 'Комплектація'}{application.color ? ` · Колір: ${application.color}` : ''}</p>
        <p className="application-date">Заявка №{application.id} · {formatDate(application.createdAt)}</p>
        <span className={`application-status application-status-${application.status}`}>
          {STATUS_LABELS[application.status]}
        </span>
        {application.selectedOptions.length > 0 && (
          <p className="application-options">{application.selectedOptions.join(' · ')}</p>
        )}
      </div>

      <div className="application-price">
        <strong>{formatMoney(application.totalPrice)}</strong>
        <Link to={application.carId ? `/cars/${application.carId}` : '/create'}>
          Переглянути авто
        </Link>
      </div>
    </article>
  );
}

export function Applications() {
  const [history] = useState(() => {
    try {
      return {
        applications: getMockApplications().sort(
          (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
        ),
        error: '',
      };
    } catch (loadError) {
      console.error('Не вдалося завантажити локальну історію заявок:', loadError);
      return {
        applications: [],
        error: 'Не вдалося завантажити історію заявок із цього браузера.',
      };
    }
  });
  const location = useLocation();
  const createdApplicationId = (location.state as { createdApplicationId?: string } | null)?.createdApplicationId;

  return (
    <main className="applications-page">
      <header className="applications-heading">
        <h1>Історія та статус заявок</h1>
        <p>Тут ви можете переглянути статус ваших замовлень та запитів на покупку.</p>
      </header>

      {createdApplicationId && (
        <p className="application-success" role="status">
          Заявку №{createdApplicationId} створено. Ми зв’яжемося з вами для уточнення деталей.
        </p>
      )}

      {history.error ? (
        <p className="applications-error" role="alert">{history.error}</p>
      ) : history.applications.length > 0 ? (
        <section className="applications-list" aria-label="Ваші заявки">
          {history.applications.map(application => (
            <ApplicationCard application={application} key={application.id} />
          ))}
        </section>
      ) : (
        <section className="applications-empty">
          <h2>Поки що заявок немає</h2>
          <p>Оберіть автомобіль і залиште заявку — вона з’явиться тут.</p>
          <Link to="/">Перейти до каталогу</Link>
        </section>
      )}
    </main>
  );
}
