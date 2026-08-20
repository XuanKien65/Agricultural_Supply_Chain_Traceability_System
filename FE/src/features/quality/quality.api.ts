import { http } from '@/lib/api/http'
import { unwrapApi, type ApiEnvelope } from '@/lib/api/api.types'

export interface Inspection {
  id: number
  batchId: number
  inspectorOrganizationName?: string | null
  result?: string | null
  inspectionDate?: string | null
  notes?: string | null
}

export const qualityApi = {
  async getByBatch(batchId: number) {
    const response = await http.get<ApiEnvelope<{ items: Inspection[] }>>(`/batches/${batchId}/inspections`)
    return unwrapApi(response.data).items
  },

  async create(batchId: number, payload: { result: string; notes?: string }) {
    const response = await http.post<ApiEnvelope<Inspection>>(`/batches/${batchId}/inspections`, payload)
    return unwrapApi(response.data)
  },
}