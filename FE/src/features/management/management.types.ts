import type {
  OrganizationType,
  UserRole,
} from '@/features/auth/auth.types'

export type OrganizationStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'

export interface Organization {
  id?: number

  organizationId: number

  name: string

  type: OrganizationType

  status: OrganizationStatus

  createdAt?: string
}

export interface User {
  id?: number

  userId: number

  fullName: string

  email: string

  role: UserRole

  organizationId?:
    | number
    | null

  organizationName?:
    | string
    | null

  isActive: boolean

  createdAt?: string
}

export interface Product {
  id?: number

  productId: number

  organizationId: number

  organizationName?:
    | string
    | null

  name: string

  category?:
    | string
    | null

  unit?:
    | string
    | null
}

export interface LookupItem {
  value: string

  label?: string

  name?: string
}

export interface OrganizationFilters {
  type?: string

  status?: string

  search?: string

  page?: number

  pageSize?: number
}

export interface UserFilters {
  organizationId?: number

  role?: string

  isActive?: boolean

  search?: string

  page?: number

  pageSize?: number
}

export interface ProductFilters {
  organizationId?: number

  category?: string

  search?: string

  page?: number

  pageSize?: number
}