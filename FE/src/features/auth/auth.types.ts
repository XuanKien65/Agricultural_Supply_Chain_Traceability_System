export type UserRole =
  | 'ADMIN'
  | 'ORGADMIN'
  | 'FARMER'
  | 'OPERATOR'
  | 'INSPECTOR'

export type Role = UserRole

export type RegisterableRole =
  | 'FARMER'
  | 'OPERATOR'

export const REGISTERABLE_ROLES: RegisterableRole[] = [
  'FARMER',
  'OPERATOR',
]

export type OrganizationType =
  | 'FARM'
  | 'PROCESSOR'
  | 'DISTRIBUTOR'
  | 'RETAILER'

export interface AuthUser {
  id: number
  userId?: number

  name: string
  fullName: string

  email: string
  role: UserRole

  isActive?: boolean

  organizationId?: number | null
  organizationName?: string | null

  organizationType?:
    | OrganizationType
    | null

  unitName?: string | null
}

export interface BackendAuthUser {
  id?: number
  userId?: number

  name?: string
  fullName?: string

  email: string
  role: UserRole

  isActive?: boolean

  organizationId?: number | null
  organizationName?: string | null

  organizationType?:
    | OrganizationType
    | null
}

export interface LoginPayload {
  email: string
  username?: string
  password: string
}

export interface BackendLoginResponse {
  accessToken: string
  refreshToken?: string

  accessTokenExpiresAt?: string
  refreshTokenExpiresAt?: string

  user: BackendAuthUser
}

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  user: AuthUser
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}