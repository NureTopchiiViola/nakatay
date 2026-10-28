export const BASE_PRICE = 1_850_000;
export const MODEL_NAME = 'BMW E46 328i Sport · 1999';

export const PAINTS = [
  { id: 'graphite', name: 'Graphite Metallic', shortName: 'Graphite', color: '#53565f', price: 0 },
  { id: 'titanium', name: 'Titanium Silver', shortName: 'Titanium', color: '#c8c6bb', price: 0 },
  { id: 'sapphire', name: 'Sapphire Blue', shortName: 'Sapphire', color: '#233e63', price: 0 },
  { id: 'crimson', name: 'Crimson Red', shortName: 'Crimson', color: '#a82036', price: 0 },
  { id: 'obsidian', name: 'Obsidian Black', shortName: 'Obsidian', color: '#191a1e', price: 0 },
] as const;

export const WHEELS = [
  { id: 'alloy', name: '19″ Sport Alloy', description: 'Легкосплавні диски з темним покриттям', price: 0 },
  { id: 'forged', name: '20″ Forged Performance', description: 'Ковані диски з алмазним шліфуванням', price: 48_000 },
  { id: 'carbon', name: '21″ Carbon Aeromesh', description: 'Вуглепластикові карбонові вставки', price: 85_000 },
] as const;

export const INTERIORS = [
  { id: 'black', name: 'Шкіра Nappa Black', summary: 'Nappa Black Leather', description: 'Класичний чорний салон із бежевим швом', color: '#242424', price: 0 },
  { id: 'cognac', name: 'Коньячна перфорована шкіра', summary: 'Cognac Leather', description: 'Комбінація з преміальною алькантарою', color: '#a5632f', price: 38_000 },
  { id: 'ivory', name: 'Світла шкіра Ivory White', summary: 'Ivory White Leather', description: 'Елегантне світле оздоблення', color: '#e8e3d7', price: 52_000 },
] as const;

export const DECORS = [
  { id: 'carbon', name: 'Матовий карбон', description: 'Стандарт', price: 0 },
  { id: 'wood', name: 'Натуральне дерево', description: '+18 000 ₴', price: 18_000 },
] as const;

export const PACKAGES = [
  { id: 'standard', name: 'Standard', price: 0, features: ['Базовий круїз-контроль', 'Акустика 8 динаміків', 'Клімат-контроль 2 зони'] },
  { id: 'comfort', name: 'Comfort & Tech', price: 95_000, features: ['Вентиляція та масаж передніх сидінь', 'Преміальна акустика Burmester 3D (16 динаміків)', 'Проєкційний дисплей на лобове скло (HUD)'] },
  { id: 'sport', name: 'Sport Track Pro', price: 145_000, features: ['Адаптивна пневмопідвіска з регулюванням жорсткості', 'Спортивна вихлопна система з регулюванням клапанів', 'Керамічна гальмівна система'] },
] as const;

export const EXTRAS = [
  { id: 'spoiler', name: 'Карбоновий спойлер GT', description: 'Доступний із пакетом Sport Track Pro', price: 32_000, section: 'exterior', available: true },
  { id: 'matrix', name: 'Матричні світлодіодні фари Matrix LED', description: 'Адаптивне освітлення дороги', price: 54_000, section: 'exterior', available: true },
  { id: 'roof', name: 'Панорамний скляний дах', description: 'Недоступно для BMW E46', price: 45_000, section: 'options', available: false },
  { id: 'night', name: 'Система нічного бачення (Night Vision)', description: 'Камера та демонстраційний екран у салоні', price: 62_000, section: 'options', available: true },
  { id: 'recorder', name: 'Вбудований 4K відеореєстратор', description: '3D-макет передньої та задньої камер', price: 15_000, section: 'options', available: true },
] as const;

export type ExtraId = typeof EXTRAS[number]['id'];
export interface Configuration {
  paint: typeof PAINTS[number]['id'];
  wheels: typeof WHEELS[number]['id'];
  interior: typeof INTERIORS[number]['id'];
  decor: typeof DECORS[number]['id'];
  package: typeof PACKAGES[number]['id'];
  extras: ExtraId[];
}

export const DEFAULT_CONFIGURATION: Configuration = {
  paint: 'crimson', wheels: 'alloy', interior: 'black', decor: 'carbon', package: 'standard', extras: [],
};

export function normalizeConfiguration(value: unknown): Configuration {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const pick = <T extends string>(items: readonly { id: T }[], candidate: unknown, fallback: T): T =>
    items.find(item => item.id === candidate)?.id ?? fallback;
  const selectedPackage = pick(PACKAGES, source.package, DEFAULT_CONFIGURATION.package);
  const extras = EXTRAS.filter(item => item.available && Array.isArray(source.extras) && source.extras.includes(item.id))
    .filter(item => item.id !== 'spoiler' || selectedPackage === 'sport').map(item => item.id);
  return {
    paint: pick(PAINTS, source.paint, DEFAULT_CONFIGURATION.paint),
    wheels: pick(WHEELS, source.wheels, DEFAULT_CONFIGURATION.wheels),
    interior: pick(INTERIORS, source.interior, DEFAULT_CONFIGURATION.interior),
    decor: pick(DECORS, source.decor, DEFAULT_CONFIGURATION.decor),
    package: selectedPackage,
    extras,
  };
}

export function getSelections(configuration: Configuration) {
  return {
    paint: PAINTS.find(item => item.id === configuration.paint) ?? PAINTS[0],
    wheels: WHEELS.find(item => item.id === configuration.wheels) ?? WHEELS[0],
    interior: INTERIORS.find(item => item.id === configuration.interior) ?? INTERIORS[0],
    decor: DECORS.find(item => item.id === configuration.decor) ?? DECORS[0],
    package: PACKAGES.find(item => item.id === configuration.package) ?? PACKAGES[0],
  };
}

export function getQuote(configuration: Configuration) {
  const config = normalizeConfiguration(configuration);
  const selected = getSelections(config);
  const lines = [
    ...Object.values(selected).filter(item => item.price > 0),
    ...EXTRAS.filter(item => config.extras.includes(item.id)),
  ].map(item => ({ name: item.name, price: item.price }));
  const optionsPrice = lines.reduce((sum, line) => sum + line.price, 0);
  return { basePrice: BASE_PRICE, optionsPrice, total: BASE_PRICE + optionsPrice, lines };
}

export function configurationFromSearch(search: string): Configuration {
  const params = new URLSearchParams(search);
  return normalizeConfiguration({
    paint: params.get('paint'), wheels: params.get('wheels'), interior: params.get('interior'),
    decor: params.get('decor'), package: params.get('package'), extras: params.getAll('extra'),
  });
}

export function configurationToSearch(configuration: Configuration): string {
  const { extras, ...selections } = normalizeConfiguration(configuration);
  const params = new URLSearchParams(selections);
  extras.forEach(extra => params.append('extra', extra));
  return params.toString();
}

export const formatMoney = (value: number) => `${new Intl.NumberFormat('uk-UA').format(value)} ₴`;
