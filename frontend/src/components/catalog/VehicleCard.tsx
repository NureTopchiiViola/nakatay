import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineBalance, MdDirectionsCarFilled } from 'react-icons/md';
import balanceCheckIcon from '../../assets/BalanceCheck.svg';
import localGasStationIcon from '../../assets/local_gas_station.svg';
import autoTransmissionIcon from '../../assets/auto_transmission.svg';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import './VehicleCard.css';
import { useCarComparison } from '../../context/CarComparisonContext';

export interface VehicleCardProps {
  id: number;
  imageSrc: string;
  title: string;
  year: string | number;
  engine: string;
  transmission: string;
  price: string;
}

export function VehicleCard({
  id,
  imageSrc,
  title,
  year,
  engine,
  transmission,
  price
}: VehicleCardProps) {
  
  const { toggleCompare, isInComparison } = useCarComparison();
  const currentlyCompared = isInComparison(id);
  const [failedImageSrc, setFailedImageSrc] = useState('');
  const imageFailed = imageSrc === failedImageSrc;

  return (
    <article className="vehicle-card">
      <Link 
        to={`/cars/${id}`} 
        className={`vehicle-card-image-wrapper ${imageFailed ? 'image-failed' : ''}`}
        style={{ display: 'block', textDecoration: 'none' }}
      >
        {imageSrc && !imageFailed
          ? <img src={imageSrc} alt={title} className="vehicle-card-image" onError={() => setFailedImageSrc(imageSrc)} />
          : <MdDirectionsCarFilled className="vehicle-card-image-placeholder" aria-hidden="true" />}
      </Link>

      <div className="vehicle-card-body">
        <header className="vehicle-card-header">
          <div className="vehicle-card-title-group">
            <Link to={`/cars/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3 className="vehicle-card-title">{title}</h3>
            </Link>
            <span className="vehicle-card-year">{year}</span>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => toggleCompare(id)}
            aria-label={currentlyCompared ? "Видалити з порівняння" : "Додати до порівняння"}
            iconLeft={currentlyCompared ? <img src={balanceCheckIcon} alt="" /> : <MdOutlineBalance />} 
          />
        </header>

        <div className="vehicle-card-tags">
          <Tag variant="solid" iconLeft={<img src={localGasStationIcon} alt="" />}>
            {engine}
          </Tag>
          <Tag variant="solid" iconLeft={<img src={autoTransmissionIcon} alt="" />}>
            {transmission}
          </Tag>
        </div>

        <div className="vehicle-card-price">{price}</div>

        <Link className="btn btn-outline vehicle-card-action" to={`/cars/${id}`}>
          Замовити авто
        </Link>
      </div>
    </article>
  );
}