import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useFarmerStore, type FarmerBatch } from './farmer.store'

export function CreateBatchPage() {
  const navigate = useNavigate()
  const createBatch = useFarmerStore((state) => state.createBatch)

  const [form, setForm] = useState({
    tenSanPham: '',
    tenDonViSanXuat: '',
    ngayThuHoach: '',
    khoiLuong: '',
    maQR: '',
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newBatch: FarmerBatch = {
      maLoHang: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      maSanPham: Date.now(),
      maDonViSanXuat: Date.now() + 1,
      maQR: form.maQR || `QR-${Math.floor(1000 + Math.random() * 9000)}`,
      ngayThuHoach: form.ngayThuHoach,
      khoiLuong: Number(form.khoiLuong) || 0,
      trangThai: 'Created',
      tenSanPham: form.tenSanPham,
      tenDonViSanXuat: form.tenDonViSanXuat,
      viTri: 'Pending validation',
      events: [
        {
          maSuKien: `e-${Date.now()}`,
          loaiSuKien: 'Harvest',
          thoiGian: `${form.ngayThuHoach} 06:00`,
          maDonViThucHien: 'D-NEW',
          ghiChu: 'Batch created by farmer.',
        },
      ],
    }

    createBatch(newBatch)
    navigate('/farmer/dashboard')
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Create Batch</p>
        <h1 className="text-3xl font-bold">Create Batch Form</h1>
        <p className="mt-2 text-sm text-gray-500">Register a new agricultural batch and generate its traceability identity.</p>
      </div>

      <Card className="p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input label="Product Name" value={form.tenSanPham} onChange={(e) => setForm({ ...form, tenSanPham: e.target.value })} required />
          <Input label="Producer Unit" value={form.tenDonViSanXuat} onChange={(e) => setForm({ ...form, tenDonViSanXuat: e.target.value })} required />
          <Input label="Harvest Date" type="date" value={form.ngayThuHoach} onChange={(e) => setForm({ ...form, ngayThuHoach: e.target.value })} required />
          <Input label="Quantity (kg)" type="number" value={form.khoiLuong} onChange={(e) => setForm({ ...form, khoiLuong: e.target.value })} required />
          <Input label="QR Code" value={form.maQR} onChange={(e) => setForm({ ...form, maQR: e.target.value })} placeholder="Optional" />
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/farmer/dashboard')}>
              Cancel
            </Button>
            <Button type="submit">Save Batch</Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
