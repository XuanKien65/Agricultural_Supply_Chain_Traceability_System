import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, Search, Layers, ArrowRight, CheckCircle2 } from 'lucide-react'

/**
 * ProductsPage - Danh sách các sản phẩm nông sản
 * Cho phép quản lý các loại sản phẩm và chứng nhận của chúng
 */
export function ProductsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // ==========================================
  // CODE GỐC: Fetch danh sách sản phẩm
  // ==========================================
  const { data, isLoading } = useQuery({
    queryKey: ['products', searchTerm],
    queryFn: async () => {
      return {
        items: [
          {
            id: '1',
            name: 'Dâu tây tươi Đà Lạt',
            category: 'Trái cây',
            unit: 'kg',
            description: 'Dâu tây giống Nhật Bản trồng theo tiêu chuẩn Organic',
            certifications: ['VietGAP', 'Organic EU'],
            createdAt: '2026-01-10',
            status: 'Active',
          },
          {
            id: '2',
            name: 'Cà chua bi Organic',
            category: 'Rau củ quả',
            unit: 'hộp 500g',
            description: 'Cà chua bi ngọt giàu vitamin trồng nhà kính',
            certifications: ['GlobalGAP', 'Organic'],
            createdAt: '2026-01-12',
            status: 'Active',
          },
          {
            id: '3',
            name: 'Dưa lưới ruột cam Nhật Bản',
            category: 'Trái cây',
            unit: 'quả (1.5kg)',
            description: 'Dưa lưới độ ngọt Brix > 14',
            certifications: ['VietGAP', 'ISO 22000'],
            createdAt: '2026-01-15',
            status: 'Active',
          },
        ],
        totalCount: 3,
      }
    },
  })

  // ==========================================
  // NEW CODE: Lọc danh sách & UI card
  // ==========================================
  const filteredProducts = data?.items?.filter(
    (p) =>
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Danh Mục Sản Phẩm Nông Sản
            </h1>
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý chủng loại nông sản, tiêu chuẩn đóng gói và các chứng nhận chất lượng đính kèm.
          </p>
        </div>

        <Button
          onClick={() => navigate('/products/new')}
          className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm font-semibold"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm Sản Phẩm Mới</span>
        </Button>
      </div>

      {/* Tìm kiếm */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm sản phẩm theo tên, danh mục (Trái cây, Rau xanh...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bảng danh sách */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
              Danh Sách Nông Sản Đã Đăng Ký
            </CardTitle>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
              {filteredProducts?.length || 0} Sản phẩm
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Đang tải danh mục sản phẩm...</div>
          ) : !filteredProducts || filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Không tìm thấy sản phẩm nào.</div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Tên Sản Phẩm</TableHead>
                  <TableHead className="font-bold text-slate-700">Phân Loại</TableHead>
                  <TableHead className="font-bold text-slate-700">Quy Cách / Đơn Vị</TableHead>
                  <TableHead className="font-bold text-slate-700">Chứng Nhận Chất Lượng</TableHead>
                  <TableHead className="font-bold text-slate-700">Trạng Thái</TableHead>
                  <TableHead className="font-bold text-slate-700">Ngày Tạo</TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: any) => (
                  <TableRow key={product.id} className="hover:bg-slate-50/80 transition">
                    <TableCell className="font-bold text-slate-900">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {product.unit || 'kg'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.certifications?.map((c: string) => (
                          <span
                            key={c}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{c}</span>
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                        {product.status === 'Active' ? 'Đang hoạt động' : product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="gap-1 text-xs hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                      >
                        <span>Chi tiết</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
