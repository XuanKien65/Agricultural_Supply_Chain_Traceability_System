import { Chip } from '@mui/material'

interface Props {
  status: string
}

const palette: Record<
  string,
  {
    label: string
    bg: string
    color: string
  }
> = {
  Active: {
    label: 'Hoạt động',
    bg: '#E8F5E9',
    color: '#1B5E20',
  },

  Inactive: {
    label: 'Ngừng hoạt động',
    bg: '#ECEFF1',
    color: '#455A64',
  },

  Created: {
    label: 'Mới tạo',
    bg: '#E3F2FD',
    color: '#1565C0',
  },

  InTransit: {
    label: 'Đang vận chuyển',
    bg: '#FFF3E0',
    color: '#E65100',
  },

  Processed: {
    label: 'Đã chế biến',
    bg: '#F3E5F5',
    color: '#7B1FA2',
  },

  Distributed: {
    label: 'Đã phân phối',
    bg: '#E0F2F1',
    color: '#00695C',
  },

  Recalled: {
    label: 'Đã thu hồi',
    bg: '#FFEBEE',
    color: '#C62828',
  },

  Passed: {
    label: 'Đạt',
    bg: '#E8F5E9',
    color: '#1B5E20',
  },

  Failed: {
    label: 'Không đạt',
    bg: '#FFEBEE',
    color: '#C62828',
  },

  Critical: {
    label: 'Nghiêm trọng',
    bg: '#FFEBEE',
    color: '#C62828',
  },

  High: {
    label: 'Cao',
    bg: '#FFF3E0',
    color: '#E65100',
  },

  Medium: {
    label: 'Trung bình',
    bg: '#FFF8E1',
    color: '#F57F17',
  },

  Low: {
    label: 'Thấp',
    bg: '#E3F2FD',
    color: '#1565C0',
  },

  Resolved: {
    label: 'Đã xử lý',
    bg: '#E8F5E9',
    color: '#1B5E20',
  },

  Cancelled: {
    label: 'Đã hủy',
    bg: '#ECEFF1',
    color: '#455A64',
  },

  Pending: {
    label: 'Chờ xác nhận',
    bg: '#FFF8E1',
    color: '#F57F17',
  },

  Acknowledged: {
    label: 'Đã xác nhận',
    bg: '#E3F2FD',
    color: '#1565C0',
  },
}

export function StatusChip({
  status,
}: Props) {
  const style =
    palette[status] ?? {
      label: status,
      bg: '#ECEFF1',
      color: '#455A64',
    }

  return (
    <Chip
      label={style.label}
      size="small"
      sx={{
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 800,
        fontSize: 12,
      }}
    />
  )
}