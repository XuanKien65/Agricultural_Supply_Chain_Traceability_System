import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, PlusCircle, ShieldCheck } from 'lucide-react'

/**
 * CreateProductPage - Tạo loại sản phẩm mới
 * Cho phép thêm các loại sản phẩm nông sản và chứng nhận của nó
 */
export function CreateProductPage() {
  const navigate = useNavigate()

  // ==========================================
  // CODE GỐC: State và Mutation tạo sản phẩm
  // ==========================================
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    unit: 'kg',
    certifications: [] as string[],
  })

  const createProductMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return { id: '1', ...data }
    },
    onSuccess: () => {
      navigate('/products')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    createProductMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCertificationChange = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }))
  }

  const certifications = ['VietGAP', 'GlobalGAP', 'Organic EU/USDA', 'Fair Trade', 'ISO 22000:2018', 'HACCP']

  // ==========================================
  // NEW CODE: Form giao diện cao cấp
  // ==========================================
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate('/products')}
          className="gap-2 bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh mục</span>
        </Button>
      </div>

      <Card className="shadow-md border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Thêm Loại Nông Sản Mới
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Khai báo danh mục sản phẩm và gắn kèm các tiêu chuẩn chứng nhận
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên sản phẩm */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold text-slate-700">
                Tên Nông Sản / Sản Phẩm *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ví dụ: Dâu tây giống Nhật Bản, Cà chua bi Organic..."
                className="bg-slate-50 focus:bg-white text-sm"
              />
            </div>

            {/* Phân loại & Đơn vị */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs font-bold text-slate-700">
                  Phân Loại Sản Phẩm *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-slate-50 focus:bg-white">
                    <SelectValue placeholder="Chọn phân loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fruit">🍎 Trái cây cao cấp</SelectItem>
                    <SelectItem value="Vegetable">🥬 Rau xanh & Củ quả</SelectItem>
                    <SelectItem value="Grain">🌾 Lúa gạo & Ngũ cốc</SelectItem>
                    <SelectItem value="Dairy">🥛 Sản phẩm từ sữa</SelectItem>
                    <SelectItem value="Meat">🍗 Thịt gia súc gia cầm</SelectItem>
                    <SelectItem value="Other">📦 Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="text-xs font-bold text-slate-700">
                  Quy Cách Đóng Gói / Đơn Vị *
                </Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger className="bg-slate-50 focus:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg (Kilogram)</SelectItem>
                    <SelectItem value="tấn">tấn (Tấn)</SelectItem>
                    <SelectItem value="hộp 500g">hộp 500g</SelectItem>
                    <SelectItem value="thùng (5kg)">thùng (5kg)</SelectItem>
                    <SelectItem value="quả">quả / trái</SelectItem>
                    <SelectItem value="lít">lít</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold text-slate-700">
                Mô Tả & Đặc Điểm Nông Sản
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                rows={3}
                placeholder="Mô tả giống cây trồng, độ ngọt Brix, phương pháp canh tác sạch..."
              />
            </div>

            {/* Chứng nhận */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Tiêu Chuẩn & Chứng Nhận Chất Lượng Đạt Chuẩn</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {certifications.map((cert) => {
                  const isChecked = formData.certifications.includes(cert)
                  return (
                    <label
                      key={cert}
                      htmlFor={cert}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Checkbox
                        id={cert}
                        checked={isChecked}
                        onCheckedChange={() => handleCertificationChange(cert)}
                      />
                      <span>{cert}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Nút lưu */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => navigate('/products')}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createProductMutation.isPending}
                className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20"
              >
                <Save className="w-4 h-4" />
                <span>{createProductMutation.isPending ? 'Đang tạo...' : 'Lưu Danh Mục Sản Phẩm'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
