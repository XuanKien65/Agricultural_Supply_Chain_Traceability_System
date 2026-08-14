import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, ClipboardCheck, CheckCircle2 } from 'lucide-react'

/**
 * CreateInspectionPage - Tạo kiểm định chất lượng mới
 * Cho phép ghi nhận kết quả kiểm định chất lượng của lô hàng
 * Bao gồm: các tiêu chí kiểm định, kết quả (Pass/Fail), ghi chú
 */
export function CreateInspectionPage() {
  const navigate = useNavigate()

  // ==========================================
  // CODE GỐC: State form và mutation
  // ==========================================
  const [formData, setFormData] = useState({
    batchId: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    result: '',
    criteria: [
      { name: 'Độ tươi & hình thái nông sản', passed: true },
      { name: 'Màu sắc & độ đồng đều size', passed: true },
      { name: 'Tỷ lệ dập nát / tổn thương cơ học (< 3%)', passed: true },
      { name: 'Dư lượng thuốc bảo vệ thực vật (Dưới ngưỡng MRL)', passed: true },
      { name: 'Chỉ tiêu vi sinh vật (Salmonella, E.Coli âm tính)', passed: true },
      { name: 'Hàm lượng kim loại nặng (Chì, Cadimi an toàn)', passed: true },
    ],
    notes: '',
  })

  const createInspectionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return { id: 'I001', ...data }
    },
    onSuccess: () => {
      navigate('/quality')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.batchId || !formData.result) {
      alert('Vui lòng điền đầy đủ mã lô hàng và kết quả kiểm định.')
      return
    }
    createInspectionMutation.mutate(formData)
  }

  const handleCriteriaChange = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      criteria: prev.criteria.map((criterion, i) =>
        i === index ? { ...criterion, passed: !criterion.passed } : criterion,
      ),
    }))
  }

  const passedCount = formData.criteria.filter((c) => c.passed).length
  const totalCount = formData.criteria.length

  // ==========================================
  // NEW CODE: Giao diện form giám định chất lượng
  // ==========================================
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate('/quality')}
          className="gap-2 bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </Button>

        <div className="text-xs font-semibold text-teal-800 bg-teal-100 px-3 py-1 rounded-full flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>Đạt {passedCount}/{totalCount} tiêu chí</span>
        </div>
      </div>

      <Card className="shadow-md border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Lập Biên Bản Kiểm Định Chất Lượng (QA/QC)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Ghi nhận đánh giá chỉ tiêu kỹ thuật trước khi thông quan hoặc đưa vào phân phối
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mã lô & Ngày kiểm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchId" className="text-xs font-bold text-slate-700">
                  Mã Lô Hàng Cần Kiểm Định *
                </Label>
                <Input
                  id="batchId"
                  value={formData.batchId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, batchId: e.target.value }))}
                  required
                  placeholder="Ví dụ: B001, B002..."
                  className="font-mono bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspectionDate" className="text-xs font-bold text-slate-700">
                  Ngày Thực Hiện Kiểm Định *
                </Label>
                <Input
                  id="inspectionDate"
                  type="date"
                  value={formData.inspectionDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, inspectionDate: e.target.value }))}
                  required
                  className="bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Danh sách tiêu chuẩn đánh giá */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800">
                  Checklist Tiêu Chí Đánh Giá Chất Lượng
                </Label>
                <span className="text-xs text-slate-500">
                  Tích chọn các tiêu chí đạt chuẩn
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                {formData.criteria.map((criterion, index) => (
                  <label
                    key={index}
                    htmlFor={`criterion-${index}`}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                      criterion.passed
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`criterion-${index}`}
                        checked={criterion.passed}
                        onCheckedChange={() => handleCriteriaChange(index)}
                      />
                      <span>{criterion.name}</span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        criterion.passed
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {criterion.passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Kết luận kết quả */}
            <div className="space-y-2">
              <Label htmlFor="result" className="text-xs font-bold text-slate-700">
                Kết Luận Chung *
              </Label>
              <Select
                value={formData.result}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, result: value }))}
              >
                <SelectTrigger className="bg-slate-50 focus:bg-white">
                  <SelectValue placeholder="Chọn kết luận giám định" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pass">✓ Đạt chuẩn chất lượng (Cho phép thông quan / lưu thông)</SelectItem>
                  <SelectItem value="Fail">✗ Không đạt chuẩn (Cảnh báo thu hồi hoặc xử lý lại)</SelectItem>
                  <SelectItem value="Conditional">⚠️ Đạt có điều kiện (Yêu cầu xử lý bổ sung)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ghi chú */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-bold text-slate-700">
                Ghi Chú Kết Quả & Khuyến Cáo KCS
              </Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                rows={3}
                placeholder="Ghi chú chi tiết kết quả phân tích phòng lab, số giấy chứng nhận kiểm dịch..."
              />
            </div>

            {/* Nút lưu */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => navigate('/quality')}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={createInspectionMutation.isPending}
                className="gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-md shadow-teal-700/20"
              >
                <Save className="w-4 h-4" />
                <span>{createInspectionMutation.isPending ? 'Đang lưu...' : 'Lưu Biên Bản Kiểm Định'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
