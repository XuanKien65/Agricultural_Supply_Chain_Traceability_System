import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, XCircle, ClipboardCheck, Calendar, User, FileText, ArrowRight } from 'lucide-react'

/**
 * InspectionDetailPage - Chi tiết kiểm định chất lượng
 * Hiển thị chi tiết kết quả kiểm định, các tiêu chí đạt/không đạt
 */
export function InspectionDetailPage() {
  const { inspectionId } = useParams()
  const navigate = useNavigate()

  // ==========================================
  // CODE GỐC: Fetch chi tiết kiểm định
  // ==========================================
  const { data: inspection, isLoading } = useQuery({
    queryKey: ['inspection', inspectionId],
    queryFn: async () => {
      return {
        id: inspectionId || 'I001',
        batchId: 'B001',
        inspectionDate: '2026-01-15 10:30:00',
        inspector: 'Đội KCS Nông trại Đà Lạt & Phòng Lab Trung tâm',
        result: 'Pass',
        criteria: [
          { name: 'Độ tươi & hình thái cảm quan', passed: true, note: 'Tươi mới, cuống xanh' },
          { name: 'Màu sắc & độ đồng đều quy cách size', passed: true, note: 'Đồng đều 95%' },
          { name: 'Tỷ lệ dập nát / tổn thương cơ học (< 3%)', passed: true, note: 'Dập nát 0.5%' },
          { name: 'Dư lượng thuốc bảo vệ thực vật (Dưới ngưỡng MRL)', passed: true, note: 'Không phát hiện hoạt chất cấm' },
          { name: 'Chỉ tiêu vi sinh vật (Salmonella, E.Coli âm tính)', passed: true, note: 'Âm tính toàn phần' },
          { name: 'Hàm lượng kim loại nặng (Chì, Cadimi an toàn)', passed: true, note: 'Đạt chuẩn QCVN 8-2:2011/BYT' },
        ],
        notes: 'Lô hàng dâu tây đạt 6/6 tiêu chuẩn kiểm nghiệm chất lượng xuất khẩu theo quy định VietGAP và Organic EU. Đủ điều kiện đóng gói và dán tem định danh QR.',
        certificateUrl: null,
        createdAt: '2026-01-15 10:45:00',
      }
    },
  })

  if (isLoading) return <div className="p-8 text-center text-slate-500">Đang tải chi tiết biên bản kiểm định...</div>
  if (!inspection) return <div className="p-8 text-center text-slate-500">Không tìm thấy biên bản kiểm định</div>

  const passedCount = inspection.criteria.filter((c: any) => c.passed).length
  const totalCount = inspection.criteria.length
  const passRate = Math.round((passedCount / totalCount) * 100)

  // ==========================================
  // NEW CODE: Giao diện chi tiết biên bản QA/QC
  // ==========================================
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/quality')}
            className="gap-1.5 bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Biên Bản Giám Định {inspection.id}</h1>
              {inspection.result === 'Pass' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ĐẠT CHUẨN</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>KHÔNG ĐẠT</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mã Lô Hàng: <strong className="text-emerald-700 font-mono">{inspection.batchId}</strong>
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/batches/${inspection.batchId}`)}
          className="gap-2 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold"
        >
          <span>Xem Chi Tiết Lô Hàng</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Grid 2 Cột: Thông tin & Điểm số chất lượng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-teal-600" />
              Thông Tin Giám Định
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5 text-xs sm:text-sm">
            <div className="flex justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày kiểm định:
              </span>
              <strong className="text-slate-800 font-mono">{inspection.inspectionDate}</strong>
            </div>

            <div className="flex justify-between pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Cán bộ KCS / Lab:
              </span>
              <strong className="text-slate-800 text-right max-w-[200px]">{inspection.inspector}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Mã Lô Định Danh:</span>
              <strong className="text-emerald-700 font-mono">{inspection.batchId}</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Tóm Tắt Đánh Giá Chỉ Tiêu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex items-center justify-around">
            <div className="text-center">
              <span className="text-xs text-slate-500 block mb-1">Tiêu chí Đạt</span>
              <p className="text-3xl font-black text-emerald-600">{passedCount}/{totalCount}</p>
            </div>

            <div className="w-px h-12 bg-slate-200" />

            <div className="text-center">
              <span className="text-xs text-slate-500 block mb-1">Tỷ lệ Đạt Chuẩn</span>
              <p className="text-3xl font-black text-teal-600">{passRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chi tiết từng tiêu chí */}
      <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
            Chi Tiết Kết Quả Kiểm Nghiệm Từng Tiêu Chí
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Danh sách đối soát theo tiêu chuẩn an toàn vệ sinh thực phẩm
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-3">
          {inspection.criteria.map((c: any, idx: number) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                c.passed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-red-50/40 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {c.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{c.name}</h4>
                  {c.note && <p className="text-xs text-slate-500 mt-0.5">{c.note}</p>}
                </div>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                  c.passed
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}
              >
                {c.passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ghi chú & Khuyến cáo */}
      {inspection.notes && (
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Ghi Chú & Kết Luận Của Hội Đồng Kiểm Định
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p className="bg-slate-50 p-3 rounded-xl border border-slate-100">{inspection.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
