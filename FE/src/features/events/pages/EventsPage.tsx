import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Timeline, PlusCircle, Search, Calendar, MapPin, ShieldCheck, ArrowRight } from 'lucide-react'

/**
 * EventsPage - Danh sách tất cả sự kiện của lô hàng
 * Cho phép farmers/units xem lịch sử sự kiện trong chuỗi cung ứng
 */
export function EventsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')

  // ==========================================
  // CODE GỐC: Fetch sự kiện chuỗi cung ứng
  // ==========================================
  const { data, isLoading } = useQuery({
    queryKey: ['events', searchTerm, selectedType],
    queryFn: async () => {
      // Giả lập danh sách sự kiện đầy đủ
      return {
        items: [
          {
            id: 'E001',
            batchId: 'B001',
            eventType: 'Harvest',
            displayName: 'Thu hoạch',
            description: 'Lô hàng được thu hoạch tại vườn Đà Lạt',
            timestamp: '2026-01-15 08:00:00',
            location: 'Nông trại ABC, Đà Lạt',
            actor: 'Nông dân Nguyễn Văn A',
            status: 'Completed',
            hash: '9b2d8f1e4a3b...c72e',
          },
          {
            id: 'E002',
            batchId: 'B001',
            eventType: 'Inspection',
            displayName: 'Kiểm định Chất lượng',
            description: 'Đạt kiểm định tiêu chuẩn VietGAP',
            timestamp: '2026-01-15 10:30:00',
            location: 'Trạm kiểm định KCS',
            actor: 'Cán bộ QC Lê Mai',
            status: 'Completed',
            hash: 'a4f91c78e23b...8d01',
          },
          {
            id: 'E003',
            batchId: 'B001',
            eventType: 'Processing',
            displayName: 'Sơ chế & Đóng gói',
            description: 'Rửa sạch, đóng gói hộp sinh học 500g',
            timestamp: '2026-01-15 14:00:00',
            location: 'Nhà máy Sơ chế XYZ',
            actor: 'Công ty Sơ chế XYZ',
            status: 'Completed',
            hash: '7b11aa99c820...432f',
          },
          {
            id: 'E004',
            batchId: 'B001',
            eventType: 'Transport',
            displayName: 'Vận chuyển Chuỗi lạnh',
            timestamp: '2026-01-15 18:00:00',
            location: 'Xe lạnh BKS 49C-123.45',
            actor: 'Logistics Tân Cảng',
            status: 'In Progress',
            hash: '6e7c10b48a12...99ff',
          },
          {
            id: 'E005',
            batchId: 'B002',
            eventType: 'Harvest',
            displayName: 'Thu hoạch',
            description: 'Thu hoạch cà chua bi Organic',
            timestamp: '2026-01-18 07:30:00',
            location: 'Vườn A2 Đơn Dương',
            actor: 'Nông dân Trần Bình',
            status: 'Completed',
            hash: '5a8e1b239c4d...ef01',
          },
        ],
        totalCount: 5,
      }
    },
  })

  // Lọc dữ liệu theo tìm kiếm & loại sự kiện
  const filteredEvents = data?.items?.filter((e) => {
    const matchSearch =
      !searchTerm ||
      e.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = !selectedType || e.eventType === selectedType
    return matchSearch && matchType
  })

  // Helper hàm màu sắc badge sự kiện
  const getEventBadge = (type: string) => {
    switch (type) {
      case 'Harvest':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'Inspection':
        return 'bg-teal-100 text-teal-800 border-teal-300'
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Packaging':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'Transport':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Distribution':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300'
      case 'Retail':
        return 'bg-rose-100 text-rose-800 border-rose-300'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* ==========================================
       * NEW CODE - Header & Thống kê nhanh
       * ========================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Quản lý Sự kiện Chuỗi Cung ứng
            </h1>
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Timeline className="w-5 h-5" />
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Ghi nhận tuần tự và bảo vệ dữ liệu bất biến (Append-only) bằng công nghệ Hash Chain.
          </p>
        </div>

        <Button
          onClick={() => navigate('/events/new')}
          className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ghi nhận Sự kiện Mới</span>
        </Button>
      </div>

      {/* ==========================================
       * NEW CODE - Thanh tìm kiếm & Bộ lọc
       * ========================================== */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm theo mã lô (B001...), tên sự kiện, actor hoặc địa điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="">Tất cả loại sự kiện</option>
              <option value="Harvest">Thu hoạch (Harvest)</option>
              <option value="Inspection">Kiểm định (Inspection)</option>
              <option value="Processing">Sơ chế (Processing)</option>
              <option value="Transport">Vận chuyển (Transport)</option>
              <option value="Distribution">Phân phối (Distribution)</option>
              <option value="Retail">Bán lẻ (Retail)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ==========================================
       * NEW CODE - Bảng danh sách sự kiện chuyên nghiệp
       * ========================================== */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Nhật ký Sự kiện Chuỗi
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Toàn bộ dữ liệu được liên kết chuỗi băm mật mã SHA-256
              </CardDescription>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
              {filteredEvents?.length || 0} Sự kiện
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Đang tải danh sách sự kiện...</div>
          ) : !filteredEvents || filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Không tìm thấy sự kiện nào phù hợp với điều kiện lọc.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Mã Lô Hàng</TableHead>
                  <TableHead className="font-bold text-slate-700">Công đoạn / Loại sự kiện</TableHead>
                  <TableHead className="font-bold text-slate-700">Mô tả chi tiết</TableHead>
                  <TableHead className="font-bold text-slate-700">Địa điểm & Người thực hiện</TableHead>
                  <TableHead className="font-bold text-slate-700">Mốc thời gian</TableHead>
                  <TableHead className="font-bold text-slate-700">Hash SHA-256</TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event: any) => (
                  <TableRow key={event.id} className="hover:bg-slate-50/80 transition">
                    <TableCell className="font-mono font-bold text-emerald-700">
                      {event.batchId}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${getEventBadge(
                          event.eventType,
                        )}`}
                      >
                        {event.displayName}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs text-xs text-slate-700">
                      {event.description}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{event.location}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">👤 {event.actor}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{event.timestamp}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-500">
                      <div className="flex items-center gap-1" title={event.hash}>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate max-w-[100px]">{event.hash}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/events/${event.id}`)}
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
      {/* ==========================================
       * END NEW CODE
       * ========================================== */}
    </div>
  )
}
