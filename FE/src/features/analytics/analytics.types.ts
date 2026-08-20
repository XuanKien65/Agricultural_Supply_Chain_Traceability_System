export interface OverviewDto {
  totalOrganizations: number
  totalUsers: number
  totalBatches: number
  totalEvents: number
  totalInspections: number
  totalCertificates: number
  totalRecalls: number
  activeRecalls: number
}

export interface BatchDistributionItem {
  organizationId: number
  organizationName: string
  organizationType: string
  batchCount: number
  totalQuantity: number
}

export interface BatchDistributionDto {
  items: BatchDistributionItem[]
}

export interface ProcessingTimeItem {
  fromEventType: string
  toEventType: string
  averageHours: number
  sampleCount: number
}

export interface ProcessingTimeDto {
  items: ProcessingTimeItem[]
}

export interface TracebackNode {
  batchId: number
  batchCode: string
  quantity: number
  organizationName: string | null
  createdAt: string
  depth: number
}

export interface TracebackEvent {
  batchId: number
  batchCode: string
  eventType: string
  organizationName: string | null
  location: string | null
  createdAt: string
}

export interface TracebackDto {
  targetBatchId: number
  targetBatchCode: string
  ancestors: TracebackNode[]
  timeline: TracebackEvent[]
}
