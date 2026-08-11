import { Chip } from '@mui/material'
import { DEFAULT_STATUS_STYLE, STATUS_STYLES } from '@/config/constants'

interface Props {
  status: string
}

export function StatusChip({ status }: Props) {
  const style = STATUS_STYLES[status] ?? { label: status, ...DEFAULT_STATUS_STYLE }

  return (
    <Chip
      label={style.label}
      size="small"
      sx={{ bgcolor: style.bg, color: style.color, fontWeight: 800, fontSize: 12 }}
    />
  )
}
