export interface ApiEnvelope<T> {
  statusCode: number
  isSuccess: boolean
  errorMessages: string[]
  data?: T
  result: T
}

export interface AdminRole {
  name: string
  description: string
  userCount: number
}

export interface AdminOrganization {
  id: number
  name: string
  type: string
  status: string
  address?: string | null
  phone?: string | null
  email?: string | null
  contactPerson?: string | null
  isActive?: boolean
  createdAt: string | null
}

export interface AdminUser {
  id: number
  fullName: string | null
  email: string
  role: string
  organizationId: number | null
  organizationName: string | null
  isActive: boolean
  createdAt: string | null
}

export interface AdminProduct {
  id: number
  name: string | null
  category: string | null
  unit: string | null
  organizationId: number
  organizationName: string | null
}

export interface AdminBatch {
  id: number
  productId: number
  productName: string | null
  batchCode: string
  quantity: number
  currentOrganizationId: number | null
  currentOrganizationName: string | null
  parentBatchId: number | null
  rootBatchId: number | null
  qrCode: string | null
  createdAt: string | null
}

export interface AdminSupplyChainEvent {
  id: number
  batchId: number
  batchCode: string | null
  eventType: string
  organizationId: number
  organizationName: string | null
  userId: number
  userName: string | null
  eventData: string | null
  location: string | null
  previousHash: string | null
  currentHash: string | null
  createdAt: string | null
}

export interface AdminInspection {
  id: number
  batchId: number
  batchCode: string | null
  inspectorId: number
  inspectorName: string | null
  result: string | null
  notes: string | null
  createdAt: string | null
}

export interface AdminCertificate {
  id: number
  batchId: number
  batchCode: string | null
  inspectionId: number | null
  certificateType: string | null
  fileUrl: string | null
  issuedAt: string | null
}

export interface AdminRecall {
  id: number
  batchId: number
  batchCode: string | null
  reason: string | null
  severity: string | null
  createdBy: number
  createdByName: string | null
  isResolved?: boolean
  resolvedAt?: string | null
  createdAt: string | null
}

export interface AdminDashboard {
  organizationCount: number
  userCount: number
  batchCount: number
  recallCount: number
  recentBatches: AdminBatch[]
}

export interface AdminUserFormData {
  fullName: string
  email: string
  password: string
  role: string
  organizationId: number | null
  isActive: boolean
}

export interface AdminUserPayload {
  fullName: string | null
  email: string
  password?: string
  role: string
  organizationId: number | null
  isActive: boolean
}

export interface AdminOrganizationPayload {
  name: string
  type: string
  status: string
}

export interface AdminProductPayload {
  name: string | null
  category: string | null
  unit: string | null
  organizationId: number
}

export interface AdminBatchPayload {
  productId: number
  batchCode: string
  quantity: number
  currentOrganizationId: number | null
  parentBatchId: number | null
  rootBatchId: number | null
  qrCode: string | null
}

export interface AdminEventPayload {
  batchId: number
  eventType: string
  organizationId: number
  userId: number
  eventData: string | null
  location: string | null
  previousHash: string | null
  currentHash: string | null
}

export interface AdminInspectionPayload {
  batchId: number
  inspectorId: number
  result: string | null
  notes: string | null
}

export interface AdminCertificatePayload {
  batchId: number
  inspectionId: number | null
  certificateType: string | null
  fileUrl: string | null
}

export interface AdminRecallPayload {
  batchId: number
  reason: string | null
  severity: string | null
  createdBy: number
}