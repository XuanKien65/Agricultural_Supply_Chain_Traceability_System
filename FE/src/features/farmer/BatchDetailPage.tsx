import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useFarmerStore } from './farmer.store'

export function BatchDetailPage() {
  const { batchId } = useParams()
  const batches = useFarmerStore((state) => state.batches)
  const selectedBatchId = useFarmerStore((state) => state.selectedBatchId)
  const setSelectedBatchId = useFarmerStore((state) => state.setSelectedBatchId)
  const updateBatchStatus = useFarmerStore((state) => state.updateBatchStatus)

  const batch = useMemo(() => {
    const currentId = batchId ?? selectedBatchId ?? ''
    return batches.find((item) => item.maLoHang === currentId) ?? null
  }, [batchId, batches, selectedBatchId])

  if (!batch) {
    return (
      <section className="flex flex-col gap-4">
        <p className="text-gray-500">No batch found.</p>
        <Link to="/farmer/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Batch Detail</p>
          <h1 className="text-3xl font-bold">{batch.tenSanPham}</h1>
          <p className="mt-2 text-sm text-gray-500">Track full event history and current handling state.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/farmer/dashboard">
            <Button variant="secondary">Back</Button>
          </Link>
          <Button onClick={() => {
            setSelectedBatchId(batch.maLoHang)
            const nextStatus = batch.trangThai === 'Created' ? 'InTransit' : batch.trangThai === 'InTransit' ? 'Processed' : 'Distributed'
            updateBatchStatus(batch.maLoHang, nextStatus)
          }}>
            Advance Status
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Batch Information</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Batch ID (MaLoHang)</p>
              <p className="font-medium">{batch.maLoHang}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status (TrangThai)</p>
              <p className="font-medium">{batch.trangThai}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Product</p>
              <p className="font-medium">{batch.tenSanPham}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Producer Unit</p>
              <p className="font-medium">{batch.tenDonViSanXuat}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Harvest Date</p>
              <p className="font-medium">{batch.ngayThuHoach}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quantity (KhoiLuong)</p>
              <p className="font-medium">{batch.khoiLuong} kg</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">QR Code (MaQR)</p>
              <p className="font-medium">{batch.maQR}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{batch.viTri}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Quick Notes</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            <li>• Batch identity is unique and traceable.</li>
            <li>• Events are appended in sequence for integrity.</li>
            <li>• QR scanning can be linked to the public verification page.</li>
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Event History</h2>
        <div className="mt-4 space-y-3">
          {batch.events.map((event) => (
            <div key={event.maSuKien} className="rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <p className="font-semibold">{event.loaiSuKien}</p>
                <p className="text-sm text-gray-500">{event.thoiGian}</p>
              </div>
              <p className="mt-2 text-sm text-gray-600">Actor unit: {event.maDonViThucHien}</p>
              <p className="text-sm text-gray-600">{event.ghiChu}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
