import { describe, it, expect } from 'vitest'
import { validateRegister } from '../validateRegister'

describe('validateRegister', () => {
  it('returns errors for empty fields', () => {
    const { ok, errors } = validateRegister({ name: '', email: '', password: '', confirmPassword: '', acceptTerms: false }, 0)
    expect(ok).toBe(false)
    expect(errors.name).toBeDefined()
    expect(errors.email).toBeDefined()
    expect(errors.password).toBeDefined()
    expect(errors.terms).toBeDefined()
  })

  it('validates password strength and matching', () => {
    const { ok: ok1, errors: e1 } = validateRegister({ name: 'A', email: 'a@b.com', password: 'short', confirmPassword: 'short', acceptTerms: true }, 10)
    expect(ok1).toBe(false)
    expect(e1.password).toBeDefined()

    const { ok: ok2, errors: e2 } = validateRegister({ name: 'A', email: 'a@b.com', password: 'LongEnough1!', confirmPassword: 'LongEnough1!', acceptTerms: true }, 90)
    expect(ok2).toBe(true)
    expect(Object.keys(e2).length).toBe(0)
  })
})
