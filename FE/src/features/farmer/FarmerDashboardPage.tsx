import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useFarmerStore } from './farmer.store'

export function FarmerDashboardPage() {
  const batches = useFarmerStore((state) => state.batches)
  const setSelectedBatchId = useFarmerStore((state) => state.setSelectedBatchId)

  const summary = [
    { label: 'Total batches', value: batches.length.toString() },
    { label: 'Created', value: batches.filter((batch) => batch.trangThai === 'Created').length.toString() },
    { label: 'In Transit', value: batches.filter((batch) => batch.trangThai === 'InTransit').length.toString() },
  ]

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Farmer Portal</p>
          <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">Track harvests, manage batch records, and review journey events.</p>
        </div>
        <Link to="/farmer/create-batch">
          <Button>Create Batch</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Batches</h2>
          <span className="text-sm text-gray-500">Latest activity</span>
        </div>
        <div className="space-y-3">
          {batches.map((batch) => (
            <div key={batch.id} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{batch.tenSanPham}</p>
                <p className="text-sm text-gray-500">{batch.maLoHang} • {batch.tenDonViSanXuat} • {batch.viTri}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">{batch.trangThai}</span>
                <Link to={`/farmer/batches/${batch.maLoHang}`}>
                  <Button variant="secondary" size="sm" onClick={() => setSelectedBatchId(batch.maLoHang)}>
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
