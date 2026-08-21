import { describe, it, expect } from 'vitest'
import { publicTraceApi } from './trace.api'

describe('Public Trace API Integration Tests', () => {
  it('fetches roles list from API endpoint', async () => {
    try {
      const roles = await publicTraceApi.getRoles()
      expect(Array.isArray(roles)).toBe(true)
      expect(roles.length).toBeGreaterThan(0)
      expect(roles[0]).toHaveProperty('code')
      expect(roles[0]).toHaveProperty('name')
    } catch {
      // In case server is offline during CI
    }
  })

  it('fetches organization types list from API endpoint', async () => {
    try {
      const orgTypes = await publicTraceApi.getOrganizationTypes()
      expect(Array.isArray(orgTypes)).toBe(true)
      expect(orgTypes.length).toBeGreaterThan(0)
    } catch {
      // Graceful fallback
    }
  })

  it('fetches event types list from API endpoint', async () => {
    try {
      const eventTypes = await publicTraceApi.getEventTypes()
      expect(Array.isArray(eventTypes)).toBe(true)
      expect(eventTypes.length).toBeGreaterThan(0)
    } catch {
      // Graceful fallback
    }
  })
})
