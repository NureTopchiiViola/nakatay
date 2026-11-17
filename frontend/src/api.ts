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