import { http } from '@/lib/api/http'

import type {
  AdminBatch,
  AdminBatchPayload,
  AdminCertificate,
  AdminCertificatePayload,
  AdminDashboard,
  AdminEventPayload,
  AdminInspection,
  AdminInspectionPayload,
  AdminOrganization,
  AdminOrganizationPayload,
  AdminProduct,
  AdminProductPayload,
  AdminRecall,
  AdminRecallPayload,
  AdminRole,
  AdminSupplyChainEvent,
  AdminUser,
  AdminUserPayload,
  ApiEnvelope,
} from './admin.types'

function unwrap<T>(
  response: {
    data: ApiEnvelope<T>
  },
): T {
  return response.data.result
}

const get =
  async <T,>(
    url: string,
  ) =>
    unwrap(
      await http.get<
        ApiEnvelope<T>
      >(url),
    )

const post =
  async <T, P>(
    url: string,
    payload: P,
  ) =>
    unwrap(
      await http.post<
        ApiEnvelope<T>
      >(
        url,
        payload,
      ),
    )

const put =
  async <T, P>(
    url: string,
    payload: P,
  ) =>
    unwrap(
      await http.put<
        ApiEnvelope<T>
      >(
        url,
        payload,
      ),
    )

export const adminApi = {
  getDashboard: () =>
    get<AdminDashboard>(
      '/admin/dashboard',
    ),

  getRoles: () =>
    get<AdminRole[]>(
      '/admin/roles',
    ),


  getOrganizations: () =>
    get<AdminOrganization[]>(
      '/admin/organizations',
    ),

  createOrganization: (
    payload:
      AdminOrganizationPayload,
  ) =>
    post<
      AdminOrganization,
      AdminOrganizationPayload
    >(
      '/admin/organizations',
      payload,
    ),

  updateOrganization: (
    id: number,
    payload:
      AdminOrganizationPayload,
  ) =>
    put<
      AdminOrganization,
      AdminOrganizationPayload
    >(
      `/admin/organizations/${id}`,
      payload,
    ),

  deactivateOrganization: (
    id: number,
  ) =>
    http.delete(
      `/admin/organizations/${id}`,
    ),


  getUsers: () =>
    get<AdminUser[]>(
      '/admin/users',
    ),

  createUser: (
    payload:
      AdminUserPayload,
  ) =>
    post<
      AdminUser,
      AdminUserPayload
    >(
      '/admin/users',
      payload,
    ),

  updateUser: (
    id: number,
    payload:
      AdminUserPayload,
  ) =>
    put<
      AdminUser,
      AdminUserPayload
    >(
      `/admin/users/${id}`,
      payload,
    ),

  deactivateUser: (
    id: number,
  ) =>
    http.delete(
      `/admin/users/${id}`,
    ),


  getProducts: () =>
    get<AdminProduct[]>(
      '/admin/products',
    ),

  createProduct: (
    payload:
      AdminProductPayload,
  ) =>
    post<
      AdminProduct,
      AdminProductPayload
    >(
      '/admin/products',
      payload,
    ),

  updateProduct: (
    id: number,
    payload:
      AdminProductPayload,
  ) =>
    put<
      AdminProduct,
      AdminProductPayload
    >(
      `/admin/products/${id}`,
      payload,
    ),

  deleteProduct: (
    id: number,
  ) =>
    http.delete(
      `/admin/products/${id}`,
    ),


  getBatches: () =>
    get<AdminBatch[]>(
      '/admin/batches',
    ),

  createBatch: (
    payload:
      AdminBatchPayload,
  ) =>
    post<
      AdminBatch,
      AdminBatchPayload
    >(
      '/admin/batches',
      payload,
    ),

  updateBatch: (
    id: number,
    payload:
      AdminBatchPayload,
  ) =>
    put<
      AdminBatch,
      AdminBatchPayload
    >(
      `/admin/batches/${id}`,
      payload,
    ),

  deleteBatch: (
    id: number,
  ) =>
    http.delete(
      `/admin/batches/${id}`,
    ),


  getEvents: () =>
    get<
      AdminSupplyChainEvent[]
    >(
      '/admin/events',
    ),

  createEvent: (
    payload:
      AdminEventPayload,
  ) =>
    post<
      AdminSupplyChainEvent,
      AdminEventPayload
    >(
      '/admin/events',
      payload,
    ),


  getInspections: () =>
    get<AdminInspection[]>(
      '/admin/inspections',
    ),

  createInspection: (
    payload:
      AdminInspectionPayload,
  ) =>
    post<
      AdminInspection,
      AdminInspectionPayload
    >(
      '/admin/inspections',
      payload,
    ),

  updateInspection: (
    id: number,
    payload:
      AdminInspectionPayload,
  ) =>
    put<
      AdminInspection,
      AdminInspectionPayload
    >(
      `/admin/inspections/${id}`,
      payload,
    ),

  deleteInspection: (
    id: number,
  ) =>
    http.delete(
      `/admin/inspections/${id}`,
    ),


  getCertificates: () =>
    get<AdminCertificate[]>(
      '/admin/certificates',
    ),

  createCertificate: (
    payload:
      AdminCertificatePayload,
  ) =>
    post<
      AdminCertificate,
      AdminCertificatePayload
    >(
      '/admin/certificates',
      payload,
    ),

  updateCertificate: (
    id: number,
    payload:
      AdminCertificatePayload,
  ) =>
    put<
      AdminCertificate,
      AdminCertificatePayload
    >(
      `/admin/certificates/${id}`,
      payload,
    ),

  deleteCertificate: (
    id: number,
  ) =>
    http.delete(
      `/admin/certificates/${id}`,
    ),


  getRecalls: () =>
    get<AdminRecall[]>(
      '/admin/recalls',
    ),

  createRecall: (
    payload:
      AdminRecallPayload,
  ) =>
    post<
      AdminRecall,
      AdminRecallPayload
    >(
      '/admin/recalls',
      payload,
    ),

  updateRecall: (
    id: number,
    payload:
      AdminRecallPayload,
  ) =>
    put<
      AdminRecall,
      AdminRecallPayload
    >(
      `/admin/recalls/${id}`,
      payload,
    ),

  deleteRecall: (
    id: number,
  ) =>
    http.delete(
      `/admin/recalls/${id}`,
    ),
}