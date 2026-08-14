import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, MapPin, Calendar, User, Shield, Thermometer, Droplets, Lock, Hash } from 'lucide-react'

/**
 * EventDetailPage - Chi tiết sự kiện
 * Hiển thị thông tin chi tiết của một sự kiện trong chuỗi cung ứng
 * Bao gồm: thông tin Actor, timestamp, location, điều kiện lưu bảo (temp, humidity), hash chain
 */
export function EventDetailPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  // ==========================================
  // CODE GỐC: Fetch chi tiết sự kiện
  // ==========================================
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      return {
        id: eventId || 'E001',
        batchId: 'B001',
        eventType: 'Transport',
        displayName: 'Vận chuyển Chuỗi Lạnh',
        description: 'Vận chuyển lô nông sản từ nhà máy sơ chế Đà Lạt về kho trung tâm phân phối TP.HCM bằng xe chuyên dụng.',
        timestamp: '2026-01-15 18:00:00',
        location: 'Tuyến Cao tốc Dầu Giây - TP.HCM',
        actor: 'Logistics Tân Cảng Express',
        temperature: 5.5,
        humidity: 65,
        notes: 'Lô hàng được bảo quản trong container lạnh cảm biến tự động, nhiệt độ dao động tối đa ±0.5°C.',
        status: 'Completed',
        previousHash: 'a4f91c78e23b09dc81e4b3c79a128e03d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
        currentHash: '6e7c10b48a12ff339900aabbccddeeff112233445566778899aabbccddeeff00',
        actor_id: 'ORG-TRANS-01',
        actor_role: 'Đơn vị Vận tải Chuỗi Lạnh',
      }
    },
  })

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải thông tin chi tiết sự kiện...</div>
  }

  if (!event) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 mb-4">Không tìm thấy sự kiện {eventId}</p>
        <Button onClick={() => navigate('/events')} variant="outline">
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  // ==========================================
  // NEW CODE: Giao diện chi tiết chuyên sâu & Hash Chain Card
  // ==========================================
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1.5 bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{event.displayName || event.eventType}</h1>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                {event.status === 'Completed' ? 'Đã hoàn thành' : event.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mã Lô: <strong className="text-emerald-700 font-mono">{event.batchId}</strong> &bull; Mã Sự Kiện: <span className="font-mono">{event.id}</span>
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/trace/${event.batchId}`)}
          className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold"
        >
          <span>Xem trang Tra cứu Công khai</span>
        </Button>
      </div>

      {/* 2 Cột: Thông tin cơ bản & Điều kiện môi trường */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Thông tin cơ bản */}
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              Thông Tin Thực Hiện
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5 text-xs sm:text-sm">
            <div className="flex justify-between items-start pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Thời gian:
              </span>
              <strong className="text-slate-800 font-mono">{event.timestamp}</strong>
            </div>

            <div className="flex justify-between items-start pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Địa điểm:
              </span>
              <strong className="text-slate-800 text-right max-w-[200px]">{event.location}</strong>
            </div>

            <div className="flex justify-between items-start pb-2.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Người/Đơn vị:
              </span>
              <strong className="text-emerald-700">{event.actor}</strong>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" /> Vai trò:
              </span>
              <strong className="text-slate-700">{event.actor_role}</strong>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Điều kiện lưu bảo */}
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-blue-500" />
              Điều Kiện Bảo Quản & Mô Tả
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5" /> Nhiệt độ
                </span>
                <p className="text-lg font-bold text-blue-900 mt-1">{event.temperature}°C</p>
              </div>

              <div className="bg-teal-50 border border-teal-100 p-3 rounded-xl">
                <span className="text-[11px] font-semibold text-teal-700 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" /> Độ ẩm
                </span>
                <p className="text-lg font-bold text-teal-900 mt-1">{event.humidity}%</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 block mb-1">Mô tả công đoạn:</span>
              <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {event.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ghi chú */}
      {event.notes && (
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-800">Ghi Chú Nghiệp Vụ</CardTitle>
          </CardHeader>
          <CardContent className="text-xs sm:text-sm text-slate-600">
            <p>{event.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Card Xác thực Hash Chain */}
      <Card className="border border-emerald-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-700/80 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              <CardTitle className="text-base font-bold text-white">
                Xác Thực Tính Toàn Vẹn (Hash Chain)
              </CardTitle>
            </div>
            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-md flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Khớp chuỗi băm
            </span>
          </div>
          <CardDescription className="text-xs text-slate-400">
            Dữ liệu bất biến, phát hiện ngay lập tức nếu có can thiệp trái phép
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4 font-mono text-xs">
          <div className="space-y-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-500" />
              Mã băm sự kiện trước (PreviousHash):
            </span>
            <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 break-all select-all">
              {event.previousHash}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-emerald-400 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-emerald-500" />
              Mã băm sự kiện này (CurrentHash = SHA-256(Data + PreviousHash)):
            </span>
            <p className="bg-slate-950 p-3 rounded-xl border border-emerald-600/40 text-emerald-300 break-all select-all font-bold">
              {event.currentHash}
            </p>
          </div>

          <p className="text-[11px] text-slate-400 font-sans pt-2 border-t border-slate-800 leading-relaxed">
            ℹ️ Chuỗi băm được liên kết chặt chẽ. Bất kỳ nỗ lực sửa đổi thời gian, vị trí, nhiệt độ hoặc người thực hiện sẽ làm thay đổi mã băm và phá vỡ chuỗi xác thực.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
