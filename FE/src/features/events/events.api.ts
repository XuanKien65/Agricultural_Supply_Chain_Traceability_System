import { http } from '@/lib/api/http'
import type { ApiEnvelope } from '@/lib/api/api.types'
import type { AppendEventInput, BatchDetail, BatchEvent } from './events.types'

function unwrapDirect<T>(value: T | ApiEnvelope<T>) {
  if (typeof value === 'object' && value !== null && ('data' in value || 'result' in value)) {
    return (value as ApiEnvelope<T>).data ?? (value as ApiEnvelope<T>).result as T
  }
  return value as T
}

export const eventsApi = {
  async getBatch(batchId: number) {
    const { data } = await http.get<ApiEnvelope<BatchDetail>>(`/batches/${batchId}`)
    return unwrapDirect(data)
  },
  async appendEvent(batchId: number, input: AppendEventInput) {
    const { data } = await http.post<ApiEnvelope<BatchEvent>>(`/batches/${batchId}/events`, input)
    return unwrapDirect(data)
  },
}
