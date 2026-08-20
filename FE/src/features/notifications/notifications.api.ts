import { http } from '@/lib/api/http'
import { unwrapApi, type ApiEnvelope } from '@/lib/api/api.types'
export interface Notification { id: number; title: string; message: string; isRead: boolean; createdAt: string }
export const notificationsApi = { async getAll() { const response = await http.get<ApiEnvelope<{ items: Notification[] }>>('/notifications'); return unwrapApi(response.data).items }, async markRead(id: number) { await http.patch(`/notifications/${id}/read`) }, async markAllRead() { await http.patch('/notifications/read-all') } }