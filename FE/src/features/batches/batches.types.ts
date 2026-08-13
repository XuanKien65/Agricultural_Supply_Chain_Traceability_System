export type BatchStatus = 'Created' | 'InTransit' | 'Processed' | 'Distributed' | 'Recalled'
export interface Product { productId: number; name: string; unit: string; description?: string }
export interface BatchEvent { eventId: number; eventType: 'HARVEST'; eventTime: string; location?: string; additionalData?: string; previousHash?: string; currentHash: string }
export interface FarmerBatch { batchId: number; batchCode: string; productId: number; productName: string; unit: string; producerOrganizationId: number; producerOrganizationName: string; harvestDate: string; weight: number; status: BatchStatus; qrCode: string; createdAt: string; events: BatchEvent[] }
export interface CreateBatchInput { productId: number; producerOrganizationId: number; performedByUserId: number; harvestDate: string; weight: number; location?: string; harvestNotes?: string }
