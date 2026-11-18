import type { Configuration } from './pages/Configurator/configuration';

export const API_BASE_URL = 'https://nakatay-backend-api-a91c65d785b6.herokuapp.com';

export interface FavoriteCar {
  id: number;
  imageSrc: string;
  title: string;
  year: string | number;
  engine: string;
  transmission: string;
  price: string;
}

interface FavoriteCarResponse {
  trimId: number;
  title: string;
  year: number;
  engine: string;
  transmission: string;
  price: number;
  imageUrl: string | null;
}

export function getCarImageUrl(url: string | null | undefined): string {
  if (!url) return '';

  const imageUrl = new URL(url, API_BASE_URL);
  if (imageUrl.hostname === 'example.com' || imageUrl.hostname.endsWith('.example.com')) {
    return '';
  }
  return imageUrl.href;
}

export function getCarImageUrls(urls: string[] | null | undefined): string[] {
  return (urls ?? []).map(getCarImageUrl).filter(Boolean);
}

export function formatCarPrice(value: number): string {
  return `${new Intl.NumberFormat('uk-UA').format(value)} ₴`;
}

export function formatTransmission(value: string): string {
  if (value === 'AUTOMATIC') return 'Автомат';
  if (value.startsWith('CVT')) return 'CVT';
  if (value.startsWith('PDK')) return 'PDK';
  return value;
}

function getAccessToken(): string {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Unauthorized');
  return token;
}

async function requestFavoriteCars(
  userId: string,
  trimId: number,
  method: 'PUT' | 'DELETE',
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/favorites/${trimId}`, {
    method,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      Accept: 'application/json',
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    throw new Error(`Favorite request failed: ${response.status}`);
  }
}

export async function fetchFavoriteCars(
  userId: string,
  signal?: AbortSignal,
): Promise<FavoriteCar[]> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/favorites`, {
    signal,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      Accept: 'application/json',
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    throw new Error(`Favorite request failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isFavoriteCarResponse)) {
    throw new Error('The favorites endpoint returned an invalid response.');
  }

  return data.map((car) => ({
    id: car.trimId,
    imageSrc: getCarImageUrl(car.imageUrl),
    title: car.title,
    year: car.year,
    engine: car.engine,
    transmission: formatTransmission(car.transmission),
    price: formatCarPrice(car.price),
  }));
}

export function addFavoriteCar(userId: string, trimId: number): Promise<void> {
  return requestFavoriteCars(userId, trimId, 'PUT');
}

export function removeFavoriteCar(userId: string, trimId: number): Promise<void> {
  return requestFavoriteCars(userId, trimId, 'DELETE');
}

export interface SavedCustomBuild {
  id: number;
  modelName: string;
  configuration: Configuration;
  createdAt: string;
}

export interface SharedCustomBuild {
  shareCode: string;
  url: string;
  modelName: string;
  configuration: Configuration;
  createdAt: string;
}

export async function saveCustomBuild(
  modelName: string,
  configuration: Configuration,
): Promise<SavedCustomBuild> {
  const response = await fetch(`${API_BASE_URL}/api/configurator/custom-builds`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ modelName, configuration }),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    throw new Error(`Custom build request failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!isSavedCustomBuild(data)) {
    throw new Error('The custom build endpoint returned an invalid response.');
  }
  return data;
}

export async function updateCustomBuild(
  buildId: number,
  modelName: string,
  configuration: Configuration,
): Promise<SavedCustomBuild> {
  const response = await fetch(`${API_BASE_URL}/api/configurator/custom-builds/${buildId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ modelName, configuration }),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    throw new Error(`Custom build request failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!isSavedCustomBuild(data)) {
    throw new Error('The custom build endpoint returned an invalid response.');
  }
  return data;
}

export async function fetchCustomBuilds(signal?: AbortSignal): Promise<SavedCustomBuild[]> {
  const response = await fetch(`${API_BASE_URL}/api/configurator/custom-builds`, {
    signal,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      Accept: 'application/json',
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    throw new Error(`Custom build request failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isSavedCustomBuild)) {
    throw new Error('The custom builds endpoint returned an invalid response.');
  }
  return data;
}

export async function deleteCustomBuild(buildId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/configurator/custom-builds/${buildId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      Accept: 'application/json',
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    throw new Error(`Custom build delete failed: ${response.status}`);
  }
}

export async function createPublicCustomBuildShare(
  modelName: string,
  configuration: Configuration,
  signal?: AbortSignal,
): Promise<SharedCustomBuild> {
  const response = await fetch(`${API_BASE_URL}/api/configurator/custom-builds/share`, {
    method: 'POST',
    signal,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ modelName, configuration }),
  });

  if (!response.ok) {
    throw new Error(`Public custom build request failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!isSharedCustomBuild(data)) {
    throw new Error('The public custom build endpoint returned an invalid response.');
  }
  return data;
}

export async function fetchPublicCustomBuildShare(
  shareCode: string,
  signal?: AbortSignal,
): Promise<SharedCustomBuild> {
  const response = await fetch(
    `${API_BASE_URL}/api/configurator/custom-builds/share/${encodeURIComponent(shareCode)}`,
    {
      signal,
      headers: { Accept: 'application/json' },
    },
  );

  if (!response.ok) {
    throw new Error(`Public custom build request failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!isSharedCustomBuild(data)) {
    throw new Error('The public custom build endpoint returned an invalid response.');
  }
  return data;
}

function isSavedCustomBuild(value: unknown): value is SavedCustomBuild {
  if (!value || typeof value !== 'object') return false;
  const build = value as Record<string, unknown>;
  return Number.isSafeInteger(build.id)
    && typeof build.modelName === 'string'
    && typeof build.createdAt === 'string'
    && isConfiguration(build.configuration);
}

function isSharedCustomBuild(value: unknown): value is SharedCustomBuild {
  if (!value || typeof value !== 'object') return false;
  const build = value as Record<string, unknown>;
  return typeof build.shareCode === 'string'
    && build.shareCode.length > 0
    && typeof build.url === 'string'
    && build.url.startsWith('/create?shareCode=')
    && typeof build.modelName === 'string'
    && typeof build.createdAt === 'string'
    && isConfiguration(build.configuration);
}

function isConfiguration(value: unknown): value is Configuration {
  if (!value || typeof value !== 'object') return false;
  const configuration = value as Record<string, unknown>;
  return ['graphite', 'titanium', 'sapphire', 'crimson', 'obsidian'].includes(String(configuration.paint))
    && ['alloy', 'forged', 'carbon'].includes(String(configuration.wheels))
    && ['black', 'cognac', 'ivory'].includes(String(configuration.interior))
    && ['carbon', 'wood'].includes(String(configuration.decor))
    && ['standard', 'comfort', 'sport'].includes(String(configuration.package))
    && Array.isArray(configuration.extras)
    && configuration.extras.every(extra => ['spoiler', 'matrix', 'night', 'recorder'].includes(String(extra)));
}

function isFavoriteCarResponse(value: unknown): value is FavoriteCarResponse {
  if (!value || typeof value !== 'object') return false;
  const car = value as Record<string, unknown>;
  return Number.isSafeInteger(car.trimId)
    && typeof car.title === 'string'
    && typeof car.year === 'number'
    && typeof car.engine === 'string'
    && typeof car.transmission === 'string'
    && typeof car.price === 'number'
    && (typeof car.imageUrl === 'string' || car.imageUrl === null);
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export type OrderStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';
export type OrderPaymentMethod = 'cash' | 'leasing' | 'credit';

export interface CustomerOrder {
  id: number;
  createdAt: string;
  carId: number | null;
  vehicleName: string;
  year: number | null;
  imageUrl: string | null;
  color: string | null;
  selectedOptions: string[];
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: OrderPaymentMethod | null;
  configurationData: string | null;
  contact: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
}

export interface CreateOrderRequest {
  carId: number | null;
  vehicleName: string;
  year: number | null;
  imageUrl: string;
  color: string;
  selectedOptions: string[];
  totalPrice: number;
  paymentMethod: OrderPaymentMethod;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  configurationData: string | null;
}

export async function createOrder(order: CreateOrderRequest): Promise<CustomerOrder> {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    throw new Error(`Order request failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!isCustomerOrder(data)) {
    throw new Error('The orders endpoint returned an invalid response.');
  }
  return data;
}

export async function fetchOrders(signal?: AbortSignal): Promise<CustomerOrder[]> {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    signal,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      Accept: 'application/json',
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    throw new Error(`Order request failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isCustomerOrder)) {
    throw new Error('The orders endpoint returned an invalid response.');
  }
  return data;
}

function isCustomerOrder(value: unknown): value is CustomerOrder {
  if (!value || typeof value !== 'object') return false;
  const order = value as Record<string, unknown>;
  const contact = order.contact;
  return Number.isSafeInteger(order.id)
    && typeof order.createdAt === 'string'
    && (typeof order.carId === 'number' || order.carId === null)
    && typeof order.vehicleName === 'string'
    && (typeof order.year === 'number' || order.year === null)
    && (typeof order.imageUrl === 'string' || order.imageUrl === null)
    && (typeof order.color === 'string' || order.color === null)
    && Array.isArray(order.selectedOptions)
    && order.selectedOptions.every(option => typeof option === 'string')
    && typeof order.totalPrice === 'number'
    && ['new', 'in_progress', 'completed', 'cancelled'].includes(String(order.status))
    && (['cash', 'leasing', 'credit'].includes(String(order.paymentMethod)) || order.paymentMethod === null)
    && (typeof order.configurationData === 'string' || order.configurationData === null)
    && typeof contact === 'object'
    && contact !== null
    && ['name', 'phone', 'email'].every(field =>
      typeof (contact as Record<string, unknown>)[field] === 'string'
      || (contact as Record<string, unknown>)[field] === null,
    );
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No access token');
  }

  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  const profile = await response.json() as {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: string;
  };

  return {
    id: String(profile.id),
    name: [profile.firstName, profile.lastName].filter(Boolean).join(' '),
    email: profile.email,
    phone: profile.phone ?? undefined,
    role: profile.role,
  };
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<CustomerOrder> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    throw new Error(`Failed to update order status: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!isCustomerOrder(data)) {
    throw new Error('The order status endpoint returned an invalid response.');
  }
  return data;
}