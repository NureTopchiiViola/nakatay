import { useEffect, useMemo, useState } from 'react';
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
import { fetchOrders, updateOrderStatus, getCarImageUrl } from '../../api';
import type { CustomerOrder, OrderStatus } from '../../api';
import './Applications.css';

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Нова',
  in_progress: 'В обробці',
  completed: 'Завершена',
  cancelled: 'Скасована',
};

type SortOrder = 'newest' | 'oldest';

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: 'Спочатку нові' },
  { value: 'oldest', label: 'Спочатку старі' },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function getVehicleLink(application: CustomerOrder): string {
  if (application.carId !== null && application.configurationData) {
    const params = new URLSearchParams(application.configurationData);
    if (params.get('configured') === '1') {
      params.set('carId', String(application.carId));
      return `/create?${params.toString()}`;
    }
  }
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

export function Applications({ headingLevel = 1 }: { headingLevel?: 1 | 2 } = {}) {
  const [applications, setApplications] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const location = useLocation();
  const createdApplicationId = (location.state as { createdApplicationId?: string } | null)?.createdApplicationId;
  const isAdmin = localStorage.getItem('userRole')?.toUpperCase() === 'ADMIN';
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const sortedApplications = useMemo(() => {
    const direction = sortOrder === 'newest' ? -1 : 1;
    return [...applications].sort(
      (a, b) =>
        direction *
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || a.id - b.id),
    );
  }, [applications, sortOrder]);

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

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      setApplications(prev => prev.map(order => order.id === orderId ? updatedOrder : order));
    } catch (err) {
      console.error('Не вдалося оновити статус:', err);
      alert('Помилка при оновленні статусу заявки');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="applications-page">
      <header className="applications-heading">
        <Heading>{isAdmin ? 'Усі заявки клієнтів' : 'Історія та статус заявок'}</Heading>
        <p>{isAdmin
          ? 'Переглядайте заявки клієнтів, їхні контактні дані та керуйте статусами.'
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
          <>
            <div className="applications-toolbar">
              <label className="applications-sort">
                <span>Сортувати</span>
                <select
                  value={sortOrder}
                  onChange={event => setSortOrder(event.target.value as SortOrder)}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            {isAdmin ? (
              <div className="applications-table-wrapper">
                <table className="applications-table">
                  <thead>
                    <tr>
                      <th>ID / Дата</th>
                      <th>Автомобіль</th>
                      <th>Клієнт</th>
                      <th>Сума</th>
                      <th>Статус</th>
                      <th>Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedApplications.map(app => {
                      const imageUrl = getCarImageUrl(app.imageUrl);
                      return (
                        <tr key={app.id}>
                          <td>
                            <strong>№{app.id}</strong>
                            <span className="table-date">{formatDate(app.createdAt)}</span>
                          </td>
                          <td>
                            <div className="table-car-cell">
                              <div className="table-car-thumb">
                                {imageUrl ? <img src={imageUrl} alt={app.vehicleName} /> : <MdDirectionsCarFilled />}
                              </div>
                              <div>
                                <span className="table-car-title">{app.vehicleName}</span>
                                <span className="table-car-sub">{app.year ?? ''} {app.color ? `· ${app.color}` : ''}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="table-contact">
                              <strong>{app.contact.name || 'Клієнт'}</strong>
                              <span>{app.contact.phone || '-'}</span>
                              <span>{app.contact.email || '-'}</span>
                            </div>
                          </td>
                          <td>
                            <strong>{formatMoney(app.totalPrice)}</strong>
                          </td>
                          <td>
                            <select
                              className={`status-select status-${app.status}`}
                              value={app.status}
                              disabled={updatingId === app.id}
                              onChange={e => void handleStatusChange(app.id, e.target.value as OrderStatus)}
                            >
                              <option value="new">Нова</option>
                              <option value="in_progress">В обробці</option>
                              <option value="completed">Завершена</option>
                              <option value="cancelled">Скасована</option>
                            </select>
                          </td>
                          <td>
                            <Link to={getVehicleLink(app)} className="table-link">
                              Переглянути
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <section className="applications-list" aria-label="Ваші заявки">
                {sortedApplications.map(application => {
                  const imageUrl = getCarImageUrl(application.imageUrl);
                  return (
                    <article className="application-card" key={application.id}>
                      <div className="application-image">
                        {imageUrl
                          ? <img src={imageUrl} alt={application.vehicleName} />
                          : <MdDirectionsCarFilled aria-hidden="true" />}
                      </div>

                      <div className="application-info">
                        <h2>{application.vehicleName}</h2>
                        <p>{application.year ?? 'Комплектація'}{application.color ? ` · Колір: ${application.color}` : ''}</p>
                        {application.selectedOptions.length > 0 && (
                          <p className="application-options">{application.selectedOptions.join(' · ')}</p>
                        )}
                      </div>

                      <div className="application-right-group">
                        <div className="application-meta">
                          <span className="application-number-label">Заявка №{application.id}</span>
                          <span className="application-date-label">від {formatDate(application.createdAt)}</span>
                          <span className={`application-status application-status-${application.status}`}>
                            {STATUS_LABELS[application.status]}
                          </span>
                        </div>

                        <div className="application-price">
                          <strong>{formatMoney(application.totalPrice)}</strong>
                          <Link to={getVehicleLink(application)}>
                            Переглянути деталі
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </>
        ) : (
        <section className="applications-empty">
          <h2>{isAdmin ? 'Заявок поки немає' : 'Поки що заявок немає'}</h2>
          {!isAdmin && (
            <>
              <p>Оберіть автомобіль і залиште заявку - вона з’явиться тут.</p>
              <Link to="/">Перейти до каталогу</Link>
            </>
          )}
        </section>
      )}
    </section>
  );
}
