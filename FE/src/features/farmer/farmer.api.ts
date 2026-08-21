import { http } from '@/lib/api/http'
import type { FarmerBatchDto } from '@/features/batches/batches.types'

export interface FarmerDashboardResponse {
  totalBatches: number
  inProgressBatches: number
  completedBatches: number
  totalWeight: number
  recentBatches: FarmerBatchDto[]
}

export const farmerApi = {
  /** GET /api/farmer/dashboard?organizationId={orgId} */
  async getDashboard(organizationId: number): Promise<FarmerDashboardResponse> {
    try {
      const res = await http.get('/farmer/dashboard', { params: { organizationId } })
      const data = res.data?.result ?? res.data?.data ?? res.data
      return {
        totalBatches: data.totalBatches ?? data.total ?? 0,
        inProgressBatches: data.inProgressBatches ?? data.inProgress ?? 0,
        completedBatches: data.completedBatches ?? data.completed ?? 0,
        totalWeight: data.totalWeight ?? data.weight ?? 0,
        recentBatches: data.recentBatches ?? data.items ?? [],
      }
    } catch {
      // Fallback API /farmer/batches
      const res = await http.get('/farmer/batches', { params: { organizationId, pageSize: 20 } })
      const page = res.data?.result ?? res.data?.data ?? res.data
      const items: FarmerBatchDto[] = page?.items ?? []
      return {
        totalBatches: page?.totalCount ?? items.length,
        inProgressBatches: items.filter((x) => x.status === 'ACTIVE' || x.status === 'Processing').length,
        completedBatches: items.filter((x) => x.status === 'COMPLETED' || x.status === 'Distributed').length,
        totalWeight: items.reduce((sum, x) => sum + (x.weight || 0), 0),
        recentBatches: items.slice(0, 5),
      }
    }
  },
}
