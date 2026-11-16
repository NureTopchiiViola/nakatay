export const API_BASE_URL = 'https://nakatay-backend-api-a91c65d785b6.herokuapp.com';

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

  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
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

  return response.json();
}