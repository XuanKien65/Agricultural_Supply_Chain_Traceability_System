import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, Chip, Paper, TextField, Typography } from '@mui/material'
import { AccountTreeRounded } from '@mui/icons-material'
import { PageHeader } from '@/components/ui/PageHeader'
import { EVENT_TYPE_LABELS, type EventType } from '@/features/events/events.types'
import { useTraceback } from '../analytics.queries'

export function TracebackPage() {
  const params = useParams<{ batchId?: string }>()
  const navigate = useNavigate()
  const batchId = Number(params.batchId) || 0
  const [input, setInput] = useState(params.batchId ?? '')
  const { data, isLoading, isError, error } = useTraceback(batchId)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (input.trim()) navigate(`/analytics/traceback/${input.trim()}`)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader title="Truy Vết Ngược" description="Tìm nguồn gốc và toàn bộ lô hàng liên quan khi có sự cố." />

      <Paper component="form" onSubmit={submit} sx={{ p: 2, display: 'flex', gap: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <TextField size="small" label="ID lô hàng cần truy vết" value={input} onChange={(e) => setInput(e.target.value)} sx={{ flex: 1 }} />
        <Button type="submit" variant="contained" startIcon={<AccountTreeRounded />}>
          Truy vết
        </Button>
      </Paper>

      {isLoading && batchId > 0 && <Typography color="text.secondary">Đang truy vết…</Typography>}
      {isError && <Alert severity="error">{error instanceof Error ? error.message : 'Không tìm thấy lô hàng.'}</Alert>}

      {data && (
        <>
          <Alert severity="info">
            Lô mục tiêu: <strong>{data.targetBatchCode}</strong> (ID {data.targetBatchId})
          </Alert>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Cây phả hệ nguồn gốc
            </Typography>
            {data.ancestors.length === 0 ? (
              <Typography color="text.secondary">Lô này không có lô cha (là lô gốc).</Typography>
            ) : (
              data.ancestors
                .slice()
                .sort((a, b) => a.depth - b.depth)
                .map((a) => (
                  <Box key={a.batchId} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.8, pl: a.depth * 3 }}>
                    <Chip label={`depth ${a.depth}`} size="small" variant="outlined" />
                    <Typography sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{a.batchCode}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {a.organizationName ?? '—'} · {a.quantity.toLocaleString('vi-VN')} · {new Date(a.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                ))
            )}
          </Paper>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Dòng thời gian sự kiện liên quan
            </Typography>
            {data.timeline.length === 0 ? (
              <Typography color="text.secondary">Chưa có sự kiện nào.</Typography>
            ) : (
              data.timeline.map((ev, i) => (
                <Box key={i} sx={{ borderLeft: '3px solid', borderColor: 'primary.main', pl: 2, py: 1, mb: 1.5 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip label={EVENT_TYPE_LABELS[ev.eventType as EventType] ?? ev.eventType} size="small" />
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {ev.batchCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(ev.createdAt).toLocaleString('vi-VN')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {ev.organizationName ?? '—'} {ev.location ? `· ${ev.location}` : ''}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </>
      )}
    </Box>
  )
}
