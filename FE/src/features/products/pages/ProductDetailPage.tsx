import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, CheckCircle2, Layers, Calendar, PlusCircle, ArrowRight } from 'lucide-react'

/**
 * ProductDetailPage - Chi tiết sản phẩm
 * Hiển thị thông tin chi tiết của một loại sản phẩm, bao gồm chứng nhận và lịch sử lô hàng
 */
export function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()

  // ==========================================
  // CODE GỐC: Fetch chi tiết sản phẩm
  // ==========================================
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const idStr = String(productId || '1')
      if (idStr === '2') {
        return {
          id: '2',
          name: 'Cà chua bi Organic',
          category: 'Rau củ quả',
          unit: 'hộp 500g',
          description: 'Cà chua bi ngọt giàu vitamin C trồng trong nhà kính công nghệ cao, kiểm soát sinh học.',
          certifications: ['GlobalGAP', 'Organic EU'],
          createdAt: '2026-01-12',
          updatedAt: '2026-01-18',
          status: 'Active',
          recentBatches: [
            { id: 'B002', quantity: 1200, harvestDate: '2026-01-18', status: 'Completed' },
          ],
        }
      }

      if (idStr === '3') {
        return {
          id: '3',
          name: 'Dưa lưới ruột cam Nhật Bản',
          category: 'Trái cây',
          unit: 'quả (1.5kg)',
          description: 'Dưa lưới ruột cam giống Nhật Bản đạt độ ngọt Brix > 14, thịt giòn mọng nước.',
          certifications: ['VietGAP', 'ISO 22000'],
          createdAt: '2026-01-15',
          updatedAt: '2026-01-20',
          status: 'Active',
          recentBatches: [
            { id: 'B003', quantity: 300, harvestDate: '2026-01-20', status: 'Completed' },
          ],
        }
      }

      return {
        id: idStr,
        name: 'Dâu tây tươi Đà Lạt',
        category: 'Trái cây đặc sản',
        unit: 'kg',
        description: 'Dâu tây giống New Zealand canh tác nhà kính công nghệ cao, thu hoạch thủ công vào sáng sớm.',
        certifications: ['VietGAP', 'Organic EU/USDA', 'HACCP'],
        createdAt: '2026-01-10',
        updatedAt: '2026-01-15',
        status: 'Active',
        recentBatches: [
          { id: 'B001', quantity: 500, harvestDate: '2026-01-15', status: 'Completed' },
          { id: 'B004', quantity: 750, harvestDate: '2026-01-22', status: 'In Progress' },
        ],
      }
    },
  })

  if (isLoading) return <div className="p-8 text-center text-slate-500">Đang tải thông tin sản phẩm...</div>
  if (!product) return <div className="p-8 text-center text-slate-500">Không tìm thấy sản phẩm</div>

  // ==========================================
  // NEW CODE: Giao diện chi tiết sản phẩm & Lịch sử lô hàng
  // ==========================================
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/products')}
            className="gap-1.5 bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                {product.status === 'Active' ? 'Đang áp dụng' : product.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân loại: <strong className="text-slate-700">{product.category}</strong> &bull; Đơn vị tính: <span className="font-mono">{product.unit}</span>
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate('/batches/new')}
          className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo Lô Hàng Mới Cho Sản Phẩm Này</span>
        </Button>
      </div>

      {/* Grid 2 Cột: Thông tin & Chứng nhận */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Thông Tin Chung
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Tên Nông Sản:</span>
              <strong className="text-slate-900">{product.name}</strong>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Phân Loại:</span>
              <strong className="text-slate-900">{product.category}</strong>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Quy Cách Chuẩn:</span>
              <strong className="text-slate-900">{product.unit}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ngày Đăng Ký:</span>
              <span className="font-mono text-slate-700">{product.createdAt}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Chứng Nhận Đã Đạt
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 pt-1">
              {product.certifications?.map((cert: string) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{cert}</span>
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
              Các chứng nhận này sẽ tự động được hiển thị trên Cổng Tra cứu Nguồn gốc khi người tiêu dùng quét mã QR của lô hàng.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mô tả chi tiết */}
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-900">Mô Tả Canh Tác & Sản Phẩm</CardTitle>
        </CardHeader>
        <CardContent className="text-xs sm:text-sm text-slate-600">
          <p>{product.description}</p>
        </CardContent>
      </Card>

      {/* Danh sách các lô hàng gần đây */}
      <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Các Lô Hàng Thuộc Sản Phẩm Này
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Lịch sử sản xuất và định danh QR của từng mẻ thu hoạch
              </CardDescription>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
              {product.recentBatches?.length || 0} Lô hàng
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-bold text-slate-700">Mã Lô</TableHead>
                <TableHead className="font-bold text-slate-700">Sản Lượng</TableHead>
                <TableHead className="font-bold text-slate-700">Ngày Thu Hoạch</TableHead>
                <TableHead className="font-bold text-slate-700">Trạng Thái</TableHead>
                <TableHead className="font-bold text-slate-700 text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.recentBatches?.map((batch: any) => (
                <TableRow key={batch.id} className="hover:bg-slate-50/80 transition">
                  <TableCell className="font-mono font-bold text-emerald-700">{batch.id}</TableCell>
                  <TableCell className="font-medium text-slate-800">
                    {batch.quantity.toLocaleString('vi-VN')} {product.unit}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-mono">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{batch.harvestDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        batch.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }
                    >
                      {batch.status === 'Completed' ? 'Đã hoàn thành' : 'Đang xử lý'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/batches/${batch.id}`)}
                      className="gap-1 text-xs hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <span>Xem Lô</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
