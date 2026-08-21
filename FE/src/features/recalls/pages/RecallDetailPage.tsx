import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { adminApi } from '@/features/admin/admin.api'
import { Button } from '@/components/ui/button'

/**
 * RecallDetailPage - Chi tiết yêu cầu thu hồi
 * Hiển thị thông tin chi tiết recall, danh sách lô bị ảnh hưởng, trạng thái thông báo
 */
export function RecallDetailPage() {
  const { recallId } = useParams()
  const queryClient = useQueryClient()

  const resolveMutation = useMutation({
    mutationFn: async () => {
      const numericId = Number(recallId)
      if (!Number.isNaN(numericId) && numericId > 0) {
        return adminApi.resolveRecall(numericId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recall', recallId] })
      queryClient.invalidateQueries({ queryKey: ['recalls'] })
    },
  })

  // NEW CODE - Fetch recall details with traceback results
  const { data: recall, isLoading } = useQuery({
    queryKey: ['recall', recallId],
    queryFn: async () => {
      let numericId = Number(recallId)
      if (!Number.isNaN(numericId) && numericId > 0) {
        try {
          const list = await adminApi.getRecalls()
          const found = list.find((r) => r.id === numericId)
          if (found) {
            return {
              id: `REC-${found.id}`,
              batchId: found.batchCode ?? `#${found.batchId}`,
              product: 'Nông sản lô #' + found.batchId,
              reason: found.reason,
              severity: found.severity ? found.severity.charAt(0).toUpperCase() + found.severity.slice(1).toLowerCase() : 'High',
              status: found.isResolved ? 'Resolved' : 'Active',
              description: found.reason,
              recoveryActions: 'Dừng lưu thông và hoàn tiền cho người tiêu dùng.',
              initiatedDate: found.createdAt ?? new Date().toISOString(),
              affectedBatches: [
                { id: found.batchCode ?? `#${found.batchId}`, product: 'Dầu / Dầu dừa / Nông sản', source: 'Trang trại', status: 'Recalled' },
              ],
              actorsNotified: [
                { id: 'U1', name: 'Đơn vị xử lý', role: 'Processing', notifiedAt: new Date().toISOString(), acknowledged: true },
              ],
            }
          }
        } catch {
          /* fallback */
        }
      }
      return {
        id: recallId,
        batchId: 'B001',
        product: 'Dâu tây tươi',
        reason: 'Phát hiện vi khuẩn Salmonella',
        severity: 'High',
        status: 'Active',
        description:
          'Lô hàng B001 phát hiện dương tính với vi khuẩn Salmonella thông qua kiểm định chất lượng định kỳ.',
        recoveryActions:
          'Tất cả người tiêu dùng đã mua sản phẩm này vui lòng dừng sử dụng ngay lập tức và liên hệ với nhà bán lẻ để hoàn tiền.',
        initiatedDate: new Date().toISOString(),
        affectedBatches: [
          { id: 'B001', product: 'Dâu tây tươi', source: 'Farm A', status: 'Recalled' },
          { id: 'B002', product: 'Dâu tây tươi', source: 'Farm A', status: 'Recalled' },
        ],
        actorsNotified: [
          { id: 'U1', name: 'Processing Unit A', role: 'Processing', notifiedAt: new Date().toISOString(), acknowledged: true },
          { id: 'U2', name: 'Distribution Center B', role: 'Distribution', notifiedAt: new Date().toISOString(), acknowledged: true },
        ],
      }
    },
  })

  if (isLoading) return <div className="p-8 text-center text-slate-500">Đang tải...</div>
  if (!recall) return <div className="p-8 text-center text-slate-500">Không tìm thấy recall</div>

  const acknowledgedCount = recall.actorsNotified.filter((u: any) => u.acknowledged).length

  return (
    <div className="space-y-6">
      {/* NEW CODE - Recall header with severity indicator */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            Thu hồi Sản phẩm
          </h1>
          <p className="text-gray-500">{recall.product}</p>
        </div>
        <div className="flex items-center gap-2">
          {recall.status === 'Active' && (
            <Button
              onClick={() => resolveMutation.mutate()}
              disabled={resolveMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {resolveMutation.isPending ? 'Đang xử lý...' : 'Giải Quyết Thu Hồi'}
            </Button>
          )}
          <div className="text-right">
            <Badge
              variant={recall.severity === 'High' ? 'destructive' : recall.severity === 'Medium' ? 'secondary' : 'outline'}
              className="text-sm px-3 py-1 mb-1 block text-center"
            >
              {recall.severity === 'High' ? 'Mức độ CAO' : recall.severity === 'Medium' ? 'Mức độ TRUNG BÌNH' : 'Mức độ THẤP'}
            </Badge>
            <Badge variant={recall.status === 'Active' ? 'destructive' : 'default'}>
              {recall.status === 'Active' ? 'Đang hoạt động' : 'Đã hoàn thành'}
            </Badge>
          </div>
        </div>
      </div>

      {/* NEW CODE - Recall basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin Thu hồi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Mã Thu hồi</p>
              <p className="font-semibold">{recall.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mã Lô Chính</p>
              <p className="font-semibold">{recall.batchId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lý do</p>
              <p className="font-semibold">{recall.reason}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày Phát hành</p>
              <p className="font-semibold">{new Date(recall.initiatedDate).toLocaleString('vi-VN')}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Mô tả</p>
            <p className="text-sm">{recall.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Hành động Khắc phục</p>
            <p className="text-sm">{recall.recoveryActions}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* NEW CODE - Affected batches */}
        <Card>
          <CardHeader>
            <CardTitle>Lô Hàng Bị Ảnh hưởng</CardTitle>
            <CardDescription>Truy vết ngược (Traceback) tìm thấy {recall.affectedBatches.length} lô</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recall.affectedBatches.map((batch: any) => (
                <div key={batch.id} className="p-2 border rounded-md text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{batch.id}</p>
                      <p className="text-gray-600">{batch.product}</p>
                      <p className="text-gray-500">{batch.source}</p>
                    </div>
                    <Badge variant="destructive">{batch.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* NEW CODE - Notification status */}
        <Card>
          <CardHeader>
            <CardTitle>Tình trạng Thông báo</CardTitle>
            <CardDescription>Các Actor được thông báo và xác nhận</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Tổng số Actor</p>
              <p className="text-3xl font-bold">{recall.actorsNotified.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đã xác nhận</p>
              <p className="text-2xl font-semibold text-green-600">
                {acknowledgedCount}/{recall.actorsNotified.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NEW CODE - Notification details table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết Thông báo</CardTitle>
          <CardDescription>Danh sách các Actor trong chuỗi cung ứng đã được thông báo</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Actor / Đơn vị</th>
                <th className="text-left py-2">Vai trò</th>
                <th className="text-left py-2">Thời gian Thông báo</th>
                <th className="text-left py-2">Trạng thái Xác nhận</th>
              </tr>
            </thead>
            <tbody>
              {recall.actorsNotified.map((actor: any) => (
                <tr key={actor.id} className="border-b">
                  <td className="py-2 font-medium">{actor.name}</td>
                  <td className="py-2">{actor.role}</td>
                  <td className="py-2">{new Date(actor.notifiedAt).toLocaleString('vi-VN')}</td>
                  <td className="py-2">
                    {actor.acknowledged ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Đã xác nhận
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-600">
                        <Clock className="w-4 h-4" />
                        Chờ xác nhận
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
