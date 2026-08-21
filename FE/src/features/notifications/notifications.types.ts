export interface AppNotification {
  id: number
  userId: number
  title: string
  message: string
  type?: string
  isRead: boolean
  createdAt: string
}

export interface RecallNotificationItem {
  id: number
  recallId: number
  batchId: number
  batchCode?: string
  productName?: string
  reason?: string
  severity?: string
  status?: string
  isAcknowledged?: boolean
  acknowledgedAt?: string | null
  processingNotes?: string | null
  createdAt?: string
}
