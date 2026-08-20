import { http } from '@/lib/api/http'
import { unwrapApi, type ApiEnvelope } from '@/lib/api/api.types'

export type AnalyticsRecord = Record<string, unknown>

async function get<T extends AnalyticsRecord>(path: string) {
  const response = await http.get<ApiEnvelope<T>>(path)
  return unwrapApi(response.data)
}

export const analyticsApi = {
  getOverview: () => get<AnalyticsRecord>('/v1/analytics/overview'),
  getBatchDistribution: () => get<AnalyticsRecord>('/v1/analytics/batch-distribution'),
  getProcessingTime: () => get<AnalyticsRecord>('/v1/analytics/processing-time'),
  getTraceback: (batchId: number) => get<AnalyticsRecord>(`/v1/analytics/traceback/${batchId}`),
}