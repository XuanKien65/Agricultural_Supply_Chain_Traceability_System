import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, AlertTriangle, QrCode, ShieldCheck, GitFork, ArrowLeft, Search, Building, UserCheck } from 'lucide-react'
import { publicTraceApi, type BatchLineageNode } from '../trace.api'
import { EVENT_TYPE_LABELS, type EventType } from '@/features/events/events.types'

const EVENT_ICONS: Record<string, string> = {
  HARVEST: '🌾',
  PROCESS: '⚙️',
  PACKAGE: '📦',
  TRANSPORT: '🚚',
  DISTRIBUTE: '🏢',
  RETAIL: '🛒',
}

function LineageNodeView({ node, isCurrent }: { node: BatchLineageNode; isCurrent?: boolean }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/trace/${node.batchId}`)}
      className={`p-3 rounded-lg border text-sm transition cursor-pointer ${
        isCurrent ? 'bg-green-100 border-green-600 shadow-sm' : 'bg-white hover:bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-gray-900">Mã lô: {node.batchCode || `#${node.batchId}`}</span>
        {isCurrent && <Badge className="bg-green-700 text-white text-[10px]">Đang xem</Badge>}
      </div>
      {node.productName && <p className="text-xs text-gray-700 font-medium mt-1">{node.productName}</p>}
      {node.organizationName && <p className="text-xs text-gray-500 mt-0.5">{node.organizationName}</p>}
    </div>
  )
}

export function TracePublicPage() {
  const { batchId } = useParams()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')

  const { data: traceData, isLoading, isError } = useQuery({
    queryKey: ['public-trace', batchId],
    queryFn: async () => {
      if (!batchId) throw new Error('Mã lô hàng không hợp lệ')
      return await publicTraceApi.getPublicTrace(batchId)
    },
    enabled: Boolean(batchId),
    retry: 1,
  })

  const { data: lineageData } = useQuery({
    queryKey: ['public-trace-lineage', batchId],
    queryFn: async () => {
      if (!batchId) return null
      return await publicTraceApi.getBatchLineage(batchId).catch(() => null)
    },
    enabled: Boolean(batchId),
  })

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchInput.trim()) {
      navigate(`/trace/${searchInput.trim()}`)
    }
  }

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 inline-block">
            <QrCode className="w-12 h-12 text-green-600" />
          </div>
          <p className="text-lg font-semibold text-gray-700">Đang tải hành trình nguồn gốc nông sản...</p>
        </div>
      </div>
    )

  if (isError || !traceData)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8 space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <div>
              <h2 className="text-xl font-bold">Không tìm thấy thông tin lô hàng</h2>
              <p className="text-gray-600 text-sm mt-1">Mã lô hàng #{batchId} không tồn tại hoặc chưa có dữ liệu công khai.</p>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã lô khác..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <Button type="submit" size="sm">Tra cứu</Button>
            </form>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> Về Trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    )

  const batch = traceData.batch ?? traceData
  const events = traceData.events ?? []
  const inspections = traceData.inspections ?? []
  const certificates = traceData.certificates ?? []
  const hashChainValid = traceData.hashChainValid ?? true
  const isRecalled = batch.status === 'RECALLED' || batch.status === 'Recalled'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-4 px-4 sm:py-8 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Bar Header for Consumer */}
        <div className="flex justify-between items-center bg-white p-3 px-4 rounded-xl shadow-sm border border-gray-200">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2 font-bold text-gray-700">
            <ArrowLeft className="w-4 h-4" /> AgriTrace
          </Button>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Mã lô hàng (QR)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-36 sm:w-48 pl-8 pr-3 py-1.5 border rounded-lg text-xs bg-gray-50 focus:bg-white focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
            <Button type="submit" size="sm" className="text-xs h-8 px-3">Tra cứu</Button>
          </form>
        </div>

        {/* Product Header Card */}
        <Card className="bg-white shadow-lg overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold">{batch.productName}</h1>
                <p className="text-green-100 text-sm mt-1 flex items-center gap-1.5">
                  <Building className="w-4 h-4" />
                  Đơn vị sản xuất: <strong>{batch.producerOrganizationName || 'Nông trại Việt'}</strong>
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-none font-bold">
                    Mã Lô #{batch.batchCode || batch.id}
                  </Badge>
                  {hashChainValid && (
                    <Badge className="bg-emerald-200 text-emerald-950 border-none font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" /> Hash Chain Bảo Mật
                    </Badge>
                  )}
                </div>
              </div>
              {isRecalled && (
                <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center shadow-lg animate-pulse">
                  <AlertTriangle className="w-4 h-4 mr-1.5" />
                  CẢNH BÁO THU HỒI
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* Certifications */}
            {certificates && certificates.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Chứng Nhận Chất Lượng & Tiêu Chuẩn</p>
                <div className="flex flex-wrap gap-2">
                  {certificates.map((cert: any) => {
                    const certName = cert.certificateType ?? cert.type ?? 'Chứng nhận chất lượng'
                    const issuer = cert.issuingOrganization ?? cert.issuingOrg ?? 'Cơ quan chứng nhận'
                    const date = cert.issuedDate ?? cert.issuedAt
                    const file = cert.fileUrl

                    return (
                      <div key={cert.id ?? Math.random()} className="bg-green-50 text-green-900 border border-green-300 rounded-xl p-3 flex flex-col gap-1 text-xs font-medium">
                        <div className="flex items-center gap-1.5 font-bold text-green-800 text-sm">
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                          <span>{certName}</span>
                        </div>
                        <p className="text-gray-600">Cơ quan cấp: <strong>{issuer}</strong></p>
                        {date && <p className="text-gray-500 text-[11px]">Ngày cấp: {new Date(date).toLocaleDateString('vi-VN')}</p>}
                        {file && (
                          <a
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-blue-600 underline font-bold hover:text-blue-800"
                          >
                            📄 Xem/Tải tài liệu chứng nhận
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Farm & Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Đơn vị Sản xuất & Phân phối</p>
                    <p className="text-sm text-gray-700 mt-0.5">{batch.producerOrganizationName ?? batch.currentOrganizationName ?? 'Nông trại Việt'}</p>
                    {batch.qrCode && <p className="text-xs text-gray-500 mt-1 font-mono">Mã định danh QR: {batch.qrCode}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Thu hoạch & Sản lượng</p>
                    <p className="text-sm text-gray-700">
                      {batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString('vi-VN') : batch.createdAt ? new Date(batch.createdAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
                    </p>
                    <p className="text-xs text-gray-600 font-semibold mt-0.5">
                      Khối lượng: {batch.weight ?? batch.quantity ?? 100} {batch.productUnit ?? 'kg'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recall alert card if recalled */}
        {isRecalled && (
          <Card className="border-2 border-red-400 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-900 flex items-center gap-2 text-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Thông Báo Thu Hồi Khẩn Cấp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-red-900">
              <p className="font-bold">Lô hàng này đã có quyết định THU HỒI từ nhà sản xuất / cơ quan chức năng.</p>
              <p>Vui lòng tạm ngưng tiêu dùng và liên hệ điểm bán lẻ để được đổi trả hoặc hỗ trợ.</p>
            </CardContent>
          </Card>
        )}

        {/* Sơ đồ Lineage (Phả hệ tách/gộp lô) */}
        {lineageData && (lineageData.parentBatches?.length || lineageData.childBatches?.length) ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GitFork className="w-5 h-5 text-green-600" />
                Sơ Đồ Phả Hệ Lô Hàng (Lineage Tree)
              </CardTitle>
              <CardDescription>Lịch sử tách lô / gộp lô nguyên liệu trước khi đóng gói</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lineageData.parentBatches && lineageData.parentBatches.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500 mb-2">Lô nguyên liệu nguồn (Lô mẹ):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {lineageData.parentBatches.map((parent) => (
                      <LineageNodeView key={parent.batchId} node={parent} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-bold uppercase text-gray-500 mb-2">Lô hiện tại:</p>
                <LineageNodeView node={lineageData} isCurrent />
              </div>

              {lineageData.childBatches && lineageData.childBatches.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500 mb-2">Lô được phân tách tiếp theo (Lô con):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {lineageData.childBatches.map((child) => (
                      <LineageNodeView key={child.batchId} node={child} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* Inspections section */}
        {inspections && inspections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Kết Quả Kiểm Định Chất Lượng (QC)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inspections.map((insp: any) => {
                const inspector = insp.inspectorName ?? insp.inspectorOrganizationName ?? 'Cán bộ Kiểm định Độc lập'
                const res = insp.result ?? 'PASS'
                const isPass = res.toUpperCase() === 'PASS' || res === 'Pass'
                const date = insp.inspectionDate ?? insp.createdAt
                const notes = insp.notes ?? 'Đạt tiêu chuẩn an toàn thực phẩm'

                return (
                  <div key={insp.id} className="p-3.5 bg-gray-50 border rounded-xl flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{inspector}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{notes}</p>
                      {date && <p className="text-[11px] text-gray-400 mt-1">Ngày kiểm định: {new Date(date).toLocaleString('vi-VN')}</p>}
                    </div>
                    <Badge className={isPass ? 'bg-green-600 text-white font-bold' : 'bg-red-600 text-white font-bold'}>
                      {res}
                    </Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Supply chain timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lộ Trình Nhật Ký Chuỗi Cung Ứng</CardTitle>
            <CardDescription>Nhật ký minh bạch từng công đoạn (Mã hóa SHA-256 không thể sửa đổi)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-blue-500" />
              <div className="space-y-6">
                {events && events.length > 0 ? (
                  events.map((event: any) => {
                    const label = EVENT_TYPE_LABELS[event.eventType as EventType] ?? event.eventType
                    const icon = EVENT_ICONS[event.eventType] ?? '📍'
                    const time = event.eventTime ?? event.createdAt
                    const details = event.additionalData ?? event.eventData

                    return (
                      <div key={event.id ?? Math.random()} className="relative pl-16 sm:pl-20">
                        <div className="absolute left-0 top-1 w-12 h-12 bg-white border-4 border-green-500 rounded-full flex items-center justify-center text-lg shadow-sm">
                          {icon}
                        </div>

                        <div className="bg-gray-50 border p-4 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <h3 className="font-bold text-gray-900 text-base">{label}</h3>
                            {time && (
                              <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded border">
                                {new Date(time).toLocaleString('vi-VN')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">
                            <strong>Đơn vị thực hiện:</strong> {event.organizationName ?? 'Nông trại'}
                            {event.performedByUserName ? ` (${event.performedByUserName})` : ''}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-600">
                              <strong>Địa điểm:</strong> {event.location}
                            </p>
                          )}
                          {details && (
                            <p className="text-xs text-gray-700 bg-white p-2.5 rounded-lg border mt-2">
                              {details}
                            </p>
                          )}
                          {event.currentHash && (
                            <div className="text-[10px] text-gray-400 font-mono mt-2 truncate bg-gray-100 p-1 rounded">
                              SHA-256: {event.currentHash}
                            </div>
                          )}
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
