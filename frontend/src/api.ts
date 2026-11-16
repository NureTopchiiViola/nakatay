export const API_BASE_URL = 'https://nakatay-backend-api-a91c65d785b6.herokuapp.com';

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