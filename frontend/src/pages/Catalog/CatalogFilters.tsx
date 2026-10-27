import { RangeFilter } from './RangeFilter';
import {
  FILTER_GROUPS,
  PRICE_MAX,
  PRICE_MIN,
  YEAR_MAX,
  YEAR_MIN,
  type CatalogFilterKey,
  type CatalogFilters,
  type CatalogRange,
} from './catalogFilterOptions';

type CatalogFilterOption = readonly [string, string];

interface CatalogFiltersProps {
  filters: CatalogFilters;
  priceRange: CatalogRange;
  yearRange: CatalogRange;
  isVisible: boolean;
  hasActiveFilters: boolean;
  onToggleFilter: (key: CatalogFilterKey, value: string) => void;
  onReset: () => void;
  onPriceRangeChange: (range: CatalogRange) => void;
  onYearRangeChange: (range: CatalogRange) => void;
}

export function CatalogFiltersPanel({
  filters,
  priceRange,
  yearRange,
  isVisible,
  hasActiveFilters,
  onToggleFilter,
  onReset,
  onPriceRangeChange,
  onYearRangeChange,
}: CatalogFiltersProps) {
  return (
    <aside id="catalog-filters" className="catalog-filters" aria-label="Фільтри каталогу" hidden={!isVisible}>
      <div className="catalog-filters-heading">
        <h2>Фільтри</h2>
        <button type="button" disabled={!hasActiveFilters} onClick={onReset}>
          Скинути фільтри
        </button>
      </div>
      {FILTER_GROUPS.map((group) => (
        <details className="catalog-filter-group" key={group.key} open>
          <summary>{group.title}</summary>
          <div className="catalog-filter-options">
            {(group.options as readonly CatalogFilterOption[]).map(([value, label]) => {
              const checked = filters[group.key].includes(value);
              return (
                <label className={`catalog-filter-chip ${checked ? 'selected' : ''}`} key={value}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleFilter(group.key, value)}
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </details>
      ))}
      <RangeFilter
        id="catalog-price"
        label="Ціна"
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={1_000}
        lowerValue={priceRange[0]}
        upperValue={priceRange[1]}
        formatValue={(value) => `${new Intl.NumberFormat('uk-UA').format(value)} ₴`}
        onChange={(lower, upper) => onPriceRangeChange([lower, upper])}
      />
      <RangeFilter
        id="catalog-year"
        label="Рік випуску"
        min={YEAR_MIN}
        max={YEAR_MAX}
        step={1}
        lowerValue={yearRange[0]}
        upperValue={yearRange[1]}
        formatValue={(value) => String(value)}
        onChange={(lower, upper) => onYearRangeChange([lower, upper])}
      />
    </aside>
  );
}
