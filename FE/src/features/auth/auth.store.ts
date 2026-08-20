import { create } from 'zustand'

import {
  tokenStorage,
} from '@/lib/api/token-storage'

import type {
  AuthUser,
} from './auth.types'

const USER_KEY = 'authUser'

function readUser():
  AuthUser | null {
  const raw =
    localStorage.getItem(
      USER_KEY,
    )

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(
      raw,
    ) as AuthUser
  } catch {
    localStorage.removeItem(
      USER_KEY,
    )

    return null
  }
}

interface AuthState {
  user: AuthUser | null

  isAuthenticated: boolean

  setAuth: (
    accessToken: string,
    refreshToken:
      | string
      | undefined,
    user: AuthUser,
  ) => void

  setUser: (
    user: AuthUser,
  ) => void

  clearAuth: () => void
}

const initialUser =
  readUser()

const initialToken =
  tokenStorage.getAccess()

export const useAuthStore =
  create<AuthState>(
    (set) => ({
      user: initialUser,

      isAuthenticated:
        Boolean(initialToken) &&
        Boolean(initialUser),

      setAuth: (
        accessToken,
        refreshToken,
        user,
      ) => {
        tokenStorage.set(
          accessToken,
          refreshToken,
        )

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(
            user,
          ),
        )

        set({
          user,
          isAuthenticated: true,
        })
      },

      setUser: (user) => {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(
            user,
          ),
        )

        set({
          user,
        })
      },

      clearAuth: () => {
        tokenStorage.clear()

        localStorage.removeItem(
          USER_KEY,
        )

        set({
          user: null,
          isAuthenticated: false,
        })
      },
    }),
  )