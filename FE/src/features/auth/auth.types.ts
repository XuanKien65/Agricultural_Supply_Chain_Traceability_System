export type Role =
  'Admin' | 'Farmer' | 'Processor' | 'Distributor' | 'Retailer' | 'Inspector'

export type RegisterableRole = Exclude<Role, 'Admin'>

export const REGISTERABLE_ROLES: RegisterableRole[] = [
  'Farmer',
  'Processor',
  'Distributor',
  'Retailer',
  'Inspector',
]

export interface AuthUser {
  id: number
  name: string
  email: string
  role: Role
  unitName: string | null
  organizationId?: number
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
  unitName: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  user: AuthUser
}
