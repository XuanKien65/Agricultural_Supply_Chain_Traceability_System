import { http } from '@/lib/api/http'

export interface BatchLineageNode {
  batchId: number
  batchCode: string
  productName?: string
  organizationName?: string
  eventType?: string
  createdAt?: string
  parentBatches?: BatchLineageNode[]
  childBatches?: BatchLineageNode[]
}

export interface LookupItem {
  key?: string
  value?: string
  name?: string
  description?: string
  code?: string
}

export const publicTraceApi = {
  /** GET /api/v1/public/trace/{batchId} */
  async getPublicTrace(batchId: string | number) {
    try {
      const res = await http.get(`/v1/public/trace/${batchId}`)
      return res.data?.result ?? res.data?.data ?? res.data
    } catch {
      const res = await http.get(`/trace/${batchId}`)
      return res.data?.result ?? res.data?.data ?? res.data
    }
  },

  /** GET /api/v1/public/trace/{batchId}/lineage */
  async getBatchLineage(batchId: string | number): Promise<BatchLineageNode> {
    try {
      const res = await http.get(`/v1/public/trace/${batchId}/lineage`)
      return res.data?.result ?? res.data?.data ?? res.data
    } catch {
      const res = await http.get(`/trace/${batchId}/lineage`)
      return res.data?.result ?? res.data?.data ?? res.data
    }
  },

  /** GET /api/v1/roles */
  async getRoles(): Promise<LookupItem[]> {
    const res = await http.get('/v1/roles')
    return res.data?.result ?? res.data?.data ?? res.data ?? []
  },

  /** GET /api/v1/organization-types */
  async getOrganizationTypes(): Promise<LookupItem[]> {
    const res = await http.get('/v1/organization-types')
    return res.data?.result ?? res.data?.data ?? res.data ?? []
  },

  /** GET /api/v1/event-types */
  async getEventTypes(): Promise<LookupItem[]> {
    const res = await http.get('/v1/event-types')
    return res.data?.result ?? res.data?.data ?? res.data ?? []
  },
}
