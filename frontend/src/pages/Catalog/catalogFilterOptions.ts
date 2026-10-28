export type CatalogFilterKey = 'brands' | 'models' | 'transmissions' | 'bodyTypes';
export type CatalogFilters = Record<CatalogFilterKey, string[]>;
export type CatalogRange = [number, number];

export const PRICE_MIN = 0;
export const PRICE_MAX = 200_000;
export const YEAR_MIN = 2000;
export const YEAR_MAX = new Date().getFullYear();


export const BRAND_MODELS_MAP: Record<string, (readonly [string, string])[]> = {
  'Toyota': [['RAV4', 'RAV4'], ['Corolla', 'Corolla'], ['Prius', 'Prius'], ['Land Cruiser', 'Land Cruiser']],
  'Honda': [['Civic', 'Civic'], ['CR-V', 'CR-V'], ['Accord', 'Accord'], ['HR-V', 'HR-V']],
  'Mazda': [['Mazda3', 'Mazda3'], ['CX-5', 'CX-5'], ['CX-90', 'CX-90']],
  'Subaru': [['Outback', 'Outback'], ['Forester', 'Forester'], ['Impreza', 'Impreza']],
  'Hyundai': [['Tucson', 'Tucson'], ['Santa Fe', 'Santa Fe'], ['Ioniq 5', 'Ioniq 5'], ['Elantra', 'Elantra']],
  'Kia': [['Sportage', 'Sportage'], ['Telluride', 'Telluride'], ['EV6', 'EV6'], ['K5', 'K5']],
  'Volkswagen': [['Golf GTI', 'Golf GTI'], ['Tiguan', 'Tiguan'], ['ID.4', 'ID.4'], ['Jetta', 'Jetta']],
  'Ford': [['Mustang', 'Mustang'], ['Bronco', 'Bronco'], ['Explorer', 'Explorer'], ['Maverick', 'Maverick']],
  'Chevrolet': [['Equinox', 'Equinox'], ['Blazer', 'Blazer'], ['Colorado', 'Colorado'], ['Corvette', 'Corvette']],
  'Nissan': [['Rogue', 'Rogue'], ['Altima', 'Altima'], ['Pathfinder', 'Pathfinder'], ['Z', 'Z']],
  'Lexus': [['RX', 'RX'], ['NX', 'NX'], ['ES', 'ES'], ['IS', 'IS']],
  'Volvo': [['XC60', 'XC60'], ['XC90', 'XC90'], ['S60', 'S60']],
  'BMW': [['3 Series', '3 Series'], ['X3', 'X3']],
  'Audi': [['A5', 'A5'], ['Q5', 'Q5']],
  'Porsche': [['Macan', 'Macan']],
};

export const FILTER_GROUPS = [
  {
    key: 'brands',
    title: 'Виробник',
    options: [
      ['Toyota', 'Toyota'], ['Hyundai', 'Hyundai'], ['Porsche', 'Porsche'],
      ['Audi', 'Audi'], ['Volkswagen', 'Volkswagen'], ['Ford', 'Ford'],
      ['BMW', 'BMW'], ['Honda', 'Honda'], ['Chevrolet', 'Chevrolet'],
      ['Mazda', 'Mazda'], ['Kia', 'Kia'], ['Lexus', 'Lexus'],
      ['Volvo', 'Volvo'], ['Nissan', 'Nissan'], ['Subaru', 'Subaru'],
    ],
  },
  {
    key: 'models',
    title: 'Модель',
    options: [],
  },
  {
    key: 'transmissions',
    title: 'Трансмісія',
    options: [
      ['AUTOMATIC', 'Автомат'], ['MANUAL', 'Механічна'], ['CVT', 'Варіатор'],
      ['DCT', 'Роботизована'], ['PDK (AUTOMATIC)', 'PDK'],
    ],
  },
  {
    key: 'bodyTypes',
    title: 'Тип кузова',
    options: [
      ['SEDAN', 'Седан'], ['COUPE', 'Купе'], ['WAGON', 'Універсал'],
      ['HATCHBACK', 'Хетчбек'], ['SUV', 'Позашляховик'], ['PICKUP', 'Пікап'],
    ],
  },
] as const;

export const EMPTY_CATALOG_FILTERS: CatalogFilters = {
  brands: [],
  models: [],
  transmissions: [],
  bodyTypes: [],
};