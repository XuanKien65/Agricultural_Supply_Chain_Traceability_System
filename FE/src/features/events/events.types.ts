export type EventType =
  | 'HARVEST'
  | 'PROCESS'
  | 'PACKAGE'
  | 'TRANSPORT'
  | 'RECEIVE'
  | 'INSPECT'
  | 'SPLIT'
  | 'MERGE'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  HARVEST: 'Thu hoạch',
  PROCESS: 'Sơ chế',
  PACKAGE: 'Đóng gói',
  TRANSPORT: 'Vận chuyển',
  RECEIVE: 'Nhận hàng',
  INSPECT: 'Kiểm định',
  SPLIT: 'Tách lô',
  MERGE: 'Gộp lô',
}

/**
 * Loại sự kiện được phép ghi theo Organization Type — khớp BE
 * `API_Specification.md` §8.1. `INSPECT` luôn cho phép nếu user có role
 * INSPECTOR, bất kể tổ chức. BE không tự chặn ở server (chỉ check user
 * cùng organizationId) nên đây thuần là gợi ý UX, không phải rào bảo mật.
 */
export const ORG_TYPE_EVENT_TYPES: Record<string, EventType[]> = {
  FARM: ['HARVEST'],
  PROCESSOR: ['PROCESS', 'PACKAGE', 'TRANSPORT', 'SPLIT', 'MERGE'],
  DISTRIBUTOR: ['TRANSPORT', 'RECEIVE', 'SPLIT', 'MERGE'],
  RETAILER: ['RECEIVE'],
}

export interface BatchEvent {
  eventId: number
  eventType: EventType
  eventTime: string
  location?: string | null
  additionalData?: string | null
  previousHash?: string | null
  currentHash: string
}

export interface BatchDetail {
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
  events: BatchEvent[]
}

export interface AppendEventInput {
  organizationId: number
  performedByUserId: number
  eventType: EventType
  location?: string
  additionalData?: string
}
