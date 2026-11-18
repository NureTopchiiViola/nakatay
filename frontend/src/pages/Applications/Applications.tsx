import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdDirectionsCarFilled } from 'react-icons/md';
import {
  DEFAULT_CONFIGURATION,
  INTERIORS,
  PACKAGES,
  PAINTS,
  WHEELS,
  configurationFromSearch,
  configurationToSearch,
  formatMoney,
} from '../Configurator/configuration';
import { fetchOrders, getCarImageUrl } from '../../api';
import type { CustomerOrder, OrderStatus } from '../../api';
import './Applications.css';

const STATUS_LABELS: Record<OrderStatus, string> = {
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

function getVehicleLink(application: CustomerOrder): string {
  if (application.carId !== null) return `/cars/${application.carId}`;

  if (application.configurationData) {
    const savedConfiguration = configurationFromSearch(`?${application.configurationData}`);
    return `/create?${configurationToSearch(savedConfiguration)}`;
  }

  const savedOptions = new Set(application.selectedOptions);
  return `/create?${configurationToSearch({
    ...DEFAULT_CONFIGURATION,
    paint: PAINTS.find(paint => paint.name === application.color)?.id ?? DEFAULT_CONFIGURATION.paint,
    wheels: WHEELS.find(wheel => savedOptions.has(wheel.name))?.id ?? DEFAULT_CONFIGURATION.wheels,
    interior: INTERIORS.find(interior =>
      savedOptions.has(interior.summary) || savedOptions.has(interior.name),
    )?.id ?? DEFAULT_CONFIGURATION.interior,
    package: PACKAGES.find(option => savedOptions.has(option.name))?.id ?? DEFAULT_CONFIGURATION.package,
  })}`;
}

function ApplicationCard({ application, isAdmin }: { application: CustomerOrder; isAdmin: boolean }) {
  const imageUrl = getCarImageUrl(application.imageUrl);

  return (
    <article className="application-card">
      <div className="application-image">
        {imageUrl
          ? <img src={imageUrl} alt={application.vehicleName} />
          : <MdDirectionsCarFilled aria-hidden="true" />}
      </div>

      <div className="application-info">
        <h2>{application.vehicleName}</h2>
        <p>{application.year ?? 'Комплектація'}{application.color ? ` · Колір: ${application.color}` : ''}</p>
        <p className="application-date">Заявка №{application.id} · {formatDate(application.createdAt)}</p>
        <span className={`application-status application-status-${application.status}`}>
          {STATUS_LABELS[application.status]}
        </span>
        {isAdmin && (
          <p className="application-options">
            {application.contact.name || 'Клієнт'} · {application.contact.phone || 'Телефон не вказано'} · {application.contact.email || 'Email не вказано'}
          </p>
        )}
        {application.selectedOptions.length > 0 && (
          <p className="application-options">{application.selectedOptions.join(' · ')}</p>
        )}
      </div>

      <div className="application-price">
        <strong>{formatMoney(application.totalPrice)}</strong>
        <Link to={getVehicleLink(application)}>
          Переглянути авто
        </Link>
      </div>
    </article>
  );
}

export function Applications({ headingLevel = 1 }: { headingLevel?: 1 | 2 } = {}) {
  const [applications, setApplications] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const createdApplicationId = (location.state as { createdApplicationId?: string } | null)?.createdApplicationId;
  const isAdmin = localStorage.getItem('userRole')?.toUpperCase() === 'ADMIN';
  const Heading = headingLevel === 1 ? 'h1' : 'h2';

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal)
      .then(setApplications)
      .catch(loadError => {
        if (controller.signal.aborted) return;
        console.error('Не вдалося завантажити заявки:', loadError);
        setError(loadError instanceof Error && loadError.message === 'Unauthorized'
          ? 'Увійдіть у свій акаунт, щоб переглянути заявки.'
          : 'Не вдалося завантажити заявки. Спробуйте пізніше.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="applications-page">
      <header className="applications-heading">
        <Heading>{isAdmin ? 'Усі заявки клієнтів' : 'Історія та статус заявок'}</Heading>
        <p>{isAdmin
          ? 'Переглядайте заявки клієнтів, їхні контактні дані та статуси.'
          : 'Тут ви можете переглянути статус ваших замовлень та запитів на покупку.'}</p>
      </header>

      {createdApplicationId && (
        <p className="application-success" role="status">
          Заявку №{createdApplicationId} створено. Ми зв’яжемося з вами для уточнення деталей.
        </p>
      )}

      {isLoading ? (
        <p className="applications-empty" role="status">Завантажуємо заявки…</p>
      ) : error ? (
        <p className="applications-error" role="alert">{error}</p>
      ) : applications.length > 0 ? (
        <section className="applications-list" aria-label="Ваші заявки">
          {applications.map(application => (
            <ApplicationCard application={application} isAdmin={isAdmin} key={application.id} />
          ))}
        </section>
      ) : (
        <section className="applications-empty">
          <h2>{isAdmin ? 'Заявок поки немає' : 'Поки що заявок немає'}</h2>
          {!isAdmin && (
            <>
              <p>Оберіть автомобіль і залиште заявку — вона з’явиться тут.</p>
              <Link to="/">Перейти до каталогу</Link>
            </>
          )}
        </section>
      )}
    </section>
  );
}
