import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardCheck, PlusCircle, Search, CheckCircle2, XCircle, ArrowRight, Calendar } from 'lucide-react'

/**
 * QualityInspectionsPage - Danh sách kiểm định chất lượng
 * Quản lý các kết quả kiểm định chất lượng của lô hàng (đạt/không đạt, chỉ tiêu chất lượng)
 */
export function QualityInspectionsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // ==========================================
  // CODE GỐC: Fetch danh sách kiểm định
  // ==========================================
  const { data, isLoading } = useQuery({
    queryKey: ['inspections', searchTerm],
    queryFn: async () => {
      return {
        items: [
          {
            id: 'I001',
            batchId: 'B001',
            inspectionDate: '2026-01-15 10:30',
            inspector: 'Đội KCS Nông trại Đà Lạt',
            result: 'Pass',
            passedCount: 5,
            totalCount: 5,
            notes: 'Lô hàng dâu tây đạt 5/5 tiêu chí VietGAP xuất khẩu.',
          },
          {
            id: 'I002',
            batchId: 'B002',
            inspectionDate: '2026-01-18 09:30',
            inspector: 'Phòng Lab Nông nghiệp Xanh',
            result: 'Pass',
            passedCount: 5,
            totalCount: 5,
            notes: 'Hàm lượng nitrat và vi sinh đạt chuẩn Organic quốc tế.',
          },
          {
            id: 'I003',
            batchId: 'B005',
            inspectionDate: '2026-01-19 14:00',
            inspector: 'Trung tâm Giám định Chất lượng',
            result: 'Fail',
            passedCount: 3,
            totalCount: 5,
            notes: 'Phát hiện dư lượng thuốc BVTV vượt ngưỡng quy định 0.05mg/kg.',
          },
        ],
        totalCount: 3,
      }
    },
  })

  // ==========================================
  // NEW CODE: Lọc và giao diện bảng chuyên nghiệp
  // ==========================================
  const filteredInspections = data?.items?.filter(
    (item) =>
      !searchTerm ||
      item.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.inspector.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Kiểm Định Chất Lượng & QA/QC
            </h1>
            <span className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
              <ClipboardCheck className="w-5 h-5" />
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Ghi nhận kết quả xét nghiệm mẫu, dư lượng hóa chất, vi sinh và đánh giá đạt chuẩn VietGAP/GlobalGAP.
          </p>
        </div>

        <Button
          onClick={() => navigate('/quality/new')}
          className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Lập Phiếu Kiểm Định Mới</span>
        </Button>
      </div>

      {/* Thanh tìm kiếm */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm phiếu kiểm định theo mã lô (B001...), mã phiếu (I001...), người kiểm tra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bảng danh sách phiếu kiểm định */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Nhật Ký Giám Định Chất Lượng
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Chứng thư và kết quả phân tích theo lô nông sản
              </CardDescription>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-md">
              {filteredInspections?.length || 0} Biên bản
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Đang tải danh sách kiểm định...</div>
          ) : !filteredInspections || filteredInspections.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Không tìm thấy biên bản kiểm định nào.</div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Mã Biên Bản</TableHead>
                  <TableHead className="font-bold text-slate-700">Mã Lô Hàng</TableHead>
                  <TableHead className="font-bold text-slate-700">Thời Gian Giám Định</TableHead>
                  <TableHead className="font-bold text-slate-700">Đơn Vị / KCS</TableHead>
                  <TableHead className="font-bold text-slate-700">Kết Quả</TableHead>
                  <TableHead className="font-bold text-slate-700">Đánh Giá Tiêu Chí</TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.map((inspection: any) => (
                  <TableRow key={inspection.id} className="hover:bg-slate-50/80 transition">
                    <TableCell className="font-mono font-bold text-slate-800">
                      {inspection.id}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-emerald-700">
                      {inspection.batchId}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inspection.inspectionDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-700">
                      {inspection.inspector}
                    </TableCell>
                    <TableCell>
                      {inspection.result === 'Pass' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ĐẠT CHUẨN</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>KHÔNG ĐẠT</span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <span className="font-bold text-slate-800">{inspection.passedCount}/{inspection.totalCount}</span> tiêu chí đạt
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/quality/${inspection.id}`)}
                        className="gap-1 text-xs hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
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
