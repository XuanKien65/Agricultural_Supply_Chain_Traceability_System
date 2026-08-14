import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from './events.api'
import type { AppendEventInput } from './events.types'

export const eventKeys = { detail: (batchId: number) => ['batch-events', batchId] as const }

export function useBatch(batchId: number) {
  return useQuery({
    queryKey: eventKeys.detail(batchId),
    queryFn: () => eventsApi.getBatch(batchId),
    enabled: batchId > 0,
    retry: false,
  })
}

export function useAppendEvent(batchId: number) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: AppendEventInput) => eventsApi.appendEvent(batchId, input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: eventKeys.detail(batchId) })
    },
  })
}
