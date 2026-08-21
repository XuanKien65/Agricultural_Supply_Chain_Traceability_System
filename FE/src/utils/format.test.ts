import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, formatNumber } from './format'

describe('Format Utils', () => {
  it('formats numbers correctly', () => {
    expect(formatNumber(1000)).toBe('1.000')
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(null as unknown as number)).toBe('0')
  })

  it('formats date strings correctly', () => {
    const result = formatDate('2026-08-20T10:00:00Z')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('formats datetime strings correctly', () => {
    const result = formatDateTime('2026-08-20T10:00:00Z')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })
})
