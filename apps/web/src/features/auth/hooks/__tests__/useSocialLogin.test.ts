import { describe, it, expect } from 'vitest'
import { buildSocialLoginUrl } from '../useSocialLogin'

describe('buildSocialLoginUrl', () => {
  it('builds a properly trimmed URL', () => {
  const env = import.meta.env as unknown as Record<string, string | undefined>
    const orig = env.VITE_API_URL
    try {
      // Simulate a base with trailing slash by temporarily defining the env var
      Object.defineProperty(import.meta, 'env', {
        value: { ...env, VITE_API_URL: 'http://localhost:3001/api/v1/' },
        configurable: true,
      })
      const url = buildSocialLoginUrl('google')
      expect(url).toBe('http://localhost:3001/api/v1/auth/google')
    } finally {
      Object.defineProperty(import.meta, 'env', {
        value: { ...env, VITE_API_URL: orig },
        configurable: true,
      })
    }
  })
})
