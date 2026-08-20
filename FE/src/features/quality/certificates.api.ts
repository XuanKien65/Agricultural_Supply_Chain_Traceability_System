import { http } from '@/lib/api/http'
import { unwrapApi, type ApiEnvelope } from '@/lib/api/api.types'

export interface Certificate { id: number; batchId: number; inspectionId?: number | null; certificateType?: string | null; fileUrl?: string | null; issuedDate?: string | null }

export const certificatesApi = {
  async getByBatch(batchId: number) {
    const response = await http.get<ApiEnvelope<{ items: Certificate[] }>>(`/batches/${batchId}/certificates`)
    return unwrapApi(response.data).items
  },
  async create(batchId: number, payload: { inspectionId?: number; certificateType: string; fileUrl: string }) {
    const response = await http.post<ApiEnvelope<Certificate>>(`/batches/${batchId}/certificates`, payload)
    return unwrapApi(response.data)
  },
}