import { API_BASE_URL, getCarImageUrl } from '../../api';
import { normalizeConfiguration } from './configuration';

export interface CatalogOption {
  id: number;
  category: string;
  subCategory: string | null;
  name: string;
  priceModifier: number;
  isAvailable: boolean;
  optionGroup: string | null;
  visualCode: string | null;
  factoryDefault: boolean;
  requiredVisualCode: string | null;
}

export interface CatalogSession {
  trimId: number;
  title: string;
  basePrice: number;
  imageUrl: string | null;
  visualizerKey: string | null;
  options: CatalogOption[];
}

export async function fetchCatalogSession(trimId: string | null, signal: AbortSignal): Promise<CatalogSession> {
  if (trimId !== null && !/^[1-9]\d*$/.test(trimId)) throw new Error('Invalid trim ID');
  const query = trimId === null ? '' : `?trimId=${trimId}`;
  const response = await fetch(`${API_BASE_URL}/api/configurator/session${query}`, { signal });
  if (!response.ok) throw new Error(`Configurator session: ${response.status}`);
  const session: CatalogSession = await response.json();
  return { ...session, imageUrl: getCarImageUrl(session.imageUrl) };
}

export function factoryOptions(session: CatalogSession): CatalogOption[] {
  return session.options.filter(option => option.isAvailable && option.factoryDefault);
}

export function isExclusive(option: CatalogOption): boolean {
  return option.optionGroup !== null && option.optionGroup !== 'extra';
}

export function isCompatible(option: CatalogOption, selection: CatalogOption[]): boolean {
  return !option.requiredVisualCode || selection.some(item =>
    item.optionGroup === 'package' && item.visualCode === option.requiredVisualCode);
}

export function selectOption(selection: CatalogOption[], option: CatalogOption): CatalogOption[] {
  if (!option.isAvailable || !isCompatible(option, selection)) return selection;
  const next = isExclusive(option)
    ? [...selection.filter(item => item.optionGroup !== option.optionGroup), option]
    : selection.some(item => item.id === option.id)
      ? selection.filter(item => item.id !== option.id)
      : [...selection, option];
  return next.filter(item => isCompatible(item, next));
}

export function toVisualConfiguration(selection: CatalogOption[]) {
  return normalizeConfiguration({
    ...Object.fromEntries(selection.filter(option => isExclusive(option))
      .map(option => [option.optionGroup, option.visualCode])),
    extras: selection.filter(option => !isExclusive(option)).map(option => option.visualCode),
  });
}

export function optionsFromSearch(session: CatalogSession, params: URLSearchParams): CatalogOption[] {
  if (params.get('configured') !== '1') {
    const defaults = factoryOptions(session);
    if (session.visualizerKey !== 'bmw-e46') return defaults;
    const legacy = session.options.filter(option => option.visualCode && (
      isExclusive(option) ? params.get(option.optionGroup!) === option.visualCode
        : params.getAll('extra').includes(option.visualCode)));
    return [...legacy.filter(isExclusive), ...legacy.filter(option => !isExclusive(option))]
      .reduce(selectOption, defaults);
  }
  const ids = params.getAll('option');
  const selections = session.options.filter(option => option.isAvailable && ids.includes(String(option.id)));
  if (selections.length !== ids.length
      || selections.some(option => !isCompatible(option, selections))
      || new Set(selections.filter(isExclusive).map(option => option.optionGroup)).size !== selections.filter(isExclusive).length
      || factoryOptions(session).some(factory => isExclusive(factory)
        && !selections.some(option => option.optionGroup === factory.optionGroup))) {
    throw new Error('Invalid configuration options');
  }
  return selections;
}

export function catalogSearch(trimId: number, options: CatalogOption[]): string {
  const params = new URLSearchParams({ carId: String(trimId), configured: '1' });
  options.forEach(option => params.append('option', String(option.id)));
  return params.toString();
}

export async function verifyCatalogPrice(trimId: number, selection: CatalogOption[], signal: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/api/configurator/calculate`, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ carTrimId: trimId, selectedOptionIds: selection.map(option => option.id) }),
  });
  if (!response.ok) throw new Error(`Configurator price: ${response.status}`);
  return response.json() as Promise<{ basePrice: number; optionsCost: number; totalPrice: number }>;
}
