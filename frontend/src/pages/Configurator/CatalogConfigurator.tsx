import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdDirectionsCarFilled } from 'react-icons/md';
import { createPublicCustomBuildShare, saveCustomBuild } from '../../api';
import { useAuthModal } from '../../context/useAuthModal';
import { CarViewer } from './CarViewer';
import { ResetConfiguration } from './ResetConfiguration';
import { MODEL_NAME, PAINTS, INTERIORS, formatMoney } from './configuration';
import {
  catalogSearch, factoryOptions, fetchCatalogSession, isCompatible, isExclusive,
  optionsFromSearch, selectOption, toVisualConfiguration, verifyCatalogPrice,
} from './catalogConfiguration';
import type { CatalogOption, CatalogSession } from './catalogConfiguration';

const tabs = [
  ['EXTERIOR', 'Екстер’єр'],
  ['INTERIOR', 'Інтер’єр'],
  ['PACKAGES', 'Пакети'],
  ['OPTIONS', 'Опції'],
] as const;

export function CatalogConfigurator({ search }: { search: string }) {
  const [loaded, setLoaded] = useState<{ session: CatalogSession; options: CatalogOption[] }>();
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(search);
    fetchCatalogSession(params.get('carId'), controller.signal)
      .then(session => {
        if (!controller.signal.aborted) setLoaded({ session, options: optionsFromSearch(session, params) });
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [search, retry]);

  if (failed) return <div className="configurator-page configurator-shared-state">
    <p role="alert">Не вдалося відкрити комплектацію. Перевірте посилання або спробуйте ще раз.</p>
    <button type="button" className="configurator-primary" onClick={() => { setFailed(false); setRetry(value => value + 1); }}>Спробувати ще</button>
    {new URLSearchParams(search).has('carId') ? <Link to="/">До каталогу</Link> : <Link to="/create?legacy=1">Відкрити демоконфігуратор BMW E46</Link>}
  </div>;
  if (!loaded) return <div className="configurator-page configurator-shared-state" role="status">Завантажуємо комплектацію…</div>;
  return <CatalogEditor session={loaded.session} initialOptions={loaded.options} />;
}

function CatalogEditor({ session, initialOptions }: { session: CatalogSession; initialOptions: CatalogOption[] }) {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const [selection, setSelection] = useState(initialOptions);
  const availableTabs = tabs.filter(([category]) => session.options.some(option => option.category === category));
  const [tab, setTab] = useState<(typeof tabs)[number][0]>(availableTabs[0]?.[0] ?? 'EXTERIOR');
  const [notice, setNotice] = useState('');
  const [actionPending, setActionPending] = useState(false);
  const [sharedBuild, setSharedBuild] = useState<{ url: string; code: string }>();
  const [serverQuote, setServerQuote] = useState<{ key: string; total: number }>();
  const [failedQuote, setFailedQuote] = useState('');
  const [quoteRetry, setQuoteRetry] = useState(0);
  const isBmw = session.visualizerKey === 'bmw-e46';
  const configuration = toVisualConfiguration(selection);
  const optionCost = selection.reduce((sum, option) => sum + option.priceModifier, 0);
  const search = catalogSearch(session.trimId, selection);
  const priceError = failedQuote === search;
  const confirmedTotal = serverQuote?.key === search ? serverQuote.total : undefined;
  const groups = new Map<string, CatalogOption[]>();
  for (const option of session.options.filter(item => item.category === tab)) {
    const group = option.subCategory ?? 'Опції';
    groups.set(group, [...(groups.get(group) ?? []), option]);
  }

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      verifyCatalogPrice(session.trimId, selection, controller.signal)
        .then(quote => {
          if (!controller.signal.aborted) setServerQuote({ key: search, total: quote.totalPrice });
        })
        .catch(() => {
          if (!controller.signal.aborted) setFailedQuote(search);
        });
    }, 200);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [session.trimId, selection, search, quoteRetry]);

  function reset() {
    setSelection(factoryOptions(session));
    setTab(availableTabs[0]?.[0] ?? 'EXTERIOR');
    setSharedBuild(undefined);
    setFailedQuote('');
    setServerQuote(undefined);
    setNotice('Заводську комплектацію відновлено.');
  }

  async function saveOrShare(action: 'save' | 'share') {
    function requestLogin() {
      navigate(`/create?${search}`, { replace: true });
      openAuthModal();
    }
    if (action === 'save' && !localStorage.getItem('accessToken')) {
      requestLogin();
      return;
    }
    setActionPending(true);
    setSharedBuild(undefined);
    setNotice('');
    try {
      if (action === 'save') {
        await saveCustomBuild(MODEL_NAME, configuration);
        setNotice('Збірку збережено у вашому акаунті.');
      } else {
        const shared = await createPublicCustomBuildShare(MODEL_NAME, configuration);
        setSharedBuild({ url: new URL(shared.url, window.location.origin).href, code: shared.shareCode });
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') requestLogin();
      else setNotice('Не вдалося виконати дію. Спробуйте ще раз.');
    } finally {
      setActionPending(false);
    }
  }

  function renderOption(option: CatalogOption) {
    const exclusive = isExclusive(option);
    const checked = selection.some(item => item.id === option.id);
    const disabled = !option.isAvailable || !isCompatible(option, selection);
    const swatch = option.optionGroup === 'paint' ? PAINTS.find(paint => paint.id === option.visualCode)
      : option.optionGroup === 'interior' ? INTERIORS.find(interior => interior.id === option.visualCode) : undefined;
    return <label key={option.id} className={`configurator-${exclusive ? 'choice' : 'extra'} ${checked ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}>
      <input type={exclusive ? 'radio' : 'checkbox'} name={exclusive ? option.optionGroup ?? undefined : undefined}
        checked={checked} disabled={disabled} onChange={() => {
          setFailedQuote('');
          setServerQuote(undefined);
          setSharedBuild(undefined);
          setSelection(current => selectOption(current, option));
        }} />
      {swatch && <span className="configurator-interior-swatch" style={{ background: swatch.color }} />}
      <span className="configurator-choice-copy"><strong>{option.name}</strong>
        {disabled && <span>{!option.isAvailable ? 'Недоступно' : 'Потрібен сумісний пакет оснащення'}</span>}
      </span>
      <span className="configurator-option-price">+{formatMoney(option.priceModifier)}</span>
    </label>;
  }

  return <div className="configurator-page" id="configurator">
    <div className="configurator-layout">
      <section className="configurator-preview" aria-label="Ваш автомобіль">
        <header className="configurator-model-header">
          <h1>{session.title}</h1>
          <div className="configurator-base-price"><span>Базова вартість:</span><strong>{formatMoney(session.basePrice)}</strong></div>
        </header>
        {isBmw
          ? <CarViewer configuration={configuration} cameraView={tab === 'INTERIOR' ? 'interior' : 'exterior'} onReset={reset} />
          : <div className="configurator-viewer configurator-catalog-photo">
              {session.imageUrl ? <img src={session.imageUrl} alt={session.title} onError={event => { event.currentTarget.hidden = true; }} />
                : <MdDirectionsCarFilled aria-hidden="true" />}
              <div className="configurator-viewer-toolbar"><div className="configurator-viewer-actions"><ResetConfiguration onConfirm={reset} /></div></div>
              <p className="configurator-viewer-hint">3D-огляд для цієї комплектації недоступний.</p>
            </div>}
        {selection.length > 0 && <dl className="configurator-summary-cards">
          {selection.filter(isExclusive).map(option => <div key={option.id}>
            <dt>{option.subCategory}</dt><dd>{option.name}</dd>
          </div>)}
        </dl>}
      </section>
      <section className="configurator-panel" aria-label="Налаштування автомобіля">
        <div className="configurator-tabs" role="group" aria-label="Розділи конфігуратора">
          {availableTabs.map(([id, label]) => <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}
        </div>
        <div className="configurator-tab-content">
          {groups.size === 0 && <p>Для цієї комплектації немає додаткових опцій.</p>}
          {[...groups].map(([name, options]) => <fieldset key={name} className="configurator-fieldset">
            <legend>{name}</legend>{options.map(renderOption)}
          </fieldset>)}
        </div>
        <div className="configurator-checkout">
          <div className="configurator-price-box">
            <dl><div><dt>Базова ціна:</dt><dd>{formatMoney(session.basePrice)}</dd></div>
              <div><dt>Вибрані опції</dt><dd>+{formatMoney(optionCost)}</dd></div></dl>
            <div className="configurator-total"><strong>Загальна вартість:</strong>
              <output aria-live="polite">{formatMoney(confirmedTotal ?? session.basePrice + optionCost)}</output>
            </div>
          </div>
          {priceError && <p role="alert">Не вдалося перевірити ціну. <button type="button" onClick={() => {
            setFailedQuote(''); setQuoteRetry(value => value + 1);
          }}>Спробувати ще</button></p>}
          {sharedBuild && <>
            <label>Посилання на збірку<input readOnly value={sharedBuild.url} onFocus={event => event.currentTarget.select()} /></label>
            <label>Короткий код<input readOnly value={sharedBuild.code} onFocus={event => event.currentTarget.select()} /></label>
          </>}
          <div className="configurator-checkout-actions">
            {isBmw && <>
              <button type="button" disabled={actionPending} onClick={() => void saveOrShare('share')}>Поділитися</button>
              <button type="button" disabled={actionPending} onClick={() => void saveOrShare('save')}>Зберегти збірку</button>
            </>}
            <button type="button" className="configurator-primary" disabled={confirmedTotal === undefined || priceError}
              onClick={() => navigate(`/checkout?${search}`)}>Подати заявку</button>
          </div>
        </div>
      </section>
    </div>
    <div className="configurator-notice" role="status">{notice && <span>{notice}</span>}</div>
  </div>;
}
