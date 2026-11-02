import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { MdOutlineBookmarkBorder, MdOutlineShare, MdChevronRight, MdClose, MdCheck, MdContentCopy, MdOutlineFileDownload } from 'react-icons/md';
import { CarViewer } from './CarViewer';
import {
  BASE_PRICE, MODEL_NAME, PAINTS, WHEELS, INTERIORS, DECORS, PACKAGES, EXTRAS,
  DEFAULT_CONFIGURATION, configurationFromSearch, configurationToSearch, normalizeConfiguration,
  getSelections, getQuote, formatMoney,
} from './configuration';
import type { Configuration, ExtraId } from './configuration';
import './Configurator.css';

const TABS = [
  { id: 'exterior', label: 'Екстер’єр' }, { id: 'interior', label: 'Інтер’єр' },
  { id: 'packages', label: 'Пакети' }, { id: 'options', label: 'Опції' },
] as const;
type Tab = typeof TABS[number]['id'];
const DRAFT_KEY = 'nakatay.configurator.draft.v1';

function Choice({ checked, name, value, title, description, price, disabled, visual, onChange }: {
  checked: boolean; name: string; value: string; title: string; description?: string; price: number;
  disabled?: boolean; visual?: ReactNode; onChange: () => void;
}) {
  return <label className={`configurator-choice ${checked ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}>
    <input type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={onChange} />
    {visual && <span className="configurator-choice-visual" aria-hidden="true">{visual}</span>}
    <span className="configurator-choice-copy"><strong>{title}</strong>{description && <span>{description}</span>}</span>
    <span className="configurator-option-price">+{formatMoney(price)}</span>
    {checked && <MdCheck className="configurator-selected-check" aria-hidden="true" />}
  </label>;
}

export function Configurator() {
  const location = useLocation();
  return <ConfiguratorPage key={location.search} search={location.search} />;
}

function ConfiguratorPage({ search }: { search: string }) {
  const [configuration, setConfiguration] = useState<Configuration>(() => configurationFromSearch(search));
  const [tab, setTab] = useState<Tab>('exterior');
  const [promo, setPromo] = useState('');
  const [promoError, setPromoError] = useState('');
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState<'share' | 'application' | null>(null);
  const [shareLink, setShareLink] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selected = getSelections(configuration);
  const quote = getQuote(configuration);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (modal) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [modal]);

  function update<K extends keyof Configuration>(key: K, value: Configuration[K]) {
    setConfiguration(current => normalizeConfiguration({ ...current, [key]: value }));
    if (key === 'package' && value !== 'sport' && configuration.extras.includes('spoiler')) {
      setNotice('Спойлер прибрано: він доступний лише з пакетом Sport Track Pro.');
    }
  }
  function toggleExtra(id: ExtraId) {
    update('extras', configuration.extras.includes(id) ? configuration.extras.filter(value => value !== id) : [...configuration.extras, id]);
  }
  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(configuration));
      setNotice('Чернетку збережено в цьому браузері.');
    } catch { setNotice('Не вдалося зберегти чернетку. Перевірте налаштування сховища браузера.'); }
  }
  function restoreDraft() {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (!draft) { setNotice('У цьому браузері ще немає збереженої чернетки.'); return; }
      setConfiguration(normalizeConfiguration(JSON.parse(draft)));
      setNotice('Збережену чернетку відновлено.');
    } catch { setNotice('Не вдалося відновити чернетку.'); }
  }
  function openShare() {
    const url = new URL('/create', window.location.origin);
    url.search = configurationToSearch(configuration);
    setShareLink(url.toString());
    setModal('share');
  }
  async function copyLink() {
    try { await navigator.clipboard.writeText(shareLink); setNotice('Посилання скопійовано.'); }
    catch { setNotice('Не вдалося скопіювати. Виділіть посилання та скопіюйте його вручну.'); }
  }
  function downloadSpecification() {
    const blob = new Blob([JSON.stringify({ model: MODEL_NAME, configuration, specification: selected, estimate: quote }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'nakatay-bmw-e46-configuration.json'; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function tabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') next = (index + TABS.length - 1) % TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = TABS.length - 1;
    else return;
    event.preventDefault(); setTab(TABS[next].id);
    document.getElementById(`configurator-tab-${TABS[next].id}`)?.focus();
  }
  function extraChoices(section: 'exterior' | 'options') {
    return EXTRAS.filter(item => item.section === section).map(item => {
      const disabled = !item.available || (item.id === 'spoiler' && configuration.package !== 'sport');
      return <label key={item.id} className={`configurator-extra ${configuration.extras.includes(item.id) ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}>
        <input type="checkbox" checked={configuration.extras.includes(item.id)} disabled={disabled} onChange={() => toggleExtra(item.id)} />
        <span className="configurator-choice-copy"><strong>{item.name}</strong>
          {(section === 'options' || disabled) && <span>{item.description}</span>}
        </span>
        <span className="configurator-option-price">+{formatMoney(item.price)}</span>
      </label>;
    });
  }

  return <div className="configurator-page" id="configurator">
    <div className="configurator-layout">
      <section className="configurator-preview" aria-label="Ваш автомобіль">
        <header className="configurator-model-header">
          <div><span className="configurator-eyebrow">ФЛАГМАНСЬКА МОДЕЛЬ</span><h1>{MODEL_NAME}</h1></div>
          <div className="configurator-base-price"><span>Базова вартість:</span><strong>{formatMoney(BASE_PRICE)}</strong></div>
        </header>
        <CarViewer configuration={configuration} cameraView={tab === 'interior' ? 'interior' : 'exterior'} onReset={() => {
          setConfiguration({ ...DEFAULT_CONFIGURATION, extras: [] }); setPromo(''); setPromoError(''); setNotice('Стандартну конфігурацію відновлено.');
        }} />
        <dl className="configurator-summary-cards">
          <div><dt>Колір кузова:</dt><dd>{selected.paint.name}</dd></div>
          <div><dt>Диски:</dt><dd>{selected.wheels.name}</dd></div>
          <div><dt>Салон:</dt><dd>{selected.interior.summary}</dd></div>
          <div><dt>Пакет додатків:</dt><dd>{configuration.package === 'standard' ? 'Стандартний пакет' : selected.package.name}</dd></div>
        </dl>
        <button className="configurator-restore" type="button" onClick={restoreDraft}>Відновити збережену чернетку</button>
      </section>

      <section className="configurator-panel" aria-label="Налаштування автомобіля">
        <div className="configurator-tabs" role="tablist" aria-label="Розділи конфігуратора">
          {TABS.map((item, index) => <button type="button" key={item.id} id={`configurator-tab-${item.id}`}
            role="tab" aria-selected={tab === item.id} tabIndex={tab === item.id ? 0 : -1}
            aria-controls={`configurator-panel-${item.id}`} onClick={() => setTab(item.id)} onKeyDown={event => tabKeyDown(event, index)}>{item.label}</button>)}
        </div>
        <div className="configurator-tab-content" id={`configurator-panel-${tab}`} role="tabpanel" aria-labelledby={`configurator-tab-${tab}`}>
          {tab === 'exterior' && <>
            <fieldset className="configurator-fieldset"><legend>1. Колір кузова <span>Включено</span></legend>
              <div className="configurator-paints">{PAINTS.map(paint => <label key={paint.id} title={paint.name} className={configuration.paint === paint.id ? 'is-selected' : ''}>
                <input type="radio" name="paint" value={paint.id} checked={configuration.paint === paint.id} onChange={() => update('paint', paint.id)} />
                <span className="configurator-paint-swatch" style={{ background: `linear-gradient(145deg, #ffffff38, transparent 55%), ${paint.color}` }} />
                <span>{paint.shortName}</span>
              </label>)}</div>
            </fieldset>
            <fieldset className="configurator-fieldset"><legend>2. Колісні диски</legend>
              {WHEELS.map((wheel, index) => <Choice key={wheel.id} name="wheels" value={wheel.id} title={wheel.name} description={wheel.description}
                price={wheel.price} checked={configuration.wheels === wheel.id} onChange={() => update('wheels', wheel.id)}
                visual={<span className={`configurator-wheel-icon wheel-${index}`}>✳</span>} />)}
            </fieldset>
            <fieldset className="configurator-fieldset"><legend>3. Аеродинаміка та екстер’єр</legend>{extraChoices('exterior')}</fieldset>
          </>}
          {tab === 'interior' && <>
            <fieldset className="configurator-fieldset"><legend>Матеріал та колір оздоблення салону</legend>
              {INTERIORS.map(interior => <Choice key={interior.id} name="interior" value={interior.id} title={interior.name} description={interior.description}
                price={interior.price} checked={configuration.interior === interior.id} onChange={() => update('interior', interior.id)}
                visual={<span className="configurator-interior-swatch" style={{ background: interior.color }} />} />)}
            </fieldset>
            <fieldset className="configurator-fieldset"><legend>Декоративні вставки</legend>
              <div className="configurator-decor-options">{DECORS.map(decor => <label key={decor.id} className={configuration.decor === decor.id ? 'is-selected' : ''}>
                <input type="radio" name="decor" value={decor.id} checked={configuration.decor === decor.id} onChange={() => update('decor', decor.id)} />
                <strong>{decor.name}</strong><span>{decor.description}</span>
              </label>)}</div>
            </fieldset>
          </>}
          {tab === 'packages' && <fieldset className="configurator-fieldset"><legend className="configurator-sr-only">Пакет оснащення</legend>
            {PACKAGES.map(pack => <label key={pack.id} className={`configurator-package ${configuration.package === pack.id ? 'is-selected' : ''}`}>
              <input type="radio" name="package" value={pack.id} checked={configuration.package === pack.id} onChange={() => update('package', pack.id)} />
              <span className="configurator-package-heading"><strong>Пакет “{pack.name}”</strong><span>+{formatMoney(pack.price)}</span></span>
              <ul>{pack.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
            </label>)}
          </fieldset>}
          {tab === 'options' && <fieldset className="configurator-fieldset"><legend className="configurator-sr-only">Додаткові опції</legend>{extraChoices('options')}</fieldset>}
        </div>

        <div className="configurator-checkout">
          <form className="configurator-promo" onSubmit={event => {
            event.preventDefault(); setPromoError(promo.trim() ? 'Перевірка промокодів стане доступною після підключення сервера. Знижку не застосовано.' : 'Введіть промокод.');
          }}>
            <label className="configurator-sr-only" htmlFor="configurator-promo">Промокод</label>
            <input id="configurator-promo" placeholder="ПРОМОКОД" value={promo} maxLength={40} aria-invalid={!!promoError} aria-describedby={promoError ? 'configurator-promo-error' : undefined}
              onChange={event => { setPromo(event.target.value); setPromoError(''); }} />
            <button type="submit">Застосувати</button>
          </form>
          {promoError && <p id="configurator-promo-error" className="configurator-inline-message" role="status">{promoError}</p>}
          <div className="configurator-price-box">
            <dl><div><dt>Базова ціна:</dt><dd>{formatMoney(quote.basePrice)}</dd></div>
              <div><dt>Вибрані опції</dt><dd>+{formatMoney(quote.optionsPrice)}</dd></div>
            </dl>
            {quote.lines.length > 0 && <details className="configurator-price-details"><summary>Деталізація вартості</summary>
              <dl>{quote.lines.map(line => <div key={line.name}><dt>{line.name}</dt><dd>+{formatMoney(line.price)}</dd></div>)}</dl>
            </details>}
            <div className="configurator-total"><strong>Загальна вартість:</strong><output aria-live="polite" aria-atomic="true">{formatMoney(quote.total)}</output></div>
          </div>
          <div className="configurator-checkout-actions">
            <button type="button" onClick={saveDraft} title="Зберегти чернетку в цьому браузері"><MdOutlineBookmarkBorder /> Зберегти</button>
            <button type="button" onClick={openShare}><MdOutlineShare /> Поділитися</button>
            <button type="button" className="configurator-primary" onClick={() => setModal('application')}>Заявка <MdChevronRight /></button>
          </div>
        </div>
      </section>
    </div>
    <div className="configurator-notice" role="status" aria-live="polite">{notice && <span>{notice}</span>}</div>
    <dialog className="configurator-dialog" ref={dialogRef} onCancel={() => setModal(null)} onClose={() => setModal(null)}>
      <button type="button" className="configurator-dialog-close" onClick={() => setModal(null)} aria-label="Закрити"><MdClose /></button>
      {modal === 'share' && <>
        <h2>Поділитися конфігурацією</h2><p>Посилання містить усі вибрані параметри автомобіля.</p>
        <label htmlFor="configuration-link">Посилання на вашу конфігурацію</label>
        <input id="configuration-link" readOnly value={shareLink} onFocus={event => event.currentTarget.select()} />
        <button type="button" className="configurator-primary" onClick={copyLink}><MdContentCopy /> Копіювати посилання</button>
      </>}
      {modal === 'application' && <>
        <span className="configurator-eyebrow">ВАША КОНФІГУРАЦІЯ</span><h2>{MODEL_NAME}</h2>
        <dl className="configurator-application-summary">
          <div><dt>Колір кузова</dt><dd>{selected.paint.name}</dd></div><div><dt>Диски</dt><dd>{selected.wheels.name}</dd></div>
          <div><dt>Салон</dt><dd>{selected.interior.summary}</dd></div><div><dt>Декор</dt><dd>{selected.decor.name}</dd></div>
          <div><dt>Пакет</dt><dd>{selected.package.name}</dd></div>
          {EXTRAS.filter(item => configuration.extras.includes(item.id)).map(item => <div key={item.id}><dt>{item.name}</dt><dd>+{formatMoney(item.price)}</dd></div>)}
        </dl>
        <div className="configurator-total"><strong>Загальна вартість:</strong><strong>{formatMoney(quote.total)}</strong></div>
        <p>Подання заявки стане доступним після підключення авторизації та сервера. Зараз можна завантажити специфікацію або поділитися конфігурацією.</p>
        <button type="button" className="configurator-primary" onClick={downloadSpecification}><MdOutlineFileDownload /> Завантажити специфікацію</button>
      </>}
    </dialog>
  </div>;
}
