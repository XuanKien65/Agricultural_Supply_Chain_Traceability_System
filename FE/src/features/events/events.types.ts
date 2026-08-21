import type { Role } from '@/features/auth/auth.types'

export type EventType = 'HARVEST' | 'PROCESS' | 'PACKAGE' | 'TRANSPORT' | 'DISTRIBUTE' | 'RETAIL' | 'RECEIVE' | 'INSPECT' | 'SPLIT' | 'MERGE'

/** Thứ tự chuẩn của chain of custody — khớp BE (`SupplyChainEvent.Order`). */
export const EVENT_ORDER: EventType[] = ['HARVEST', 'PROCESS', 'PACKAGE', 'TRANSPORT', 'DISTRIBUTE', 'RETAIL']

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  HARVEST: 'Thu hoạch',
  PROCESS: 'Sơ chế',
  PACKAGE: 'Đóng gói',
  TRANSPORT: 'Vận chuyển',
  DISTRIBUTE: 'Phân phối',
  RETAIL: 'Bán lẻ',
  RECEIVE: 'Nhận hàng',
  INSPECT: 'Kiểm định',
  SPLIT: 'Tách lô',
  MERGE: 'Gộp lô',
}

export const ORG_TYPE_EVENT_TYPES: Record<string, EventType[]> = {
  FARM: ['HARVEST'],
  PROCESSOR: ['PROCESS', 'PACKAGE', 'TRANSPORT', 'SPLIT', 'MERGE'],
  DISTRIBUTOR: ['TRANSPORT', 'RECEIVE', 'SPLIT', 'MERGE'],
  RETAILER: ['RECEIVE'],
}

/** Vai trò nào được ghi loại sự kiện nào — khớp BUSINESS_FLOW.md §2. */
export const ROLE_EVENT_TYPES: Partial<Record<Role, EventType[]>> = {
  OPERATOR: ['PROCESS', 'PACKAGE', 'TRANSPORT', 'DISTRIBUTE', 'RETAIL'],
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
