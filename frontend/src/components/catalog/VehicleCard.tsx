import { useState } from 'react';
import { MdOutlineEvStation, MdOutlineSettings, MdOutlineBalance } from 'react-icons/md';
import balanceCheckIcon from '../../assets/BalanceCheck.svg'; // Your custom icon
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import './VehicleCard.css';

export interface VehicleCardProps {
  imageSrc: string;
  title: string;
  year: string | number;
  engine: string;
  transmission: string;
  price: string;
}

export function VehicleCard({
  imageSrc,
  title,
  year,
  engine,
  transmission,
  price
}: VehicleCardProps) {
  const [isCompared, setIsCompared] = useState(false);

  return (
    <article className="vehicle-card">
      <div className="vehicle-card-image-wrapper">
        <img src={imageSrc} alt={title} className="vehicle-card-image" />
      </div>

      <div className="vehicle-card-body">
        <header className="vehicle-card-header">
          <div className="vehicle-card-title-group">
            <h3 className="vehicle-card-title">{title}</h3>
            <span className="vehicle-card-year">{year}</span>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => setIsCompared(!isCompared)}
            aria-label={isCompared ? "Видалити з порівняння" : "Додати до порівняння"}
            iconLeft={
              isCompared ? (
                <img src={balanceCheckIcon} alt="" />
              ) : (
                <MdOutlineBalance />
              )
            } 
          />
        </header>

        <div className="vehicle-card-tags">
          <Tag variant="solid" iconLeft={<MdOutlineEvStation />}>
            {engine}
          </Tag>
          <Tag variant="solid" iconLeft={<MdOutlineSettings />}>
            {transmission}
          </Tag>
        </div>

        <div className="vehicle-card-price">{price}</div>

        <Button variant="outline" className="vehicle-card-action">
          Замовити авто
        </Button>
      </div>
    </article>
  );
}
