import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from './events.api'
import type { AppendEventInput } from './events.types'

export const eventKeys = { detail: (batchId: number | string, rawCode?: string) => ['batch-events', batchId, rawCode] as const }

export function useBatch(batchId: number | string, rawCode?: string) {
  return useQuery({
    queryKey: eventKeys.detail(batchId, rawCode),
    queryFn: () => eventsApi.getBatch(batchId, rawCode),
    enabled: true,
    retry: false,
  })
}

export function useAppendEvent(batchId: number | string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: AppendEventInput) => eventsApi.appendEvent(batchId, input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['batch-events'] })
    },
  })
}
