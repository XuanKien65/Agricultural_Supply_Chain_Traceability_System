import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, PlusCircle, Scale, ShieldCheck, AlertTriangle, ArrowRight, Truck } from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth.store'
import { useFarmerBatches } from '@/features/batches/batches.queries'
import { getRecentBatches } from '@/features/batches/recentBatches'

/**
 * ActorDashboardPage - Bảng điều khiển tổng quan cho các Actor trong chuỗi cung ứng.
 * Farmer xem thống kê lô hàng thật của tổ chức mình; Operator/Inspector/Admin xem
 * danh sách lô đã tra cứu gần đây (không có API tổng hợp toàn hệ thống cho các vai trò này).
 */
export function ActorDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const role = user?.role
  const canCreateBatch = role === 'FARMER'
  const canRecordEvent = role === 'FARMER' || role === 'OPERATOR'
  const canQuality = role === 'INSPECTOR' || role === 'ADMIN'
  const isFarmer = role === 'FARMER'

  const { data: farmerPage, isLoading: farmerLoading } = useFarmerBatches(isFarmer ? (user?.organizationId ?? 0) : 0)
  const farmerBatches = farmerPage?.items ?? []
  const recentViewed = user && !isFarmer ? getRecentBatches(user.id) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bảng Điều Khiển Chuỗi Cung Ứng</h1>
          <p className="text-sm text-gray-500">Quản lý lô hàng, ghi nhận sự kiện và theo dõi tiến độ công đoạn.</p>
        </div>
        {canCreateBatch && (
          <div className="flex gap-2">
            <Button onClick={() => navigate('/batches/new')} className="gap-2">
              <PlusCircle className="w-4 h-4" /> Tạo Lô Hàng Mới
            </Button>
          </div>
        )}
      </div>

      {/* Thống kê thật — chỉ Farmer có API tổng hợp theo tổ chức */}
      {isFarmer && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Tổng số Lô Hàng</CardTitle>
              <Package className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farmerLoading ? '…' : farmerBatches.length}</div>
              <p className="text-xs text-gray-500 mt-1">Do tổ chức bạn tạo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Đang hoạt động</CardTitle>
              <Truck className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {farmerLoading ? '…' : farmerBatches.filter((x) => x.status === 'ACTIVE').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Đang luân chuyển trong chuỗi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Tổng khối lượng</CardTitle>
              <Scale className="w-5 h-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {farmerLoading ? '…' : farmerBatches.reduce((sum, x) => sum + x.weight, 0).toLocaleString('vi-VN')} kg
              </div>
              <p className="text-xs text-gray-500 mt-1">Tất cả lô đã tạo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Cảnh Báo Thu Hồi</CardTitle>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {farmerLoading ? '…' : farmerBatches.filter((x) => x.status === 'RECALLED').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Cần xử lý</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Thông tin tổ chức — cho vai trò không có API thống kê tổng hợp */}
      {!isFarmer && (
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm">{user?.organizationName ?? 'Chưa gán tổ chức'}</p>
              <p className="text-xs text-gray-500">{user?.organizationType ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lô hàng gần đây & Lối tắt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{isFarmer ? 'Lô Hàng Gần Đây' : 'Đã Xem Gần Đây'}</CardTitle>
              <CardDescription>
                {isFarmer ? 'Các lô hàng mới nhất của tổ chức bạn' : 'Các lô hàng bạn vừa tra cứu trên thiết bị này'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/batches')} className="gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isFarmer ? (
              <div className="space-y-3">
                {farmerLoading && <p className="text-sm text-gray-500">Đang tải…</p>}
                {!farmerLoading && farmerBatches.length === 0 && (
                  <p className="text-sm text-gray-500">Chưa có lô hàng nào.</p>
                )}
                {farmerBatches.slice(0, 5).map((batch) => (
                  <div
                    key={batch.batchId}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => navigate(`/batches/${batch.batchId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 text-green-700 rounded-md font-semibold text-xs">
                        {batch.batchCode}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{batch.productName}</p>
                        <p className="text-xs text-gray-500">
                          {batch.weight.toLocaleString('vi-VN')} {batch.unit}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                      {batch.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentViewed.length === 0 && (
                  <p className="text-sm text-gray-500">Chưa có lô hàng nào được xem trên thiết bị này.</p>
                )}
                {recentViewed.map((item) => (
                  <div
                    key={item.batchId}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => navigate(`/batches/${item.batchId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 text-green-700 rounded-md font-semibold text-xs">
                        {item.batchCode}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.productName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lối tắt chức năng nhanh (Quick Actions) */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác Nhanh</CardTitle>
            <CardDescription>Truy cập nhanh các chức năng nghiệp vụ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {canCreateBatch && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate('/batches/new')}
              >
                <PlusCircle className="w-4 h-4 text-green-600" />
                Tạo lô hàng mới & Sinh mã QR
              </Button>
            )}
            {canRecordEvent && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate('/record-event')}
              >
                <Truck className="w-4 h-4 text-blue-600" />
                Ghi nhận sự kiện chuỗi cung ứng
              </Button>
            )}
            {canQuality && (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/quality')}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Kiểm định chất lượng (QC)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/recalls')}
                >
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Quản lý thu hồi sản phẩm
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
