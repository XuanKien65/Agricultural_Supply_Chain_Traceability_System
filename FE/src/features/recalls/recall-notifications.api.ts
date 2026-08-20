import { http } from '@/lib/api/http'
import { unwrapApi } from '@/lib/api/api.types'

export interface RecallNotification { id: number; recallId?: number; organizationId?: number; status?: string; processingNotes?: string; createdAt?: string; message?: string; reason?: string; severity?: string }

export const recallNotificationsApi = {
  async getForOrganization(organizationId: number) {
    const response = await http.get(`/recall-notifications`, { params: { organizationId } })
    return Array.isArray(response.data)
      ? response.data as RecallNotification[]
      : unwrapApi<RecallNotification[]>(response.data)
  },
  async acknowledge(id: number, processingNotes?: string) {
    const response = await http.put(`/recall-notifications/${id}/acknowledge`, { processingNotes })
    return response.data
  },
}