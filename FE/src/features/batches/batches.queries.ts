import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { batchesApi } from './batches.api'
import type {
  CreateFarmerBatchInput,
  MergeBatchesInput,
  SplitBatchInput,
} from './batches.types'

export const batchKeys = {
  farmerList: (orgId: number, params: unknown) => ['farmer-batches', orgId, params] as const,
  farmerDetail: (id: number, orgId: number) => ['farmer-batches', 'detail', orgId, id] as const,
  detail: (id: number) => ['batch', id] as const,
  verify: (id: number) => ['batch', id, 'verify'] as const,
  products: (orgId: number) => ['products', orgId] as const,
}

export function useFarmerBatches(
  orgId: number,
  params: { search?: string; page?: number; pageSize?: number } = {},
) {
  return useQuery({
    queryKey: batchKeys.farmerList(orgId, params),
    queryFn: () => batchesApi.getFarmerBatches(orgId, params),
    enabled: orgId > 0,
  })
}

export function useFarmerBatch(id: number, orgId: number) {
  return useQuery({
    queryKey: batchKeys.farmerDetail(id, orgId),
    queryFn: () => batchesApi.getFarmerBatch(id, orgId),
    enabled: id > 0 && orgId > 0,
  })
}

export function useBatch(id: number) {
  return useQuery({
    queryKey: batchKeys.detail(id),
    queryFn: () => batchesApi.getBatch(id),
    enabled: id > 0,
    retry: false,
  })
}

export function useProducts(orgId: number) {
  return useQuery({
    queryKey: batchKeys.products(orgId),
    queryFn: () => batchesApi.getProducts(orgId),
    enabled: orgId > 0,
  })
}

export function useCreateFarmerBatch() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateFarmerBatchInput) => batchesApi.createFarmerBatch(input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['farmer-batches'] })
    },
  })
}

export function useVerifyHashChain(id: number) {
  return useMutation({
    mutationFn: () => batchesApi.verifyHashChain(id),
  })
}

export function useSplitBatch(id: number) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: SplitBatchInput) => batchesApi.splitBatch(id, input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: batchKeys.detail(id) })
      void client.invalidateQueries({ queryKey: ['farmer-batches'] })
    },
  })
}

export function useMergeBatches() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: MergeBatchesInput) => batchesApi.mergeBatches(input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['farmer-batches'] })
    },
  })
}

export function useUploadBatchImage(id: number) {
  return useMutation({
    mutationFn: ({ file, caption }: { file: File; caption?: string }) =>
      batchesApi.uploadBatchImage(id, file, { caption }),
  })
}
