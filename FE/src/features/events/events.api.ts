import { http } from '@/lib/api/http'
import type { ApiEnvelope } from '@/features/admin/admin.types'
import type { AppendEventInput, BatchDetail, BatchEvent } from './events.types'

export const eventsApi = {
  async getBatch(batchId: number) {
    const { data } = await http.get<ApiEnvelope<BatchDetail>>(`/batches/${batchId}`)
    return data.result
  },
  async appendEvent(batchId: number, input: AppendEventInput) {
    const { data } = await http.post<ApiEnvelope<BatchEvent>>(`/batches/${batchId}/events`, input)
    return data.result
  },
}
