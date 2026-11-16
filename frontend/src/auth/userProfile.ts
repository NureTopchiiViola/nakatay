export interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

export function getUserProfile(token: string): UserProfile {
  try {
    const payload = token.split('.')[1];
    if (!payload) return { name: '', email: '', phone: '' };

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(window.atob(normalized)) as Record<string, unknown>;
    const name = typeof claims.name === 'string'
      ? claims.name
      : [claims.given_name, claims.family_name].filter(value => typeof value === 'string').join(' ');

    return {
      name,
      email: typeof claims.email === 'string' ? claims.email : '',
      phone: typeof claims.phone_number === 'string' ? claims.phone_number : '',
    };
  } catch {
    return { name: '', email: '', phone: '' };
  }
}
