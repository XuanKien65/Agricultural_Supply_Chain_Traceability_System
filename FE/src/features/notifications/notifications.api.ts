import { http } from '@/lib/api/http'
import type { AppNotification, RecallNotificationItem } from './notifications.types'

interface ApiResponse<T> {
  isSuccess?: boolean
  success?: boolean
  data?: T
  result?: T
  errorMessages?: string[]
}

export const notificationsApi = {
  /** GET /api/v1/notifications */
  async getNotifications(): Promise<AppNotification[]> {
    const res = await http.get<ApiResponse<{ items?: AppNotification[] } | AppNotification[]>>('/v1/notifications')
    const data = res.data.data ?? res.data.result
    if (Array.isArray(data)) return data
    if (data && 'items' in data && Array.isArray(data.items)) return data.items
    return []
  },

  /** GET /api/v1/notifications/unread-count */
  async getUnreadCount(): Promise<number> {
    const res = await http.get<ApiResponse<number | { count: number }>>('/v1/notifications/unread-count')
    const data = res.data.data ?? res.data.result
    if (typeof data === 'number') return data
    if (data && typeof data === 'object' && 'count' in data) return data.count
    return 0
  },

  /** PATCH /api/v1/notifications/{id}/read */
  async markRead(id: number): Promise<void> {
    await http.patch(`/v1/notifications/${id}/read`)
  },

  /** PATCH /api/v1/notifications/read-all */
  async markAllRead(): Promise<void> {
    await http.patch('/v1/notifications/read-all')
  },

  /** GET /api/recall-notifications?organizationId={id} */
  async getRecallNotifications(organizationId: number): Promise<RecallNotificationItem[]> {
    const res = await http.get<ApiResponse<RecallNotificationItem[]> | RecallNotificationItem[]>(
      `/recall-notifications?organizationId=${organizationId}`
    )
    const data = Array.isArray(res.data) ? res.data : (res.data.data ?? res.data.result ?? [])
    return Array.isArray(data) ? data : []
  },

  /** PUT /api/recall-notifications/{id}/acknowledge */
  async acknowledgeRecall(id: number, notes?: string): Promise<void> {
    await http.put(`/recall-notifications/${id}/acknowledge`, { processingNotes: notes ?? '' })
  },
}
