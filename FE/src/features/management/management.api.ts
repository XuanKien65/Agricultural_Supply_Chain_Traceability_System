import { http }
  from '@/lib/api/http'

import {
  unwrapApi,
  type ApiEnvelope,
  type PagedResult,
} from '@/lib/api/api.types'

import type {
  LookupItem,
  Organization,
  OrganizationFilters,
  Product,
  ProductFilters,
  User,
  UserFilters,
} from './management.types'

function compactParams(
  values: object,
) {
  return Object.fromEntries(
    Object.entries(
      values,
    ).filter(
      ([, value]) =>
        value !== '' &&
        value !== undefined &&
        value !== null,
    ),
  )
}

export const managementApi = {
  async getOrganizations(
    filters:
      OrganizationFilters,
  ) {
    const response =
      await http.get<
        ApiEnvelope<
          PagedResult<Organization>
        >
      >(
        '/v1/organizations',
        {
          params:
            compactParams(
              filters,
            ),
        },
      )

    return unwrapApi(
      response.data,
    )
  },

  async createOrganization(
    payload: {
      name: string
      type: string
    },
  ) {
    const response =
      await http.post<
        ApiEnvelope<Organization>
      >(
        '/v1/organizations',
        payload,
      )

    return unwrapApi(
      response.data,
    )
  },

  async updateOrganization(
    id: number,
    payload: {
      name: string
      type: string
    },
  ) {
    const response =
      await http.put<
        ApiEnvelope<Organization>
      >(
        `/v1/organizations/${id}`,
        payload,
      )

    return unwrapApi(
      response.data,
    )
  },

  async updateOrganizationStatus(
    id: number,
    status: string,
  ) {
    await http.patch(
      `/v1/organizations/${id}/status`,
      {
        status,
      },
    )
  },

  async getUsers(
    filters: UserFilters,
  ) {
    const response =
      await http.get<
        ApiEnvelope<
          PagedResult<User>
        >
      >(
        '/v1/users',
        {
          params:
            compactParams(
              filters,
            ),
        },
      )

    return unwrapApi(
      response.data,
    )
  },

  async createUser(
    payload: {
      organizationId?:
        | number
        | null

      role: string

      fullName: string

      email: string

      password: string
    },
  ) {
    const response =
      await http.post<
        ApiEnvelope<User>
      >(
        '/v1/users',
        payload,
      )

    return unwrapApi(
      response.data,
    )
  },

  async updateUserStatus(
    id: number,
    isActive: boolean,
  ) {
    await http.patch(
      `/v1/users/${id}/status`,
      {
        isActive,
      },
    )
  },

  async getProducts(
    filters:
      ProductFilters,
  ) {
    const response =
      await http.get<
        ApiEnvelope<
          PagedResult<Product>
        >
      >(
        '/v1/products',
        {
          params:
            compactParams(
              filters,
            ),
        },
      )

    return unwrapApi(
      response.data,
    )
  },

  async createProduct(
    payload: {
      organizationId: number

      name: string

      category:
        | string
        | null

      unit:
        | string
        | null
    },
  ) {
    const response =
      await http.post<
        ApiEnvelope<Product>
      >(
        '/v1/products',
        payload,
      )

    return unwrapApi(
      response.data,
    )
  },

  async updateProduct(
    id: number,
    payload: {
      organizationId?: number

      name: string

      category:
        | string
        | null

      unit:
        | string
        | null
    },
  ) {
    const response =
      await http.put<
        ApiEnvelope<Product>
      >(
        `/v1/products/${id}`,
        payload,
      )

    return unwrapApi(
      response.data,
    )
  },

  async deleteProduct(
    id: number,
  ) {
    await http.delete(`/admin/products/${id}`)
  },

  async getRoles() {
    const response =
      await http.get<
        ApiEnvelope<
          LookupItem[]
        >
      >('/v1/roles')

    return unwrapApi(
      response.data,
    )
  },

  async getOrganizationTypes() {
    const response =
      await http.get<
        ApiEnvelope<
          LookupItem[]
        >
      >(
        '/v1/organization-types',
      )

    return unwrapApi(
      response.data,
    )
  },

  async getEventTypes() {
    const response =
      await http.get<
        ApiEnvelope<
          LookupItem[]
        >
      >('/v1/event-types')

    return unwrapApi(
      response.data,
    )
  },
}