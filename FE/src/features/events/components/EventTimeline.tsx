import { Box, Chip, Tooltip, Typography, type ChipProps } from '@mui/material'
import { EVENT_TYPE_LABELS, type BatchEvent, type EventType } from '../events.types'

const EVENT_TYPE_COLORS: Record<EventType, ChipProps['color']> = {
  HARVEST: 'success',
  PROCESS: 'info',
  PACKAGE: 'secondary',
  TRANSPORT: 'warning',
  DISTRIBUTE: 'primary',
  RETAIL: 'success',
}

interface Props {
  events: BatchEvent[]
}

export function EventTimeline({ events }: Props) {
  if (events.length === 0) {
    return <Typography color="text.secondary">Chưa có sự kiện nào.</Typography>
  }

  return (
    <Box>
      {events.map((event) => (
        <Box key={event.eventId} sx={{ borderLeft: '3px solid', borderColor: 'primary.main', pl: 2, py: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip label={EVENT_TYPE_LABELS[event.eventType]} color={EVENT_TYPE_COLORS[event.eventType]} size="small" />
            <Typography variant="body2">{new Date(event.eventTime).toLocaleString('vi-VN')}</Typography>
          </Box>

          <Typography sx={{ mt: 1 }}>{event.location || 'Không có địa điểm'}</Typography>

          {event.additionalData && (
            <Typography variant="body2" color="text.secondary">
              {event.additionalData}
            </Typography>
          )}

          <Tooltip title={event.currentHash}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', wordBreak: 'break-all', fontFamily: 'monospace' }}
            >
              Hash: {event.currentHash}
            </Typography>
          </Tooltip>
        </Box>
      ))}
    </Box>
  )
}
