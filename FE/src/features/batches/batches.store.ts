import { create } from 'zustand'

export interface BatchEvent {
  maSuKien: string
  loaiSuKien: string
  thoiGian: string
  maDonViThucHien: string
  ghiChu: string
}

export interface Batch {
  maLoHang: string
  maSanPham: number
  maDonViSanXuat: number
  maQR: string
  ngayThuHoach: string
  khoiLuong: number
  trangThai: 'Created' | 'InTransit' | 'Processed' | 'Distributed' | 'Recalled'
  tenSanPham: string
  tenDonViSanXuat: string
  viTri?: string
  events: BatchEvent[]
}

interface BatchesState {
  batches: Batch[]
  selectedBatchId: string | null
  setSelectedBatchId: (id: string | null) => void
  createBatch: (batch: Batch) => void
  updateBatchStatus: (id: string, status: Batch['trangThai']) => void
  reset: () => void
}

const initialBatches: Batch[] = [
  {
    maLoHang: 'B-1001',
    maSanPham: 1,
    maDonViSanXuat: 10,
    maQR: 'QR-1001',
    ngayThuHoach: '2026-08-01',
    khoiLuong: 120,
    trangThai: 'Created',
    tenSanPham: 'Organic Tomato',
    tenDonViSanXuat: 'Green Valley Farm',
    viTri: 'Da Lat',
    events: [
      { maSuKien: 'e1', loaiSuKien: 'Harvest', thoiGian: '2026-08-01 06:30', maDonViThucHien: 'D-01', ghiChu: 'Fresh harvest recorded.' },
      { maSuKien: 'e2', loaiSuKien: 'Process', thoiGian: '2026-08-01 10:00', maDonViThucHien: 'D-02', ghiChu: 'Packed for delivery.' },
    ],
  },
  {
    maLoHang: 'B-1002',
    maSanPham: 2,
    maDonViSanXuat: 11,
    maQR: 'QR-1002',
    ngayThuHoach: '2026-08-03',
    khoiLuong: 90,
    trangThai: 'InTransit',
    tenSanPham: 'Fresh Mango',
    tenDonViSanXuat: 'Sunrise Orchard',
    viTri: 'Binh Thuan',
    events: [
      { maSuKien: 'e3', loaiSuKien: 'Harvest', thoiGian: '2026-08-03 07:00', maDonViThucHien: 'D-03', ghiChu: 'Harvest completed.' },
    ],
  },
]

export const useBatchesStore = create<BatchesState>((set) => ({
  batches: initialBatches,
  selectedBatchId: initialBatches[0]?.maLoHang ?? null,
  setSelectedBatchId: (id) => set({ selectedBatchId: id }),
  createBatch: (batch) => set((state) => ({ batches: [batch, ...state.batches] })),
  updateBatchStatus: (id, status) =>
    set((state) => ({
      batches: state.batches.map((batch) => (batch.maLoHang === id ? { ...batch, trangThai: status } : batch)),
    })),
  reset: () => set({ batches: initialBatches, selectedBatchId: initialBatches[0]?.maLoHang ?? null }),
}))
