import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tokenStorage } from '@/lib/api/token-storage'
import { authApi } from './auth.api'
import type { AuthUser, LoginPayload, RegisterPayload } from './auth.types'

interface AuthState {
  user: AuthUser | null
  status: 'idle' | 'loading' | 'error'
  error: string | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  fetchMe: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: 'idle',
      error: null,
      isAuthenticated: false,

      async login(payload) {
        set({ status: 'loading', error: null })
        try {
          const res = await authApi.login(payload)
          tokenStorage.set(res.accessToken, res.refreshToken)
          set({ user: res.user, isAuthenticated: true, status: 'idle' })
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Tài khoản hoặc mật khẩu không chính xác'
          set({ status: 'error', error: message })
          throw e
        }
      },

      async register(payload) {
        set({ status: 'loading', error: null })
        try {
          const res = await authApi.register(payload)
          tokenStorage.set(res.accessToken, res.refreshToken)
          set({ user: res.user, isAuthenticated: true, status: 'idle' })
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Đăng ký không thành công'
          set({ status: 'error', error: message })
          throw e
        }
      },

      async fetchMe() {
        const token = tokenStorage.getAccess()
        if (!token) {
          set({ user: null, isAuthenticated: false })
          return
        }
        try {
          const user = await authApi.getMe()
          set({ user, isAuthenticated: true })
        } catch {
          tokenStorage.clear()
          set({ user: null, isAuthenticated: false })
        }
      },

      logout() {
        tokenStorage.clear()
        set({ user: null, isAuthenticated: false, status: 'idle', error: null })
      },
    }),
    {
      name: 'auth',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    },
  ),
)

// Keep the store in sync when HTTP layer forces a logout
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => useAuthStore.getState().logout())
}
