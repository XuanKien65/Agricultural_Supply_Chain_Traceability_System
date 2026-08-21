export interface RecentBatchEntry {
  batchId: number
  batchCode: string
  productName: string
  viewedAt: string
}

const MAX_ENTRIES = 10

function storageKey(userId: number) {
  return `recent-batches:${userId}`
}

export function getRecentBatches(userId: number): RecentBatchEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? (JSON.parse(raw) as RecentBatchEntry[]) : []
  } catch {
    return []
  }
}

export function addRecentBatch(userId: number, entry: Omit<RecentBatchEntry, 'viewedAt'>) {
  const existing = getRecentBatches(userId).filter((x) => x.batchId !== entry.batchId)
  const updated = [{ ...entry, viewedAt: new Date().toISOString() }, ...existing].slice(0, MAX_ENTRIES)
  localStorage.setItem(storageKey(userId), JSON.stringify(updated))
}
