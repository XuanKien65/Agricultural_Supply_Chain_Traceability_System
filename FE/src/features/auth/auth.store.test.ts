import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth.store'

describe('Auth Store Unit Tests', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('initializes with unauthenticated state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.status).toBe('idle')
    expect(state.error).toBeNull()
  })

  it('clears state on logout', () => {
    useAuthStore.setState({
      user: {
        id: 1,
        email: 'orgadmin@agritrace.vn',
        fullName: 'Admin',
        name: 'Admin',
        role: 'ORGADMIN',
        organizationId: 10,
        organizationName: 'Hợp Tác Xã Mộc Châu',
        organizationType: 'FARM',
      },
      isAuthenticated: true,
      status: 'idle',
      error: null,
    })

    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.error).toBeNull()
  })
})
