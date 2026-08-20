import { http } from '@/lib/api/http'
import type { ApiEnvelope } from '@/features/admin/admin.types'
import type { BatchDistributionDto, OverviewDto, ProcessingTimeDto, TracebackDto } from './analytics.types'

function unwrap<T>(response: { data: ApiEnvelope<T> }): T {
  return response.data.result
}

export const analyticsApi = {
  getOverview: async () => unwrap(await http.get<ApiEnvelope<OverviewDto>>('/analytics/overview')),
  getBatchDistribution: async () =>
    unwrap(await http.get<ApiEnvelope<BatchDistributionDto>>('/analytics/batch-distribution')),
  getProcessingTime: async () =>
    unwrap(await http.get<ApiEnvelope<ProcessingTimeDto>>('/analytics/processing-time')),
  getTraceback: async (batchId: number) =>
    unwrap(await http.get<ApiEnvelope<TracebackDto>>(`/analytics/traceback/${batchId}`)),
}
