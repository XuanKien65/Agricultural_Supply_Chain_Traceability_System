import { http } from '@/lib/api/http'

import {
  unwrapApi,
  type ApiEnvelope,
} from '@/lib/api/api.types'

import type {
  AuthUser,
  BackendAuthUser,
  BackendLoginResponse,
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
} from './auth.types'

function normalizeUser(
  user: BackendAuthUser,
): AuthUser {
  const id =
    user.userId ??
    user.id ??
    0

  const fullName =
    user.fullName ??
    user.name ??
    user.email

  return {
    ...user,

    id,

    userId: id,

    name: fullName,

    fullName,

    unitName:
      user.organizationName ??
      null,
  }
}

export const authApi = {
  async login(
    payload: LoginPayload,
  ): Promise<LoginResponse> {
    const response =
      await http.post<
        ApiEnvelope<
          BackendLoginResponse
        >
      >(
        '/v1/auth/login',
        {
          ...payload,
          username:
            payload.username ??
            payload.email,
        },
      )

    const result =
      unwrapApi(
        response.data,
      )

    return {
      accessToken:
        result.accessToken,

      refreshToken:
        result.refreshToken,

      user:
        normalizeUser(
          result.user,
        ),
    }
  },

  async getMe():
    Promise<AuthUser> {
    const response =
      await http.get<
        ApiEnvelope<
          BackendAuthUser
        >
      >('/v1/auth/me')

    return normalizeUser(
      unwrapApi(
        response.data,
      ),
    )
  },

  async logout():
    Promise<void> {
    try {
      await http.post(
        '/v1/auth/logout',
      )
    } catch {
      // FE vẫn xóa local session
      // kể cả khi backend logout lỗi.
    }
  },

  async changePassword(
    payload:
      ChangePasswordPayload,
  ): Promise<void> {
    await http.put(
      '/v1/auth/change-password',
      payload,
    )
  },
}