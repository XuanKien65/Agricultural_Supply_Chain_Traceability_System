import type { CreateBatchInput, FarmerBatch, Product } from './batches.types'

// Temporary API adapter. Replace these bodies with `http.get/post` when BE is connected.
export const products: Product[] = [
  { productId: 1, name: 'Cà chua bi', unit: 'kg', description: 'Cà chua canh tác theo tiêu chuẩn VietGAP' },
  { productId: 2, name: 'Xoài cát Hòa Lộc', unit: 'kg', description: 'Xoài thu hoạch tại vùng trồng đạt chuẩn' },
  { productId: 3, name: 'Rau xà lách', unit: 'kg', description: 'Rau ăn lá canh tác an toàn' },
]

let batches: FarmerBatch[] = [
  { batchId: 1, batchCode: 'BTH-20260801-001', productId: 1, productName: 'Cà chua bi', unit: 'kg', producerOrganizationId: 1, producerOrganizationName: 'Nông trại Xanh Đà Lạt', harvestDate: '2026-08-01', weight: 500, status: 'Created', qrCode: '/trace/1', createdAt: '2026-08-01T06:05:00Z', events: [{ eventId: 1, eventType: 'HARVEST', eventTime: '2026-08-01T06:00:00Z', location: 'Đà Lạt, Lâm Đồng', additionalData: 'Thu hoạch buổi sáng, độ ẩm 72%', currentHash: 'a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2' }] },
  { batchId: 2, batchCode: 'BTH-20260807-002', productId: 3, productName: 'Rau xà lách', unit: 'kg', producerOrganizationId: 1, producerOrganizationName: 'Nông trại Xanh Đà Lạt', harvestDate: '2026-08-07', weight: 180, status: 'InTransit', qrCode: '/trace/2', createdAt: '2026-08-07T05:35:00Z', events: [{ eventId: 2, eventType: 'HARVEST', eventTime: '2026-08-07T05:30:00Z', location: 'Đà Lạt, Lâm Đồng', currentHash: 'b4a2c1d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2' }] },
]
const delay = () => new Promise((resolve) => setTimeout(resolve, 180))

export const batchesApi = {
  async getProducts() { await delay(); return products },
  async getBatches(organizationId: number) { await delay(); return batches.filter((x) => x.producerOrganizationId === organizationId) },
  async getBatch(id: number, organizationId: number) { await delay(); return batches.find((x) => x.batchId === id && x.producerOrganizationId === organizationId) ?? null },
  async createBatch(input: CreateBatchInput) {
    await delay(); const product = products.find((x) => x.productId === input.productId)
    if (!product) throw new Error('Sản phẩm không tồn tại')
    const id = Math.max(0, ...batches.map((x) => x.batchId)) + 1
    const timestamp = new Date().toISOString(); const batchCode = `BTH-${input.harvestDate.replaceAll('-', '')}-${String(id).padStart(3, '0')}`
    const batch: FarmerBatch = { batchId: id, batchCode, productId: product.productId, productName: product.name, unit: product.unit, producerOrganizationId: input.producerOrganizationId, producerOrganizationName: 'Nông trại Xanh Đà Lạt', harvestDate: input.harvestDate, weight: input.weight, status: 'Created', qrCode: `/trace/${id}`, createdAt: timestamp, events: [{ eventId: Date.now(), eventType: 'HARVEST', eventTime: `${input.harvestDate}T06:00:00Z`, location: input.location, additionalData: input.harvestNotes, currentHash: crypto.randomUUID().replaceAll('-', '').padEnd(64, '0') }] }
    batches = [batch, ...batches]; return batch
  },
}
