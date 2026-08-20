import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from './analytics.api'

export function useOverview() {
  return useQuery({ queryKey: ['analytics', 'overview'], queryFn: analyticsApi.getOverview })
}

export function useBatchDistribution() {
  return useQuery({ queryKey: ['analytics', 'batch-distribution'], queryFn: analyticsApi.getBatchDistribution })
}

export function useProcessingTime() {
  return useQuery({ queryKey: ['analytics', 'processing-time'], queryFn: analyticsApi.getProcessingTime })
}

export function useTraceback(batchId: number) {
  return useQuery({
    queryKey: ['analytics', 'traceback', batchId],
    queryFn: () => analyticsApi.getTraceback(batchId),
    enabled: batchId > 0,
    retry: false,
  })
}
