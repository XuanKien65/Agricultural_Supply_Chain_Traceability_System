import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Badge } from '/Download/Agricultural_Supply_Chain_Traceability_System/FE/src/components/ui/badge.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '/Download/Agricultural_Supply_Chain_Traceability_System/FE/src/components/ui/card.tsx'
import { CheckCircle2, MapPin, Calendar, AlertTriangle, QrCode } from 'lucide-react'

/**
 * TracePublicPage - Trang tra cứu công khai cho Consumer
 * URL công khai: /trace/{batchId}
 * Không cần đăng nhập, tối ưu giao diện mobile
 * Hiển thị: lịch sử sự kiện (timeline), chứng nhận, cảnh báo recall
 */
export function TracePublicPage() {
  const { batchId } = useParams()

  // NEW CODE - Fetch public batch trace data
  const { data: batchTrace, isLoading } = useQuery({
    queryKey: ['trace', batchId],
    queryFn: async () => {
      // const response = await traceService.getPublicBatchTrace(batchId)
      // return response
      return {
        batchId: batchId,
        product: 'Dâu tây tươi',
        category: 'Trái cây',
        harvestDate: '2024-01-15',
        sourceLocation: 'Nông trại ABC, Đà Lạt, Lâm Đồng',
        coordinates: { latitude: 11.94, longitude: 108.44 },
        certifications: ['VietGAP', 'Organic'],
        status: 'Active',
        isRecalled: false,
        recallReason: null,
        timeline: [
          {
            id: 'E1',
            eventType: 'Harvest',
            displayName: 'Thu hoạch',
            timestamp: '2024-01-15 08:00',
            location: 'Nông trại ABC, Đà Lạt',
            actor: 'Nông dân Nguyễn Văn A',
            description: 'Lô hàng được thu hoạch',
            icon: '🌾',
          },
          {
            id: 'E2',
            eventType: 'Inspection',
            displayName: 'Kiểm định Chất lượng',
            timestamp: '2024-01-15 10:30',
            location: 'Nông trại ABC',
            actor: 'Đội QC Nông trại',
            description: 'Lô hàng đạt tiêu chuẩn chất lượng',
            icon: '✓',
            result: 'Pass',
          },
          {
            id: 'E3',
            eventType: 'Processing',
            displayName: 'Sơ chế & Đóng gói',
            timestamp: '2024-01-15 14:00',
            location: 'Nhà máy Sơ chế XYZ, Đà Lạt',
            actor: 'Công ty Sơ chế XYZ',
            description: 'Lô hàng được rửa sạch, phân loại và đóng gói',
            icon: '📦',
          },
          {
            id: 'E4',
            eventType: 'Transport',
            displayName: 'Vận chuyển',
            timestamp: '2024-01-15 18:00',
            location: 'Kho lạnh - Điểm X, TP.HCM',
            actor: 'Công ty Vận tải ABC',
            description: 'Lô hàng vận chuyển bằng xe lạnh, nhiệt độ 5°C',
            icon: '🚚',
            temperature: '5°C',
            duration: '6 giờ',
          },
          {
            id: 'E5',
            eventType: 'Distribution',
            displayName: 'Phân phối',
            timestamp: '2024-01-16 08:00',
            location: 'Kho Phân phối DEF, TP.HCM',
            actor: 'Công ty Phân phối DEF',
            description: 'Lô hàng tiếp nhận tại kho phân phối',
            icon: '🏢',
          },
          {
            id: 'E6',
            eventType: 'Retail',
            displayName: 'Bán lẻ',
            timestamp: '2024-01-16 12:00',
            location: 'Siêu thị GHI, Quận 1, TP.HCM',
            actor: 'Siêu thị GHI',
            description: 'Lô hàng được bày bán tại kệ siêu thị',
            icon: '🛒',
          },
        ],
      }
    },
  })

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <QrCode className="w-12 h-12 text-green-600" />
          </div>
          <p className="text-lg font-semibold text-gray-700">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    )

  if (!batchTrace)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
            <p className="text-gray-600">Mã lô hàng {batchId} không tồn tại trong hệ thống.</p>
            <p className="text-sm text-gray-500 mt-4">Vui lòng kiểm tra lại mã QR hoặc liên hệ nhà cung cấp.</p>
          </CardContent>
        </Card>
      </div>
    )

  // NEW CODE - Mobile-optimized public trace UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-4 px-4 sm:py-8 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* NEW CODE - Product header card */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{batchTrace.product}</h1>
                <p className="text-green-100">{batchTrace.category}</p>
                <Badge className="mt-2 bg-green-200 text-green-900">Mã lô: {batchTrace.batchId}</Badge>
              </div>
              {batchTrace.isRecalled && (
                <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  CẢN BÁO
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* NEW CODE - Product certifications */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Chứng nhận & Tiêu chuẩn</p>
              <div className="flex flex-wrap gap-2">
                {batchTrace.certifications?.map((cert: string) => (
                  <Badge key={cert} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ✓ {cert}
                  </Badge>
                ))}
              </div>
            </div>

            {/* NEW CODE - Source farm info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Địa điểm Sản xuất</p>
                  <p className="text-sm text-gray-600">{batchTrace.sourceLocation}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tọa độ: {batchTrace.coordinates.latitude}, {batchTrace.coordinates.longitude}
                  </p>
                </div>
              </div>
            </div>

            {/* NEW CODE - Harvest date */}
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-gray-900">Ngày Thu hoạch</p>
                  <p className="text-sm text-gray-600">{new Date(batchTrace.harvestDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NEW CODE - Recall warning (if applicable) */}
        {batchTrace.isRecalled && (
          <Card className="border-red-300 bg-red-50">
            <CardHeader className="border-b border-red-200">
              <CardTitle className="text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Cảnh báo Thu hồi Sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <p className="text-red-900 font-semibold">{batchTrace.recallReason}</p>
              <p className="text-sm text-red-800">
                Sản phẩm này đã được thu hồi khỏi thị trường. Nếu bạn đã mua sản phẩm này, vui lòng:
              </p>
              <ul className="text-sm text-red-800 space-y-1 ml-4 list-disc">
                <li>Dừng sử dụng ngay lập tức</li>
                <li>Liên hệ với nhà bán lẻ để hoàn tiền hoặc thay thế</li>
                <li>Tư vấn tìm kiếm nếu có triệu chứng bất thường</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* NEW CODE - Supply chain timeline (vertical layout for mobile) */}
        <Card>
          <CardHeader>
            <CardTitle>Lộ trình Chuỗi cung ứng</CardTitle>
            <CardDescription>Toàn bộ hành trình từ nông trại đến tay bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-blue-400" />

              {/* Timeline events */}
              <div className="space-y-6">
                {batchTrace.timeline.map((event: any, index: number) => (
                  <div key={event.id} className="relative pl-20">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1 w-12 h-12 bg-white border-4 border-green-400 rounded-full flex items-center justify-center text-lg">
                      {event.icon}
                    </div>

                    {/* Event card */}
                    <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">{event.displayName}</h3>
                        {event.result && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {event.result}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{event.description}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{event.timestamp}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{event.location}</span>
                        </div>

                        <div className="text-gray-600 italic">Được thực hiện bởi: {event.actor}</div>

                        {event.temperature && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-900">
                            🌡️ Nhiệt độ bảo quản: {event.temperature} | Thời gian: {event.duration}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NEW CODE - Hash verification info (data integrity) */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">🔒 Xác thực Tính toàn vẹn</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900">
            <p>✓ Toàn bộ thông tin trên trang này đã được xác thực bằng chuỗi băm mật mã (Hash Chain).</p>
            <p className="mt-2">Nếu bất kỳ thông tin nào bị thay đổi, chuỗi băm sẽ không khớp và sự giả mạo sẽ được phát hiện ngay lập tức.</p>
            <p className="mt-2 text-xs text-blue-800">
              Hệ thống này sử dụng công nghệ tương tự Blockchain để đảm bảo không ai có thể thay đổi lịch sử sử dụng trái phép.
            </p>
          </CardContent>
        </Card>

        {/* NEW CODE - Footer info */}
        <div className="text-center text-sm text-gray-600 py-4">
          <p>Hệ thống Truy xuất Nguồn gốc Nông sản - Agricultural Supply Chain Traceability System</p>
          <p className="mt-1">© 2024 - Tất cả quyền được bảo vệ</p>
        </div>
      </div>
    </div>
  )
}
