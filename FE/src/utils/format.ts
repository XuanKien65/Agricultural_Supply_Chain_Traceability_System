/** Hàm format dùng chung toàn app — tránh mỗi nơi tự gọi toLocaleString rải rác. */

export function formatNumber(value?: number | null): string {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return n.toLocaleString('vi-VN')
}

export function formatCurrency(value?: number | null): string {
  return `${formatNumber(value)}đ`
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('vi-VN')
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('vi-VN')
}
