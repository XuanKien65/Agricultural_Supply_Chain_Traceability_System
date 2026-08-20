import { http } from '@/lib/api/http'
import { unwrapApi, type ApiEnvelope, type PagedResult } from '@/lib/api/api.types'

export interface Recall {
  id: number
  batchId: number
  reason: string
  severity: string
  createdAt: string
  resolvedAt?: string | null
  status?: string | null
}

export const recallsApi = {
  async getAll() {
    const response = await http.get<ApiEnvelope<PagedResult<Recall>>>('/recalls', { params: { page: 1, pageSize: 100 } })
    return unwrapApi(response.data)
  },

  async create(payload: { batchId: number; reason: string; severity: string }) {
    const response = await http.post<ApiEnvelope<Recall>>('/recalls', payload)
    return unwrapApi(response.data)
  },

  async resolve(id: number) {
    const response = await http.patch<ApiEnvelope<Recall>>(`/recalls/${id}/resolve`)
    return unwrapApi(response.data)
  },
}