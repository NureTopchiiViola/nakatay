import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdClose, MdContentCopy, MdDirectionsCarFilled, MdOutlineShare } from 'react-icons/md';
import {
  API_BASE_URL,
  createPublicCustomBuildShare,
  deleteCustomBuild,
  fetchCustomBuilds,
  getCarImageUrls,
} from '../../api';
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

function SavedBuildCard({
  build,
  imageUrl,
  onRequestDelete,
}: {
  build: SavedCustomBuild;
  imageUrl: string;
  onRequestDelete: (build: SavedCustomBuild) => void;
}) {
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
      <button
        type="button"
        className="saved-build-delete"
        onClick={() => onRequestDelete(build)}
        aria-label="Видалити збірку"
        title="Видалити збірку"
      >
        <MdClose size={18} />
      </button>

      <div className="saved-build-image">
        {imageUrl ? (
          <img src={imageUrl} alt={build.modelName} />
        ) : (
          <>
            <MdDirectionsCarFilled aria-hidden="true" />
            <span>BMW E46</span>
          </>
        )}
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
  const [carImageUrl, setCarImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [buildToDelete, setBuildToDelete] = useState<SavedCustomBuild | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = deleteDialogRef.current;
    if (!dialog) return;
    if (buildToDelete) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [buildToDelete]);

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

    fetch(`${API_BASE_URL}/api/cars`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then(res => (res.ok ? res.json() : []))
      .then((cars: Array<{ modelName: string; galleryUrls?: string[] }>) => {
        if (controller.signal.aborted) return;
        const e46 = cars.find(c => c.modelName.toLowerCase().includes('e46')) ?? cars[0];
        const urls = getCarImageUrls(e46?.galleryUrls ?? []);
        if (urls[0]) setCarImageUrl(urls[0]);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  function openDeleteModal(build: SavedCustomBuild) {
    setDeleteError('');
    setBuildToDelete(build);
  }

  function closeDeleteModal() {
    if (isDeleting) return;
    setBuildToDelete(null);
    setDeleteError('');
  }

  async function confirmDelete() {
    if (!buildToDelete) return;

    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteCustomBuild(buildToDelete.id);
      setBuilds(current => current.filter(item => item.id !== buildToDelete.id));
      setBuildToDelete(null);
    } catch (err) {
      console.error('Не вдалося видалити збірку:', err);
      setDeleteError(
        err instanceof Error && err.message === 'Unauthorized'
          ? 'Сесія завершилася. Увійдіть у свій акаунт ще раз.'
          : 'Не вдалося видалити збірку. Спробуйте ще раз.'
      );
    } finally {
      setIsDeleting(false);
    }
  }

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
          {builds.map(build => (
            <SavedBuildCard
              build={build}
              key={build.id}
              imageUrl={carImageUrl}
              onRequestDelete={openDeleteModal}
            />
          ))}
        </div>
      ) : (
        <div className="my-builds-state">
          <h3>Збережених збірок поки немає</h3>
          <p>Створіть конфігурацію BMW E46 і збережіть її, щоб повернутися до неї пізніше.</p>
          <Link to="/create">Перейти до конфігуратора</Link>
        </div>
      )}

      <dialog
        ref={deleteDialogRef}
        className="build-delete-dialog"
        aria-labelledby="build-delete-title"
        onCancel={event => {
          event.preventDefault();
          closeDeleteModal();
        }}
        onClick={event => {
          if (event.target === deleteDialogRef.current) closeDeleteModal();
        }}
      >
        {buildToDelete && (
          <div className="build-delete-dialog-content">
            <button
              type="button"
              className="build-delete-dialog-close"
              onClick={closeDeleteModal}
              disabled={isDeleting}
              aria-label="Закрити"
            >
              <MdClose size={20} />
            </button>

            <span className="saved-build-eyebrow">ПІДТВЕРДЖЕННЯ ДІЇ</span>
            <h3 id="build-delete-title">Видалити збірку?</h3>
            <p>
              Ви дійсно хочете видалити конфігурацію{' '}
              <strong>{buildToDelete.modelName}</strong> (від {formatDate(buildToDelete.createdAt)})?
              Цю дію неможливо скасувати.
            </p>

            {deleteError && (
              <p className="saved-build-share-error" role="alert">{deleteError}</p>
            )}

            <div className="build-delete-dialog-actions">
              <button
                type="button"
                className="build-delete-cancel"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Скасувати
              </button>
              <button
                type="button"
                className="build-delete-confirm"
                onClick={() => void confirmDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? 'Видаляємо…' : 'Видалити збірку'}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}