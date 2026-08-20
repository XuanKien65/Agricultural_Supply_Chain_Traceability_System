import { http } from '@/lib/api/http'
import type { ApiEnvelope } from '@/features/admin/admin.types'
import type {
  CreateFarmerBatchInput,
  CreateFarmerBatchResult,
  FarmerBatchDto,
  HashChainVerificationResult,
  MergeBatchesInput,
  MergeResult,
  PaginationResponse,
  ProductOption,
  SplitBatchInput,
  SplitResult,
  UploadBatchImageResult,
} from './batches.types'

function unwrap<T>(response: { data: ApiEnvelope<T> }): T {
  return response.data.result
}

export const batchesApi = {
  async getFarmerBatches(
    organizationId: number,
    params: { search?: string; page?: number; pageSize?: number } = {},
  ) {
    const res = await http.get<ApiEnvelope<PaginationResponse<FarmerBatchDto>>>('/farmer/batches', {
      params: { organizationId, ...params },
    })
    return unwrap(res)
  },

  async getFarmerBatch(id: number, organizationId: number) {
    const res = await http.get<ApiEnvelope<FarmerBatchDto>>(`/farmer/batches/${id}`, {
      params: { organizationId },
    })
    return unwrap(res)
  },

  async createFarmerBatch(input: CreateFarmerBatchInput) {
    const res = await http.post<ApiEnvelope<CreateFarmerBatchResult>>('/farmer/batches', input)
    return unwrap(res)
  },

  async getBatch(id: number) {
    const res = await http.get<ApiEnvelope<FarmerBatchDto>>(`/batches/${id}`)
    return unwrap(res)
  },

  async verifyHashChain(id: number) {
    const res = await http.get<ApiEnvelope<HashChainVerificationResult>>(`/batches/${id}/verify`)
    return unwrap(res)
  },

  async splitBatch(id: number, input: SplitBatchInput) {
    const res = await http.post<ApiEnvelope<SplitResult>>(`/batches/${id}/split`, input)
    return unwrap(res)
  },

  async mergeBatches(input: MergeBatchesInput) {
    const res = await http.post<ApiEnvelope<MergeResult>>('/batches/merge', input)
    return unwrap(res)
  },

  async uploadBatchImage(id: number, file: File, meta: { caption?: string; displayOrder?: number } = {}) {
    const form = new FormData()
    form.append('file', file)
    if (meta.caption) form.append('caption', meta.caption)
    if (meta.displayOrder != null) form.append('displayOrder', String(meta.displayOrder))
    const res = await http.post<ApiEnvelope<UploadBatchImageResult>>(`/batches/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrap(res)
  },

  async getProducts(organizationId: number) {
    const res = await http.get<ApiEnvelope<{ items: ProductOption[]; totalCount: number }>>('/v1/products', {
      params: { organizationId, pageSize: 100 },
    })
    return unwrap(res).items
  },
}
