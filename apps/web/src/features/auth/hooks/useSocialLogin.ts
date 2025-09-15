export function buildSocialLoginUrl(provider: 'google' | 'facebook' | 'instagram'): string {
  const base = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api/v1';
  const trimmed = base.replace(/\/+$/, '');
  return `${trimmed}/auth/${provider}`;
}

export function redirectToSocial(provider: 'google' | 'facebook' | 'instagram') {
  const url = buildSocialLoginUrl(provider);
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}
