import { describe, it, expect } from 'vitest'
import { computePasswordStrength } from '../usePasswordStrength'

describe('computePasswordStrength', () => {
  it('returns 0 and null label for empty password', () => {
    const { score, label } = computePasswordStrength('')
    expect(score).toBe(0)
    expect(label).toBeNull()
  })

  it('classifies a short simple password as weak', () => {
    const { score, label } = computePasswordStrength('abc')
    expect(score).toBeLessThan(30)
    expect(label).toBe('weak')
  })

  it('gives higher score for complex long password', () => {
    const { score, label } = computePasswordStrength('Abc123!@#defGHI')
    expect(score).toBeGreaterThanOrEqual(80)
    expect(label === 'strong' || label === 'very-strong').toBeTruthy()
  })
})
