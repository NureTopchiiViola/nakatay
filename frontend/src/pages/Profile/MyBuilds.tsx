import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdDirectionsCarFilled } from 'react-icons/md';
import { fetchCustomBuilds } from '../../api';
import type { SavedCustomBuild } from '../../api';
import {
  EXTRAS,
  getQuote,
  getSelections,
  configurationToSearch,
  formatMoney,
} from '../Configurator/configuration';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function getBuildSearch(build: SavedCustomBuild, includeBuildId = false): string {
  const params = new URLSearchParams(configurationToSearch(build.configuration));
  if (includeBuildId) params.set('buildId', String(build.id));
  return params.toString();
}

function SavedBuildCard({ build }: { build: SavedCustomBuild }) {
  const selected = getSelections(build.configuration);
  const quote = getQuote(build.configuration);
  const extras = EXTRAS.filter(extra => build.configuration.extras.includes(extra.id));

  return (
    <article className="saved-build-card">
      <div className="saved-build-image" aria-hidden="true">
        <MdDirectionsCarFilled />
        <span>BMW E46</span>
      </div>

      <div className="saved-build-content">
        <div className="saved-build-heading">
          <div>
            <span className="saved-build-eyebrow">ЗБІРКА КОРИСТУВАЧА</span>
            <h2>{build.modelName}</h2>
            <p>Збережено {formatDate(build.createdAt)}</p>
          </div>
          <strong>{formatMoney(quote.total)}</strong>
        </div>

        <dl className="saved-build-options">
          <div><dt>Колір</dt><dd>{selected.paint.name}</dd></div>
          <div><dt>Диски</dt><dd>{selected.wheels.name}</dd></div>
          <div><dt>Інтер’єр</dt><dd>{selected.interior.summary}</dd></div>
          <div><dt>Пакет</dt><dd>{selected.package.name}</dd></div>
          {extras.length > 0 && (
            <div className="saved-build-extras">
              <dt>Додаткові опції</dt>
              <dd>{extras.map(extra => extra.name).join(' · ')}</dd>
            </div>
          )}
        </dl>

        <div className="saved-build-actions">
          <Link className="saved-build-edit" to={`/create?${getBuildSearch(build, true)}`}>
            Редагувати збірку
          </Link>
          <Link className="saved-build-order" to={`/checkout?${getBuildSearch(build)}`}>
            Оформити заявку
          </Link>
        </div>
      </div>
    </article>
  );
}

export function MyBuilds() {
  const [builds, setBuilds] = useState<SavedCustomBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchCustomBuilds(controller.signal)
      .then(setBuilds)
      .catch(loadError => {
        if (controller.signal.aborted) return;
        console.error('Не вдалося завантажити збережені збірки:', loadError);
        setError(loadError instanceof Error && loadError.message === 'Unauthorized'
          ? 'Увійдіть у свій акаунт, щоб переглянути збережені збірки.'
          : 'Не вдалося завантажити збірки. Спробуйте пізніше.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="my-builds-page" aria-labelledby="my-builds-heading">
      <header className="my-builds-heading">
        <h2 id="my-builds-heading">Мої збірки</h2>
        <p>Збережені конфігурації, які можна продовжити редагувати або використати для заявки.</p>
      </header>

      {isLoading ? (
        <p className="my-builds-state" role="status">Завантажуємо збірки…</p>
      ) : error ? (
        <p className="my-builds-state my-builds-error" role="alert">{error}</p>
      ) : builds.length > 0 ? (
        <div className="saved-builds-list">
          {builds.map(build => <SavedBuildCard build={build} key={build.id} />)}
        </div>
      ) : (
        <div className="my-builds-state">
          <h3>Збережених збірок поки немає</h3>
          <p>Створіть конфігурацію BMW E46 і збережіть її, щоб повернутися до неї пізніше.</p>
          <Link to="/create">Перейти до конфігуратора</Link>
        </div>
      )}
    </section>
  );
}
