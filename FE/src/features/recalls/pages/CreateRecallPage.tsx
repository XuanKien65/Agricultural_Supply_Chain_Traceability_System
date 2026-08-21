import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle } from 'lucide-react'
import { adminApi } from '@/features/admin/admin.api'
import { useAuthStore } from '@/features/auth/auth.store'

export function CreateRecallPage() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)

  const { data: batches } = useQuery({
    queryKey: ['adminBatches'],
    queryFn: () => adminApi.getBatches(),
  })

  const [formData, setFormData] = useState({
    batchId: '',
    product: '',
    reason: '',
    severity: 'High',
    description: '',
    affectedBatches: '',
    recoveryActions: '',
  })

  const createRecallMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const numericBatchId = Number(data.batchId)
      if (Number.isNaN(numericBatchId) || numericBatchId <= 0) {
        throw new Error('Vui lòng chọn hoặc nhập mã số lô hàng hợp lệ.')
      }

      return adminApi.createRecall({
        batchId: numericBatchId,
        reason: `${data.reason || 'Cảnh báo thu hồi'} - ${data.description}`.trim(),
        severity: data.severity ? data.severity.toUpperCase() : 'HIGH',
        createdBy: currentUser?.id ?? 1,
      })
    },
    onSuccess: () => {
      navigate('/recalls')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.batchId || !formData.reason) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }
    createRecallMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* NEW CODE - Recall warning header */}
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-red-900">Cảnh báo Thu hồi Sản phẩm</h2>
          <p className="text-sm text-red-700">
            Hành động này sẽ tích cực thông báo tới tất cả các Actor đang nắm giữ hoặc xử lý lô hàng bị ảnh hưởng.
            Hãy chắc chắn thông tin của bạn là chính xác trước khi xác nhận.
          </p>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6">Phát hành Yêu cầu Thu hồi</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NEW CODE - Recall basic info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="batchId">Mã Lô Hàng Chính *</Label>
            {batches && batches.length > 0 ? (
              <Select
                value={formData.batchId}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, batchId: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lô hàng..." />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.batchCode} (#{b.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="batchId"
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                required
                placeholder="vd: 1, 2, B001"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Tên Sản phẩm *</Label>
            <Input
              id="product"
              name="product"
              value={formData.product}
              onChange={handleChange}
              required
              placeholder="vd: Dâu tây tươi"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="severity">Mức độ Nguy hiểm *</Label>
            <Select value={formData.severity} onValueChange={(value: string) => setFormData((prev) => ({ ...prev, severity: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">Cao - Nguy hiểm tính mạng</SelectItem>
                <SelectItem value="Medium">Trung bình - Ảnh hưởng sức khỏe</SelectItem>
                <SelectItem value="Low">Thấp - Lỗi chất lượng nhỏ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="affectedBatches">Số Lô bị ảnh hưởng dự kiến</Label>
            <Input
              id="affectedBatches"
              name="affectedBatches"
              type="number"
              value={formData.affectedBatches}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </div>

        {/* NEW CODE - Recall reason and description */}
        <div className="space-y-2">
          <Label htmlFor="reason">Lý do Thu hồi *</Label>
          <Select value={formData.reason} onValueChange={(value: string) => setFormData((prev) => ({ ...prev, reason: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn lý do" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pathogenic Bacteria">Phát hiện vi khuẩn gây bệnh (Salmonella, E.coli)</SelectItem>
              <SelectItem value="Chemical Contamination">Nhiễm hóa chất, thuốc trừ sâu vượt ngưỡng</SelectItem>
              <SelectItem value="Allergen">Dị ứng không được ghi nhãn</SelectItem>
              <SelectItem value="Foreign Objects">Phát hiện vật lạ nguy hiểm (kính, kim loại)</SelectItem>
              <SelectItem value="Mold Contamination">Phát hiện nấm độc hại</SelectItem>
              <SelectItem value="Packaging Defect">Lỗi bao bì, rò rỉ</SelectItem>
              <SelectItem value="Other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Mô tả Chi tiết</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="Mô tả chi tiết về sự cố, triệu chứng quan sát được..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recoveryActions">Hành động Khắc phục / Khuyến cáo</Label>
          <textarea
            id="recoveryActions"
            name="recoveryActions"
            value={formData.recoveryActions}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="Hướng dẫn cho người tiêu dùng và các actor chuỗi cung ứng..."
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={createRecallMutation.isPending} variant="destructive">
            {createRecallMutation.isPending ? 'Đang gửi...' : 'Phát hành Recall'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/recalls')}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  )
}
