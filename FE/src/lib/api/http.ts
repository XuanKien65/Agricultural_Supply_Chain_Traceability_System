import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'

import { env } from '@/config/env'
import { tokenStorage } from './token-storage'

export interface ApiErrorBody {
  message?: string

  errorMessages?: string[]

  code?: string

  errors?:
    | Array<{
        field?: string
        code?: string
        message?: string
      }>
    | Record<string, string[]>
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(
    status: number,
    body?: ApiErrorBody,
  ) {
    const arrayError =
      Array.isArray(body?.errors)
        ? body.errors[0]?.message
        : undefined

    const validationError =
      body?.errors &&
      !Array.isArray(body.errors)
        ? Object.values(
            body.errors,
          )[0]?.[0]
        : undefined

    const message =
      body?.errorMessages?.[0] ??
      arrayError ??
      validationError ??
      body?.message ??
      (
        status === 401
          ? 'Phiên đăng nhập đã hết hạn.'
          : status === 403
            ? 'Bạn không có quyền thực hiện thao tác này.'
            : status === 400
              ? 'Thông tin gửi lên không hợp lệ.'
              : `Lỗi hệ thống (${status || 'network'})`
      )

    super(message)

    this.name = 'ApiError'
    this.status = status
    this.code = body?.code
  }
}

export const http: AxiosInstance =
  axios.create({
    baseURL:
      env.apiBaseUrl.replace(
        /\/$/,
        '',
      ),

    timeout: 15000,

    headers: {
      'Content-Type':
        'application/json',

      'Accept-Language': 'vi',
    },
  })

http.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig,
  ) => {
    const token =
      tokenStorage.getAccess()

    if (token) {
      config.headers.set(
        'Authorization',
        `Bearer ${token}`,
      )
    }

    return config
  },
)

http.interceptors.response.use(
  (response) => response,

  (
    error: AxiosError<ApiErrorBody>,
  ) => {
    if (
      error.response?.status === 401
    ) {
      tokenStorage.clear()

      localStorage.removeItem(
        'authUser',
      )

      window.dispatchEvent(
        new CustomEvent(
          'auth:logout',
        ),
      )
    }

    return Promise.reject(
      new ApiError(
        error.response?.status ?? 0,
        error.response?.data,
      ),
    )
  },
)