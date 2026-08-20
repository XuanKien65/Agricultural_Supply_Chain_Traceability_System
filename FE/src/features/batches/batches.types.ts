export interface BatchEventDto {
  eventId: number
  eventType: string
  eventTime: string
  location?: string | null
  additionalData?: string | null
  previousHash?: string | null
  currentHash: string
}

export interface FarmerBatchDto {
  batchId: number
  batchCode: string
  productId: number
  productName: string
  unit?: string | null
  producerOrganizationId: number
  harvestDate: string | null
  weight: number
  status: string
  qrCode: string
  createdAt: string
  events: BatchEventDto[]
}

export interface PaginationResponse<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

export interface CreateFarmerBatchInput {
  productId: number
  producerOrganizationId: number
  performedByUserId: number
  harvestDate: string
  weight: number
  location?: string
  harvestNotes?: string
}

export interface CreateFarmerBatchResult {
  batchId: number
  batchCode: string
  qrCode: string
}

export interface ProductOption {
  productId: number
  organizationId: number
  organizationName?: string | null
  name: string
  category?: string | null
  unit?: string | null
}

export interface SplitChildInput {
  quantity: number
}

export interface SplitBatchInput {
  organizationId: number
  performedByUserId: number
  childBatches: SplitChildInput[]
  location?: string
  eventTime?: string
}

export interface SplitChildResult {
  batchId: number
  batchCode: string
  quantity: number
}

export interface SplitResult {
  parentBatchId: number
  splitEventId: number
  childBatches: SplitChildResult[]
}

export interface MergeSourceInput {
  batchId: number
  quantity: number
}

export interface MergeBatchesInput {
  sources: MergeSourceInput[]
  organizationId: number
  performedByUserId: number
  location?: string
  description?: string
  eventTime?: string
}

export interface MergeResult {
  resultBatchId: number
  batchCode: string
  totalQuantity: number
  mergeEventId: number
  sourceBatchIds: number[]
}

export interface HashChainVerificationResult {
  batchId: number
  isValid: boolean
  totalEvents: number
  brokenAtEventIndex?: number | null
  brokenAtEventType?: string | null
  message: string
}

export interface UploadBatchImageResult {
  imageUrl: string
}
