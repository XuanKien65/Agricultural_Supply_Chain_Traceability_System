import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Calendar, AlertTriangle, QrCode, ShieldCheck, Home } from 'lucide-react'
import { http } from '@/lib/api/http'
import { EVENT_TYPE_LABELS, type EventType } from '@/features/events/events.types'

const EVENT_ICONS: Record<string, string> = {
  HARVEST: '🌾',
  PROCESS: '⚙️',
  PACKAGE: '📦',
  TRANSPORT: '🚚',
  DISTRIBUTE: '🏢',
  RETAIL: '🛒',
}

interface PublicTraceResponse {
  batch: {
    id: number
    productName: string
    productUnit?: string | null
    producerOrganizationName: string
    qrCode: string
    harvestDate?: string | null
    weight: number
    status: string
    createdAt: string
  }
  events: Array<{
    id: number
    eventType: string
    eventTime: string
    organizationName?: string | null
    performedByUserName?: string | null
    location?: string | null
    additionalData?: string | null
    previousHash?: string | null
    currentHash: string
  }>
  inspections: Array<{
    id: number
    inspectorOrganizationName?: string | null
    result?: string | null
    inspectionDate?: string | null
    notes?: string | null
  }>
  certificates: Array<{
    id: number
    certificateType?: string | null
    issuingOrganization?: string | null
    fileUrl?: string | null
    issuedDate?: string | null
    expirationDate?: string | null
  }>
  hashChainValid: boolean
}

/**
 * TracePublicPage - Trang tra cứu công khai cho Consumer
 * URL công khai: /trace/{batchId}
 * Không cần đăng nhập, tối ưu giao diện mobile
 * Hiển thị: lịch sử sự kiện (timeline), chứng nhận, cảnh báo recall
 */
export function TracePublicPage() {
  const { batchId } = useParams()

  const { data: traceData, isLoading, isError } = useQuery({
    queryKey: ['trace', batchId],
    queryFn: async () => {
      if (!batchId) throw new Error('Mã lô hàng không hợp lệ')
      const res = await http.get<{ isSuccess: boolean; result: PublicTraceResponse }>(`/trace/${batchId}`)
      if (res.data && res.data.result) {
        return res.data.result
      }
      throw new Error('Không có dữ liệu tra cứu')
    },
    enabled: Boolean(batchId),
    retry: 1,
  })

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 inline-block">
            <QrCode className="w-12 h-12 text-green-600" />
          </div>
          <p className="text-lg font-semibold text-gray-700">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    )

  if (isError || !traceData)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
            <p className="text-gray-600">Mã lô hàng #{batchId} không tồn tại hoặc chưa có dữ liệu công khai.</p>
            <p className="text-sm text-gray-500 mt-4 mb-6">Vui lòng kiểm tra lại mã QR hoặc liên hệ nhà cung cấp.</p>
            <Button asChild className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
              <Link to="/">
                <Home className="w-4 h-4" />
                <span>Về trang chủ</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )

  const { batch, events, inspections, certificates, hashChainValid } = traceData
  const isRecalled = batch.status === 'RECALLED' || batch.status === 'Recalled'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-4 px-4 sm:py-8 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Product header card */}
        <Card className="bg-white shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{batch.productName}</h1>
                <p className="text-green-100 mt-1">Sản xuất bởi: {batch.producerOrganizationName}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-green-200 text-green-900 border-none">Mã lô #{batch.id}</Badge>
                  {hashChainValid && (
                    <Badge className="bg-blue-200 text-blue-900 border-none flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Dữ liệu đã xác thực
                    </Badge>
                  )}
                </div>
              </div>
              {isRecalled && (
                <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  CẢNH BÁO THU HỒI
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {/* Certifications */}
            {certificates && certificates.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Chứng nhận & Tiêu chuẩn</p>
                <div className="flex flex-wrap gap-2">
                  {certificates.map((cert) => (
                    <Badge key={cert.id} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      ✓ {cert.certificateType ?? 'Chứng nhận chất lượng'} ({cert.issuingOrganization ?? 'Cơ quan cấp'})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Source farm info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Đơn vị Sản xuất</p>
                  <p className="text-sm text-gray-600">{batch.producerOrganizationName}</p>
                  <p className="text-xs text-gray-500 mt-1">Mã QR: {batch.qrCode}</p>
                </div>
              </div>
            </div>

            {/* Harvest date & weight */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Ngày Thu hoạch</p>
                    <p className="text-sm text-gray-600">
                      {batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Khối lượng</p>
                    <p className="text-sm text-gray-600">
                      {batch.weight} {batch.productUnit ?? 'kg'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recall warning if applicable */}
        {isRecalled && (
          <Card className="border-red-300 bg-red-50">
            <CardHeader className="border-b border-red-200">
              <CardTitle className="text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Cảnh báo Thu hồi Sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <p className="text-red-900 font-semibold">Lô hàng này đã có quyết định THU HỒI từ cơ quan quản lý.</p>
              <p className="text-sm text-red-800">Vui lòng dừng sử dụng ngay và liên hệ điểm bán để được trợ giúp.</p>
            </CardContent>
          </Card>
        )}

        {/* Inspections section */}
        {inspections && inspections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kết quả Kiểm định Chất lượng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inspections.map((insp) => (
                <div key={insp.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{insp.inspectorOrganizationName ?? 'Đơn vị kiểm định'}</p>
                    <p className="text-xs text-gray-500">{insp.notes ?? 'Không có ghi chú'}</p>
                  </div>
                  <Badge className={insp.result === 'Pass' ? 'bg-green-600' : 'bg-red-600'}>
                    {insp.result ?? 'Đạt'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Supply chain timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Lộ trình Chuỗi cung ứng</CardTitle>
            <CardDescription>Toàn bộ hành trình minh bạch từ nông trại đến người tiêu dùng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-blue-400" />
              <div className="space-y-6">
                {events && events.length > 0 ? (
                  events.map((event) => {
                    const label = EVENT_TYPE_LABELS[event.eventType as EventType] ?? event.eventType
                    const icon = EVENT_ICONS[event.eventType] ?? '📍'

                    return (
                      <div key={event.id} className="relative pl-20">
                        <div className="absolute left-0 top-1 w-12 h-12 bg-white border-4 border-green-400 rounded-full flex items-center justify-center text-lg">
                          {icon}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition space-y-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-900">{label}</h3>
                            <span className="text-xs text-gray-500">
                              {new Date(event.eventTime).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            <strong>Thực hiện:</strong> {event.organizationName ?? 'N/A'}{' '}
                            {event.performedByUserName ? `(${event.performedByUserName})` : ''}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-500">
                              <strong>Địa điểm:</strong> {event.location}
                            </p>
                          )}
                          {event.additionalData && (
                            <p className="text-xs text-gray-600 bg-white p-2 rounded border mt-2">
                              {event.additionalData}
                            </p>
                          )}
                          <div className="text-[10px] text-gray-400 font-mono mt-2 truncate">
                            SHA-256: {event.currentHash}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Chưa có sự kiện nào được ghi nhận.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
