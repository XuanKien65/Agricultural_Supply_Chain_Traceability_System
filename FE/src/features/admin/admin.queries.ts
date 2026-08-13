import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  adminApi,
} from './admin.api'

import type {
  AdminBatchPayload,
  AdminCertificatePayload,
  AdminEventPayload,
  AdminInspectionPayload,
  AdminOrganizationPayload,
  AdminProductPayload,
  AdminRecallPayload,
  AdminUserPayload,
} from './admin.types'

export const adminKeys = {
  dashboard:
    ['admin', 'dashboard'] as const,

  roles:
    ['admin', 'roles'] as const,

  organizations:
    ['admin', 'organizations'] as const,

  users:
    ['admin', 'users'] as const,

  products:
    ['admin', 'products'] as const,

  batches:
    ['admin', 'batches'] as const,

  events:
    ['admin', 'events'] as const,

  inspections:
    ['admin', 'inspections'] as const,

  certificates:
    ['admin', 'certificates'] as const,

  recalls:
    ['admin', 'recalls'] as const,
}

export const useAdminDashboard =
  () =>
    useQuery({
      queryKey:
        adminKeys.dashboard,

      queryFn:
        adminApi.getDashboard,
    })

export const useAdminRoles =
  () =>
    useQuery({
      queryKey:
        adminKeys.roles,

      queryFn:
        adminApi.getRoles,
    })

export const useAdminOrganizations =
  () =>
    useQuery({
      queryKey:
        adminKeys.organizations,

      queryFn:
        adminApi.getOrganizations,
    })

export const useAdminUsers =
  () =>
    useQuery({
      queryKey:
        adminKeys.users,

      queryFn:
        adminApi.getUsers,
    })

export const useAdminProducts =
  () =>
    useQuery({
      queryKey:
        adminKeys.products,

      queryFn:
        adminApi.getProducts,
    })

export const useAdminBatches =
  () =>
    useQuery({
      queryKey:
        adminKeys.batches,

      queryFn:
        adminApi.getBatches,
    })

export const useAdminEvents =
  () =>
    useQuery({
      queryKey:
        adminKeys.events,

      queryFn:
        adminApi.getEvents,
    })

export const useAdminInspections =
  () =>
    useQuery({
      queryKey:
        adminKeys.inspections,

      queryFn:
        adminApi.getInspections,
    })

export const useAdminCertificates =
  () =>
    useQuery({
      queryKey:
        adminKeys.certificates,

      queryFn:
        adminApi.getCertificates,
    })

export const useAdminRecalls =
  () =>
    useQuery({
      queryKey:
        adminKeys.recalls,

      queryFn:
        adminApi.getRecalls,
    })


function useInvalidate(
  keys:
    readonly (
      readonly string[]
    )[],
) {
  const client =
    useQueryClient()

  return async () =>
    Promise.all(
      keys.map(
        queryKey =>
          client.invalidateQueries({
            queryKey,
          }),
      ),
    )
}


// =========================
// USERS
// =========================

export function useCreateAdminUser() {
  const invalidate =
    useInvalidate([
      adminKeys.users,
      adminKeys.roles,
      adminKeys.dashboard,
    ])

  return useMutation({
    mutationFn: (
      payload:
        AdminUserPayload,
    ) =>
      adminApi.createUser(
        payload,
      ),

    onSuccess:
      invalidate,
  })
}

export function useUpdateAdminUser() {
  const invalidate =
    useInvalidate([
      adminKeys.users,
      adminKeys.roles,
      adminKeys.dashboard,
    ])

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload:
        AdminUserPayload
    }) =>
      adminApi.updateUser(
        id,
        payload,
      ),

    onSuccess:
      invalidate,
  })
}

export function useDeactivateAdminUser() {
  const invalidate =
    useInvalidate([
      adminKeys.users,
      adminKeys.dashboard,
    ])

  return useMutation({
    mutationFn:
      adminApi.deactivateUser,

    onSuccess:
      invalidate,
  })
}


// =========================
// ORGANIZATIONS
// =========================

export function useOrganizationCrud() {
  const invalidate =
    useInvalidate([
      adminKeys.organizations,
      adminKeys.dashboard,
    ])

  return {
    create:
      useMutation({
        mutationFn: (
          payload:
            AdminOrganizationPayload,
        ) =>
          adminApi.createOrganization(
            payload,
          ),

        onSuccess:
          invalidate,
      }),

    update:
      useMutation({
        mutationFn: ({
          id,
          payload,
        }: {
          id: number
          payload:
            AdminOrganizationPayload
        }) =>
          adminApi.updateOrganization(
            id,
            payload,
          ),

        onSuccess:
          invalidate,
      }),

    remove:
      useMutation({
        mutationFn:
          adminApi
            .deactivateOrganization,

        onSuccess:
          invalidate,
      }),
  }
}


// =========================
// PRODUCTS
// =========================

export function useProductCrud() {
  const invalidate =
    useInvalidate([
      adminKeys.products,
    ])

  return {
    create:
      useMutation({
        mutationFn: (
          payload:
            AdminProductPayload,
        ) =>
          adminApi.createProduct(
            payload,
          ),

        onSuccess:
          invalidate,
      }),

    update:
      useMutation({
        mutationFn: ({
          id,
          payload,
        }: {
          id: number
          payload:
            AdminProductPayload
        }) =>
          adminApi.updateProduct(
            id,
            payload,
          ),

        onSuccess:
          invalidate,
      }),

    remove:
      useMutation({
        mutationFn:
          adminApi.deleteProduct,

        onSuccess:
          invalidate,
      }),
  }
}


// =========================
// BATCHES
// =========================

export function useBatchCrud() {
  const invalidate =
    useInvalidate([
      adminKeys.batches,
      adminKeys.dashboard,
    ])

  return {
    create:
      useMutation({
        mutationFn: (
          payload:
            AdminBatchPayload,
        ) =>
          adminApi.createBatch(
            payload,
          ),

        onSuccess:
          invalidate,
      }),

    update:
      useMutation({
        mutationFn: ({
          id,
          payload,
        }: {
          id: number
          payload:
            AdminBatchPayload
        }) =>
          adminApi.updateBatch(
            id,
            payload,
          ),

        onSuccess:
          invalidate,
      }),

    remove:
      useMutation({
        mutationFn:
          adminApi.deleteBatch,

        onSuccess:
          invalidate,
      }),
  }
}


// =========================
// EVENTS
// =========================

export function useCreateAdminEvent() {
  const invalidate =
    useInvalidate([
      adminKeys.events,
    ])

  return useMutation({
    mutationFn: (
      payload:
        AdminEventPayload,
    ) =>
      adminApi.createEvent(
        payload,
      ),

    onSuccess:
      invalidate,
  })
}


// =========================
// INSPECTIONS
// =========================

export function useInspectionCrud() {
  const invalidate =
    useInvalidate([
      adminKeys.inspections,
    ])

  return {
    create:
      useMutation({
        mutationFn: (
          payload:
            AdminInspectionPayload,
        ) =>
          adminApi.createInspection(
            payload,
          ),

        onSuccess:
          invalidate,
      }),

    update:
      useMutation({
        mutationFn: ({
          id,
          payload,
        }: {
          id: number
          payload:
            AdminInspectionPayload
        }) =>
          adminApi.updateInspection(
            id,
            payload,
          ),

        onSuccess:
          invalidate,
      }),

    remove:
      useMutation({
        mutationFn:
          adminApi
            .deleteInspection,

        onSuccess:
          invalidate,
      }),
  }
}


// =========================
// CERTIFICATES
// =========================

export function useCertificateCrud() {
  const invalidate =
    useInvalidate([
      adminKeys.certificates,
    ])

  return {
    create:
      useMutation({
        mutationFn: (
          payload:
            AdminCertificatePayload,
        ) =>
          adminApi.createCertificate(
            payload,
          ),

        onSuccess:
          invalidate,
      }),

    update:
      useMutation({
        mutationFn: ({
          id,
          payload,
        }: {
          id: number
          payload:
            AdminCertificatePayload
        }) =>
          adminApi.updateCertificate(
            id,
            payload,
          ),

        onSuccess:
          invalidate,
      }),

    remove:
      useMutation({
        mutationFn:
          adminApi
            .deleteCertificate,

        onSuccess:
          invalidate,
      }),
  }
}


// =========================
// RECALLS
// =========================

export function useRecallCrud() {
  const invalidate =
    useInvalidate([
      adminKeys.recalls,
      adminKeys.dashboard,
    ])

  return {
    create:
      useMutation({
        mutationFn: (
          payload:
            AdminRecallPayload,
        ) =>
          adminApi.createRecall(
            payload,
          ),

        onSuccess:
          invalidate,
      }),

    update:
      useMutation({
        mutationFn: ({
          id,
          payload,
        }: {
          id: number
          payload:
            AdminRecallPayload
        }) =>
          adminApi.updateRecall(
            id,
            payload,
          ),

        onSuccess:
          invalidate,
      }),

    remove:
      useMutation({
        mutationFn:
          adminApi.deleteRecall,

        onSuccess:
          invalidate,
      }),
  }
}