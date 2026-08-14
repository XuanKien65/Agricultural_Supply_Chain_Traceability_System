import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Timeline, MapPin, Thermometer, Droplets, FileText, CheckCircle2 } from 'lucide-react'

/**
 * CreateEventPage - Tạo sự kiện mới cho lô hàng
 * Cho phép ghi nhận các sự kiện trong quá trình vận chuyển:
 * Thu hoạch -> Sơ chế -> Đóng gói -> Vận chuyển -> Phân phối -> Bán lẻ
 */
export function CreateEventPage() {
  const navigate = useNavigate()
  const { batchId } = useParams()

  // ==========================================
  // CODE GỐC: State form và mutation
  // ==========================================
  const [formData, setFormData] = useState({
    batchId: batchId || '',
    eventType: '',
    description: '',
    location: '',
    temperature: '',
    humidity: '',
    notes: '',
  })

  const createEventMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // const response = await eventService.createEvent(data)
      // return response
      return { id: '1', ...data }
    },
    onSuccess: () => {
      navigate(-1)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    createEventMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // ==========================================
  // NEW CODE: Giao diện form chuẩn hóa & CSS đẹp mắt
  // ==========================================
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Back button */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </Button>

        <div className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Tự động tạo mã băm SHA-256</span>
        </div>
      </div>

      <Card className="shadow-md border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Timeline className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Ghi Nhận Sự Kiện Chuỗi Cung Ứng
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Lưu trữ bất biến vào nhật ký hành trình của lô hàng nông sản
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hàng 1: Mã lô và Loại sự kiện */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchId" className="text-xs font-bold text-slate-700">
                  Mã Lô Hàng (Batch Code) *
                </Label>
                <Input
                  id="batchId"
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleChange}
                  required
                  disabled={!!batchId}
                  placeholder="Ví dụ: B001, B002..."
                  className="font-mono bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-xs font-bold text-slate-700">
                  Loại Sự Kiện / Công Đoạn *
                </Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, eventType: value }))}
                >
                  <SelectTrigger className="bg-slate-50 focus:bg-white">
                    <SelectValue placeholder="Chọn công đoạn chuỗi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Harvest">🌾 Thu hoạch (Harvest)</SelectItem>
                    <SelectItem value="Inspection">✓ Kiểm định (Inspection)</SelectItem>
                    <SelectItem value="Processing">📦 Sơ chế (Processing)</SelectItem>
                    <SelectItem value="Packaging">🏷️ Đóng gói (Packaging)</SelectItem>
                    <SelectItem value="Transport">🚚 Vận chuyển (Transport)</SelectItem>
                    <SelectItem value="Distribution">🏢 Phân phối (Distribution)</SelectItem>
                    <SelectItem value="Retail">🛒 Bán lẻ (Retail)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hàng 2: Vị trí và điều kiện môi trường */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="location" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Địa điểm thực hiện *</span>
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Kho, trạm xe, siêu thị..."
                  className="bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                  <span>Nhiệt độ (°C)</span>
                </Label>
                <Input
                  id="temperature"
                  name="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="Ví dụ: 5.0"
                  className="bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humidity" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-teal-500" />
                  <span>Độ ẩm (%)</span>
                </Label>
                <Input
                  id="humidity"
                  name="humidity"
                  type="number"
                  value={formData.humidity}
                  onChange={handleChange}
                  placeholder="Ví dụ: 85"
                  className="bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Mô tả sự kiện */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Mô tả chi tiết công việc thực hiện</span>
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                rows={3}
                placeholder="Mô tả cụ thể hành động: xe vận chuyển số bao nhiêu, trạng thái hàng hóa, thời gian dự kiến..."
              />
            </div>

            {/* Ghi chú */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-bold text-slate-700">
                Ghi chú thêm (nếu có)
              </Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                rows={2}
                placeholder="Ghi chú nội bộ, yêu cầu bảo quản đặc biệt..."
              />
            </div>

            {/* Nút hành động */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={createEventMutation.isPending}
                className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 font-bold"
              >
                <Save className="w-4 h-4" />
                <span>{createEventMutation.isPending ? 'Đang mã hóa & lưu...' : 'Lưu Sự Kiện & Ký Hash'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
