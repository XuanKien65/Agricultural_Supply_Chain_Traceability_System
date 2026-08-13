export type Role =
  | 'Admin'
  | 'Farmer'
  | 'Processor'
  | 'Distributor'
  | 'Retailer'
  | 'Inspector'
  | 'Consumer'

export type RegisterableRole = Exclude<Role, 'Admin' | 'Consumer'>

export const REGISTERABLE_ROLES: RegisterableRole[] = [
  'Farmer',
  'Processor',
  'Distributor',
  'Retailer',
  'Inspector',
]

export const ROLE_TO_ID: Record<RegisterableRole, number> = {
  Farmer: 2,
  Processor: 3,
  Distributor: 4,
  Retailer: 5,
  Inspector: 6,
}

export interface AuthUser {
  id: number
  username: string
  fullName: string | null
  name: string
  email: string
  role: Role
  unitName?: string | null
  organizationId?: number | null
}

export interface LoginPayload {
  username: string // Accepts username or email
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  username?: string
  password: string
  role: RegisterableRole
  organizationId?: number | null
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export interface ApiResponse<T> {
  statusCode: number
  isSuccess: boolean
  errorMessages: string[]
  result: T
}

export interface BackendLoginResult {
  token: string
  userId: number
  username: string
  email: string
  fullName: string | null
  role: Role
  organizationId: number | null
  expiresAt: string
}

export interface BackendRegisterResult {
  userId: number
  username: string
  email: string
  role: string
}

export interface BackendCurrentUserResult {
  userId: number
  username: string
  email: string
  fullName: string | null
  role: Role
  organizationId: number | null
  status: string
  createdAt: string
}
