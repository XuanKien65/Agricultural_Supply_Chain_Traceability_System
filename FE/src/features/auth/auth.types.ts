export type Role = 'ADMIN' | 'ORGADMIN' | 'FARMER' | 'OPERATOR' | 'INSPECTOR'

export type RegisterableRole = Exclude<Role, 'ADMIN' | 'ORGADMIN'>

export const REGISTERABLE_ROLES: RegisterableRole[] = ['FARMER', 'OPERATOR', 'INSPECTOR']

export interface AuthUser {
  id: number
  fullName: string | null
  email: string
  role: Role
  organizationId: number | null
  organizationName: string | null
  organizationType: string | null
  /** Tên hiển thị — fallback về email khi chưa có họ tên. */
  name: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
  role: RegisterableRole
  organizationId?: number | null
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface ApiResponse<T> {
  statusCode: number
  isSuccess: boolean
  errorMessages: string[]
  result: T
}

export interface BackendAuthUserResult {
  userId: number
  fullName: string | null
  email: string
  role: Role
  organizationId: number | null
  organizationName: string | null
  organizationType: string | null
}

export interface BackendLoginResult {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  user: BackendAuthUserResult
}
