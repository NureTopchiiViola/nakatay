import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { API_BASE_URL, createOrder, getCarImageUrls } from '../../api';
import type { OrderPaymentMethod } from '../../api';
import { getUserProfile } from '../../auth/userProfile';
import type { UserProfile } from '../../auth/userProfile';
import { useAuthModal } from '../../context/useAuthModal';
import type { CarDetailsData } from '../../types/Car';
import {
  configurationFromSearch,
  configurationToSearch,
  getQuote,
  getSelections,
  formatMoney,
  MODEL_NAME,
} from '../Configurator/configuration';
import './Checkout.css';

type ContactField = keyof UserProfile;

const FIELD_LABELS: Record<ContactField, string> = {
  name: "Ім'я та прізвище",
  phone: 'Номер телефону',
  email: 'Email',
};

function readProfile(): UserProfile {
  let saved: Partial<UserProfile> = {};
  try {
    const stored = localStorage.getItem('userProfile');
    if (stored) saved = JSON.parse(stored) as Partial<UserProfile>;
  } catch (error) {
    console.error('Не вдалося прочитати контактні дані профілю:', error);
  }
  const claims = getUserProfile(localStorage.getItem('accessToken') ?? '');

  return {
    name: saved.name || claims.name,
    email: saved.email || claims.email,
    phone: saved.phone || claims.phone,
  };
}

function validateContact(field: ContactField, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return `Вкажіть ${FIELD_LABELS[field].toLocaleLowerCase('uk-UA')}.`;

  if (field === 'name' && !/^[\p{L}][\p{L}\s’'-]{1,}$/u.test(trimmed)) {
    return "Введіть ім'я та прізвище.";
  }
  if (field === 'phone') {
    const normalized = trimmed.replace(/[\s()-]/g, '');
    if (!/^(?:\+?380\d{9}|0\d{9})$/.test(normalized)) {
      return 'Введіть коректний український номер телефону.';
    }
  }
  if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Введіть коректну адресу email.';
  }
  return '';
}

export function Checkout() {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const { id: routeCarId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const carId = routeCarId ?? searchParams.get('carId');
  const [contact, setContact] = useState<UserProfile>(readProfile);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>('cash');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [car, setCar] = useState<CarDetailsData | null>(null);
  const [carError, setCarError] = useState('');

  const configuration = configurationFromSearch(window.location.search);
  const quote = getQuote(configuration);
  const selections = getSelections(configuration);
  const isConfiguratorOrder = !carId;
  const basePrice = isConfiguratorOrder ? quote.basePrice : car?.price ?? 0;
  const optionsPrice = isConfiguratorOrder ? quote.optionsPrice : 0;
  const total = basePrice + optionsPrice;

  useEffect(() => {
    if (!carId) return;
    let active = true;
    fetch(`${API_BASE_URL}/api/cars/${carId}`, {
      headers: { Accept: 'application/json' },
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<CarDetailsData>;
      })
      .then(data => {
        if (active) setCar({ ...data, galleryUrls: getCarImageUrls(data.galleryUrls) });
      })
      .catch(error => {
        console.error('Не вдалося завантажити автомобіль для заявки:', error);
        if (active) setCarError('Не вдалося завантажити авто. Поверніться до сторінки автомобіля та спробуйте ще раз.');
      });

    return () => { active = false; };
  }, [carId]);

  function updateContact(field: ContactField, value: string) {
    setContact(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: '' }));
    setSubmitMessage('');
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = Object.fromEntries(
      (Object.keys(FIELD_LABELS) as ContactField[]).map(field => [field, validateContact(field, contact[field])]),
    ) as Partial<Record<ContactField, string>>;
    setErrors(nextErrors);
    setConsentError(!hasAcceptedTerms);
    setSubmitMessage('');

    if (Object.values(nextErrors).some(Boolean) || !hasAcceptedTerms) return;
    if (carId && !car) {
      setSubmitMessage('Зачекайте, поки завантажаться дані автомобіля.');
      return;
    }

    if (!localStorage.getItem('accessToken')) {
      setSubmitMessage('Щоб надіслати заявку, увійдіть у свій акаунт.');
      openAuthModal();
      return;
    }

    setIsSubmitting(true);
    try {
      const application = await createOrder({
        carId: car?.id ?? null,
        vehicleName: carName,
        year: car?.year ?? null,
        imageUrl: image ?? '',
        color: isConfiguratorOrder ? selections.paint.name : '',
        selectedOptions: isConfiguratorOrder
          ? [selections.wheels.name, selections.interior.summary, selections.package.name]
          : [],
        totalPrice: total,
        paymentMethod,
        contactName: contact.name.trim(),
        contactPhone: contact.phone.trim(),
        contactEmail: contact.email.trim(),
        configurationData: isConfiguratorOrder ? configurationToSearch(configuration) : null,
      });
      navigate('/profile?tab=orders', { state: { createdApplicationId: String(application.id) } });
    } catch (error) {
      console.error('Не вдалося надіслати заявку:', error);
      if (error instanceof Error && error.message === 'Unauthorized') {
        setSubmitMessage('Сесія завершилася. Увійдіть у свій акаунт і надішліть заявку ще раз.');
        openAuthModal();
      } else {
        setSubmitMessage('Не вдалося надіслати заявку. Спробуйте ще раз пізніше.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const carName = car ? `${car.brand} ${car.modelName} ${car.trimName}` : MODEL_NAME;
  const image = car?.galleryUrls?.[0];

  return (
    <main className="checkout-page">
      <div className="checkout-layout">
          <form className="checkout-form" onSubmit={submitApplication} noValidate>
            <section aria-labelledby="checkout-contact-title">
              <h1 id="checkout-contact-title">Контактні дані</h1>
              <p className="checkout-subtitle">
                {contact.name || contact.email || contact.phone
                  ? 'Перевірте дані для зв’язку — їх заповнено з вашого профілю.'
                  : 'Вкажіть дані, за якими ми зможемо з вами зв’язатися.'}
              </p>
              {(Object.keys(FIELD_LABELS) as ContactField[]).map(field => (
                <div className="checkout-field" key={field}>
                  <label htmlFor={`checkout-${field}`}>{FIELD_LABELS[field]}</label>
                  <input
                    autoComplete={field === 'name' ? 'name' : field === 'phone' ? 'tel' : 'email'}
                    id={`checkout-${field}`}
                    name={field}
                    type={field === 'email' ? 'email' : 'text'}
                    inputMode={field === 'phone' ? 'tel' : undefined}
                    value={contact[field]}
                    aria-invalid={Boolean(errors[field])}
                    aria-describedby={errors[field] ? `checkout-${field}-error` : undefined}
                    onChange={event => updateContact(field, event.target.value)}
                  />
                  {errors[field] && <span className="checkout-error" id={`checkout-${field}-error`}>{errors[field]}</span>}
                </div>
              ))}
            </section>

            <fieldset className="checkout-payment">
              <legend>Спосіб оплати</legend>
              {([
                ['cash', 'Готівка'],
                ['leasing', 'Лізинг'],
                ['credit', 'Кредит'],
              ] as const).map(([value, label]) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                  />
                  {label}
                </label>
              ))}
            </fieldset>

            <div>
              <label className="checkout-consent">
                <input
                  type="checkbox"
                  checked={hasAcceptedTerms}
                  aria-invalid={consentError}
                  aria-describedby={consentError ? 'checkout-consent-error' : undefined}
                  onChange={event => {
                    setHasAcceptedTerms(event.target.checked);
                    if (event.target.checked) setConsentError(false);
                  }}
                />
                <span>Я погоджуюсь з умовами обробки персональних даних та правилами замовлення.</span>
              </label>
              {consentError && <p id="checkout-consent-error" className="checkout-error checkout-consent-error" role="alert">Підтвердіть згоду, щоб продовжити.</p>}
            </div>

            {submitMessage && <p className="checkout-message" role="status">{submitMessage}</p>}
            <button type="submit" className="checkout-primary checkout-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Надсилаємо заявку…' : 'Підтвердити та надіслати заявку'}
            </button>
          </form>

          <aside className="checkout-summary" aria-labelledby="checkout-summary-title">
            {image && <img className="checkout-car-image" src={image} alt={carName} />}
            <div className="checkout-summary-content">
              <h2 id="checkout-summary-title">Ваше замовлення</h2>
              <h3>{carName}</h3>
              {carError ? (
                <p className="checkout-error" role="alert">{carError}</p>
              ) : carId && !car ? (
                <p className="checkout-muted">Завантажуємо автомобіль…</p>
              ) : (
                <>
                  <dl className="checkout-price-lines">
                    <div><dt>Базова комплектація</dt><dd>{formatMoney(basePrice)}</dd></div>
                    <div><dt>Додаткове обладнання</dt><dd>{formatMoney(optionsPrice)}</dd></div>
                  </dl>
                  {isConfiguratorOrder && (
                    <dl className="checkout-options">
                      <div><dt>Колір кузова</dt><dd>{selections.paint.name}</dd></div>
                      <div><dt>Колісні диски</dt><dd>{selections.wheels.name}</dd></div>
                      <div><dt>Салон</dt><dd>{selections.interior.summary}</dd></div>
                      <div><dt>Пакет</dt><dd>{selections.package.name}</dd></div>
                    </dl>
                  )}
                  <div className="checkout-total"><strong>Разом</strong><strong>{formatMoney(total)}</strong></div>
                </>
              )}
            </div>
          </aside>
      </div>
    </main>
  );
}
