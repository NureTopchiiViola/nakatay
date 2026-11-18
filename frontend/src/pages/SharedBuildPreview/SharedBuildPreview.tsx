import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL, getCarImageUrls } from '../../api';
import { Button } from '../../components/ui/Button';
import type { CarDetailsData } from '../../types/Car';
import {
  configurationToSearch,
  EXTRAS,
  formatMoney,
  getQuote,
  getSelections,
  MODEL_NAME,
} from '../Configurator/configuration';
import type { Configuration } from '../Configurator/configuration';
import './SharedBuildPreview.css';

interface SharedBuildPreviewProps {
  configuration: Configuration;
  onEdit: () => void;
}

export function SharedBuildPreview({
  configuration,
  onEdit,
}: SharedBuildPreviewProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const carId = searchParams.get('carId');

  const [imageUrl, setImageUrl] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);

  const selections = getSelections(configuration);
  const quote = getQuote(configuration);
  const selectedExtras = EXTRAS.filter((extra) =>
    configuration.extras.includes(extra.id)
  );

  useEffect(() => {
    let active = true;
    setIsImageLoading(true);

    const endpoint = carId
      ? `${API_BASE_URL}/api/cars/${carId}`
      : `${API_BASE_URL}/api/cars`;

    fetch(endpoint, { headers: { Accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: CarDetailsData | CarDetailsData[]) => {
        if (!active) return;

        const matchedCar = Array.isArray(data)
          ? data.find((c) =>
              MODEL_NAME.toLowerCase().includes(c.modelName.toLowerCase())
            ) ?? data[0]
          : data;

        const urls = getCarImageUrls(matchedCar?.galleryUrls ?? []);
        if (urls[0]) setImageUrl(urls[0]);
      })
      .catch((err) => {
        console.error('Не вдалося завантажити фото моделі:', err);
      })
      .finally(() => {
        if (active) setIsImageLoading(false);
      });

    return () => {
      active = false;
    };
  }, [carId]);

  const handleOrder = () => {
    const params = new URLSearchParams(configurationToSearch(configuration));
    if (carId) params.set('carId', carId);
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <main className="shared-build-page">
      <div className="shared-build-container">
        <h1 className="shared-build-title">Збірка користувача</h1>

        <div className="shared-build-grid">
          <div className="shared-build-media">
            {imageUrl ? (
              <img src={imageUrl} alt={MODEL_NAME} />
            ) : (
              <span className="shared-build-media-placeholder">
                {isImageLoading ? 'Завантаження фото…' : MODEL_NAME}
              </span>
            )}
          </div>

          <aside className="shared-build-card">
            <span className="shared-build-subtitle">Обрана конфігурація</span>
            <hr className="shared-build-divider" />

            <h2 className="shared-build-model">{MODEL_NAME}</h2>
            <p className="shared-build-specs-caption">Характеристики та вибрані опції</p>

            <dl className="shared-build-specs">
              <div>
                <dt>Колір кузова</dt>
                <dd>{selections.paint.name}</dd>
              </div>
              <div>
                <dt>Колісні диски</dt>
                <dd>{selections.wheels.name}</dd>
              </div>
              <div>
                <dt>Інтер’єр</dt>
                <dd>{selections.interior.name}</dd>
              </div>
              <div>
                <dt>Оздоблення салону</dt>
                <dd>{selections.decor.name}</dd>
              </div>
              <div>
                <dt>Пакет опцій</dt>
                <dd>{selections.package.name}</dd>
              </div>
              {selectedExtras.length > 0 && (
                <div>
                  <dt>Додатково</dt>
                  <dd>{selectedExtras.map((extra) => extra.name).join(', ')}</dd>
                </div>
              )}
            </dl>

            <hr className="shared-build-divider" />

            <div className="shared-build-total">
              <span>Підсумкова вартість:</span>
              <strong>{formatMoney(quote.total)}</strong>
            </div>

            <div className="shared-build-actions">
              <Button variant="outline" onClick={onEdit}>
                Редагувати збірку
              </Button>
              <Button variant="solid" onClick={handleOrder}>
                Оформити заявку ›
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}