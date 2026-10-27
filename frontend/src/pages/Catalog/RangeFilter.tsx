import './RangeFilter.css';

interface RangeFilterProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  lowerValue: number;
  upperValue: number;
  formatValue: (value: number) => string;
  onChange: (lowerValue: number, upperValue: number) => void;
}

export function RangeFilter({
  id,
  label,
  min,
  max,
  step,
  lowerValue,
  upperValue,
  formatValue,
  onChange,
}: RangeFilterProps) {
  const range = max - min;
  const lowerPosition = ((lowerValue - min) / range) * 100;
  const upperPosition = ((upperValue - min) / range) * 100;

  return (
    <fieldset className="range-filter">
      <legend>{label}</legend>
      <div className="range-filter-values" aria-live="polite">
        <output htmlFor={`${id}-min`}>{formatValue(lowerValue)}</output>
        <output htmlFor={`${id}-max`}>{formatValue(upperValue)}</output>
      </div>
      <div
        className="range-filter-slider"
        style={{
          '--range-start': `${lowerPosition}%`,
          '--range-end': `${upperPosition}%`,
        } as React.CSSProperties}
      >
        <div className="range-filter-track" aria-hidden="true" />
        <div className="range-filter-selected-track" aria-hidden="true" />
        <input
          id={`${id}-min`}
          aria-label={`Мінімальне значення: ${label}`}
          className="range-filter-input range-filter-input-lower"
          type="range"
          min={min}
          max={max}
          step={step}
          value={lowerValue}
          style={{ zIndex: lowerValue >= max - step ? 5 : 3 }}
          onChange={(event) => {
            const value = Math.min(Number(event.target.value), upperValue - step);
            onChange(Math.max(min, value), upperValue);
          }}
        />
        <input
          id={`${id}-max`}
          aria-label={`Максимальне значення: ${label}`}
          className="range-filter-input range-filter-input-upper"
          type="range"
          min={min}
          max={max}
          step={step}
          value={upperValue}
          style={{ zIndex: upperValue <= min + step ? 5 : 4 }}
          onChange={(event) => {
            const value = Math.max(Number(event.target.value), lowerValue + step);
            onChange(lowerValue, Math.min(max, value));
          }}
        />
      </div>
    </fieldset>
  );
}
