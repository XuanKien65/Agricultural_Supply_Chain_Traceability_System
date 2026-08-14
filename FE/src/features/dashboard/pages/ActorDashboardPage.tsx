import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, PlusCircle, ShieldCheck, AlertTriangle, ArrowRight, Truck } from 'lucide-react'

/**
 * ActorDashboardPage - Bảng điều khiển tổng quan cho các Actor trong chuỗi cung ứng
 * Hiển thị thống kê nhanh, các lô hàng gần đây và lối tắt thực hiện nghiệp vụ.
 */
export function ActorDashboardPage() {
  const navigate = useNavigate()

  // Fetch dữ liệu tổng quan dashboard
  const { data: stats, isLoading } = useQuery({
    queryKey: ['actor-dashboard-stats'],
    queryFn: async () => {
      // Thay thế bằng API thực tế của bạn sau này
      return {
        totalBatches: 24,
        activeBatches: 18,
        pendingInspections: 3,
        activeRecalls: 0,
        recentBatches: [
          { id: 'B001', product: 'Dâu tây tươi', harvestDate: '2026-06-01', status: 'Active' },
          { id: 'B002', product: 'Cà chua bi', harvestDate: '2026-06-03', status: 'Active' },
          { id: 'B003', product: 'Dưa lưới', harvestDate: '2026-06-05', status: 'Processing' },
        ],
      }
    },
  })

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Đang tải bảng điều khiển...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bảng Điều Khiển Chuỗi Cung Ứng</h1>
          <p className="text-sm text-gray-500">Quản lý lô hàng, ghi nhận sự kiện và theo dõi tiến độ công đoạn.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/batches/new')} className="gap-2">
            <PlusCircle className="w-4 h-4" /> Tạo Lô Hàng Mới
          </Button>
        </div>
      </div>

      {/* Thống kê nhanh (Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tổng số Lô Hàng</CardTitle>
            <Package className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBatches}</div>
            <p className="text-xs text-gray-500 mt-1">Đã đăng ký trong hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Đang hoạt động</CardTitle>
            <Truck className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.activeBatches}</div>
            <p className="text-xs text-gray-500 mt-1">Đang luân chuyển trong chuỗi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Chờ Kiểm Định</CardTitle>
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats?.pendingInspections}</div>
            <p className="text-xs text-gray-500 mt-1">Cần thực hiện kiểm tra QC</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Cảnh Báo Thu Hồi</CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.activeRecalls}</div>
            <p className="text-xs text-gray-500 mt-1">Sự cố chất lượng cần xử lý</p>
          </CardContent>
        </Card>
      </div>

      {/* Lô hàng gần đây & Lối tắt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách lô hàng gần đây */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Lô Hàng Gần Đây</CardTitle>
              <CardDescription>Các lô hàng mới nhất được cập nhật trạng thái</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/batches')} className="gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentBatches?.map((batch: any) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate(`/batches/${batch.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-700 rounded-md font-semibold text-xs">
                      {batch.id}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{batch.product}</p>
                      <p className="text-xs text-gray-500">Ngày thu hoạch: {batch.harvestDate}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                    {batch.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lối tắt chức năng nhanh (Quick Actions) */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác Nhanh</CardTitle>
            <CardDescription>Truy cập nhanh các chức năng nghiệp vụ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => navigate('/batches/new')}
            >
              <PlusCircle className="w-4 h-4 text-green-600" />
              Tạo lô hàng mới & Sinh mã QR
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => navigate('/events')}
            >
              <Truck className="w-4 h-4 text-blue-600" />
              Ghi nhận sự kiện chuỗi cung ứng
            </Button>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}