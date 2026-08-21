export interface QualityInspectionItem {
  id: string
  batchId: string
  inspectionDate: string
  inspector: string
  result: 'Pass' | 'Fail' | 'Conditional'
  passedCount: number
  totalCount: number
  notes: string
}

const INITIAL_INSPECTIONS: QualityInspectionItem[] = [
  {
    id: 'I001',
    batchId: 'B001',
    inspectionDate: '2026-01-15 10:30',
    inspector: 'Đội KCS Nông trại Đà Lạt',
    result: 'Pass',
    passedCount: 5,
    totalCount: 5,
    notes: 'Lô hàng dâu tây đạt 5/5 tiêu chí VietGAP xuất khẩu.',
  },
  {
    id: 'I002',
    batchId: 'B002',
    inspectionDate: '2026-01-18 09:30',
    inspector: 'Phòng Lab Nông nghiệp Xanh',
    result: 'Pass',
    passedCount: 5,
    totalCount: 5,
    notes: 'Hàm lượng nitrat và vi sinh đạt chuẩn Organic quốc tế.',
  },
  {
    id: 'I003',
    batchId: 'B005',
    inspectionDate: '2026-01-19 14:00',
    inspector: 'Trung tâm Giám định Chất lượng',
    result: 'Fail',
    passedCount: 3,
    totalCount: 5,
    notes: 'Phát hiện dư lượng thuốc BVTV vượt ngưỡng quy định 0.05mg/kg.',
  },
]

const STORAGE_KEY = 'agri_inspections_v1'

export function getStoredInspections(): QualityInspectionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_INSPECTIONS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INSPECTIONS
  } catch {
    return INITIAL_INSPECTIONS
  }
}

export function saveNewInspection(item: Omit<QualityInspectionItem, 'id'>): QualityInspectionItem {
  const current = getStoredInspections()
  const nextNum = current.length + 1
  const id = `I${String(nextNum).padStart(3, '0')}`

  const newItem: QualityInspectionItem = {
    ...item,
    id,
  }

  const updated = [newItem, ...current]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Failed to save inspection to localStorage', e)
  }

  return newItem
}
