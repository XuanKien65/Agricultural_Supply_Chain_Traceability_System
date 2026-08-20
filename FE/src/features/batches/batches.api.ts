import { http } from '@/lib/api/http'
import { unwrapApi, type ApiEnvelope, type PagedResult } from '@/lib/api/api.types'
import type { CreateBatchInput, FarmerBatch, Product } from './batches.types'

type BatchListResponse = PagedResult<FarmerBatch> | FarmerBatch[]

function unwrapDirect<T>(value: T | ApiEnvelope<T>) {
  if (typeof value === 'object' && value !== null && ('data' in value || 'result' in value)) {
    return unwrapApi(value as ApiEnvelope<T>)
  }
  return value as T
}

function toProducts(result: PagedResult<Product> | Product[]) {
  return Array.isArray(result) ? result : result.items
}

export const batchesApi = {
  async getProducts() {
    const response = await http.get<ApiEnvelope<PagedResult<Product>>>('/v1/products', { params: { page: 1, pageSize: 100 } })
    return toProducts(unwrapApi(response.data))
  },

  async getBatches(organizationId: number) {
    const response = await http.get<BatchListResponse>('/farmer/batches', { params: { organizationId, page: 1, pageSize: 100 } })
    const result = unwrapDirect(response.data)
    return Array.isArray(result) ? result : result.items
  },

  async getBatch(id: number, organizationId: number) {
    const response = await http.get<FarmerBatch | ApiEnvelope<FarmerBatch>>(`/farmer/batches/${id}`, { params: { organizationId } })
    return unwrapDirect(response.data)
  },

  async createBatch(input: CreateBatchInput) {
    const response = await http.post<FarmerBatch | ApiEnvelope<FarmerBatch>>('/farmer/batches', input)
    return unwrapDirect(response.data)
  },

  async getBatchEvents(batchId: number) {
    const response = await http.get<FarmerBatch['events']>(`/batches/${batchId}/events`)
    return unwrapDirect(response.data)
  },

  async verifyIntegrity(batchId: number) {
    const response = await http.get(`/batches/${batchId}/events/verify-integrity`)
    return unwrapDirect(response.data)
  },

  async uploadImage(batchId: number, file: File, metadata?: { caption?: string; displayOrder?: number; eventId?: number }) {
    const form = new FormData()
    form.append('file', file)
    if (metadata?.caption) form.append('caption', metadata.caption)
    if (metadata?.displayOrder !== undefined) form.append('displayOrder', String(metadata.displayOrder))
    if (metadata?.eventId !== undefined) form.append('eventId', String(metadata.eventId))
    const response = await http.post(`/batches/${batchId}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return unwrapDirect(response.data)
  },

  async splitBatch(batchId: number, payload: { organizationId: number; performedByUserId: number; childBatches: Array<{ quantity: number }>; location?: string; eventTime?: string }) {
    const response = await http.post(`/batches/${batchId}/split`, payload)
    return unwrapDirect(response.data)
  },

  async mergeBatches(payload: { sources: Array<{ batchId: number; quantity: number }>; organizationId: number; performedByUserId: number; location?: string; description?: string; eventTime?: string }) {
    const response = await http.post('/batches/merge', payload)
    return unwrapDirect(response.data)
  },
}