import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdContentCopy, MdDirectionsCarFilled, MdOutlineShare } from 'react-icons/md';
import { createPublicCustomBuildShare, fetchCustomBuilds } from '../../api';
import type { SavedCustomBuild, SharedCustomBuild } from '../../api';
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
  const [sharedBuild, setSharedBuild] = useState<SharedCustomBuild | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState('');
  const [shareNotice, setShareNotice] = useState('');
  const shareUrl = sharedBuild ? new URL(sharedBuild.url, window.location.origin).toString() : '';

  async function shareBuild() {
    setIsSharing(true);
    setShareError('');
    setShareNotice('');
    try {
      setSharedBuild(await createPublicCustomBuildShare(build.modelName, build.configuration));
    } catch (error) {
      console.error('Не вдалося створити публічне посилання для збірки:', error);
      setShareError('Не вдалося створити посилання. Перевірте з’єднання та спробуйте ще раз.');
    } finally {
      setIsSharing(false);
    }
  }

  async function copyShareValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setShareNotice(`${label} скопійовано.`);
    } catch {
      setShareNotice('Не вдалося скопіювати. Виділіть значення та скопіюйте його вручну.');
    }
  }

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
          <button type="button" onClick={() => void shareBuild()} disabled={isSharing} aria-busy={isSharing}>
            <MdOutlineShare />
            {isSharing ? 'Створюємо посилання…' : sharedBuild ? 'Створити нове посилання' : 'Поділитися'}
          </button>
        </div>
        {isSharing && <p className="saved-build-share-status" role="status">Створюємо публічне посилання…</p>}
        {shareError && <p className="saved-build-share-error" role="alert">{shareError}</p>}
        {sharedBuild && (
          <div className="saved-build-share" aria-label="Публічне посилання на збірку">
            <p>Публічне посилання готове. Його можна надіслати іншим.</p>
            <label htmlFor={`saved-build-link-${build.id}`}>Посилання</label>
            <div className="saved-build-share-field">
              <input
                id={`saved-build-link-${build.id}`}
                readOnly
                value={shareUrl}
                onFocus={event => event.currentTarget.select()}
              />
              <button type="button" onClick={() => void copyShareValue(shareUrl, 'Посилання')}>
                <MdContentCopy /> Копіювати
              </button>
            </div>
            <label htmlFor={`saved-build-code-${build.id}`}>Короткий код</label>
            <div className="saved-build-share-field">
              <input
                id={`saved-build-code-${build.id}`}
                readOnly
                value={sharedBuild.shareCode}
                onFocus={event => event.currentTarget.select()}
              />
              <button type="button" onClick={() => void copyShareValue(sharedBuild.shareCode, 'Код')}>
                <MdContentCopy /> Копіювати
              </button>
            </div>
            {shareNotice && <p className="saved-build-share-status" role="status">{shareNotice}</p>}
          </div>
        )}
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
