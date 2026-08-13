import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { batchesApi } from './batches.api'
import type { CreateBatchInput } from './batches.types'

export const batchKeys = { all: ['farmer-batches'] as const, list: (orgId: number) => ['farmer-batches', orgId] as const, detail: (id: number, orgId: number) => ['farmer-batches', orgId, id] as const }
export function useProducts() { return useQuery({ queryKey: ['products'], queryFn: batchesApi.getProducts }) }
export function useFarmerBatches(orgId: number) { return useQuery({ queryKey: batchKeys.list(orgId), queryFn: () => batchesApi.getBatches(orgId), enabled: orgId > 0 }) }
export function useFarmerBatch(id: number, orgId: number) { return useQuery({ queryKey: batchKeys.detail(id, orgId), queryFn: () => batchesApi.getBatch(id, orgId), enabled: id > 0 && orgId > 0 }) }
export function useCreateBatch() { const client = useQueryClient(); return useMutation({ mutationFn: (input: CreateBatchInput) => batchesApi.createBatch(input), onSuccess: (batch) => { client.setQueryData(batchKeys.detail(batch.batchId, batch.producerOrganizationId), batch); void client.invalidateQueries({ queryKey: batchKeys.all }) } }) }
