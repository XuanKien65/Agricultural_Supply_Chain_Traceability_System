import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material'
import { StatusChip } from '@/components/ui/StatusChip'
import { useAuthStore } from '@/features/auth/auth.store'
import { EventTimeline } from '../components/EventTimeline'
import { useAppendEvent, useBatch } from '../events.queries'
import { EVENT_ORDER, EVENT_TYPE_LABELS, ROLE_EVENT_TYPES } from '../events.types'

export function RecordEventPage() {
  const params = useParams<{ batchId?: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const batchId = Number(params.batchId) || 0
  const [batchIdInput, setBatchIdInput] = useState(params.batchId ?? '')
  const { data: batch, isLoading, isError, error } = useBatch(batchId)
  const appendEvent = useAppendEvent(batchId)
  const [form, setForm] = useState({ location: '', additionalData: '' })

  function search(e: FormEvent) {
    e.preventDefault()
    if (batchIdInput.trim()) navigate(`/events/${batchIdInput.trim()}`)
  }

  const lastType = batch?.events.at(-1)?.eventType
  const lastIndex = lastType ? EVENT_ORDER.indexOf(lastType) : -1
  const nextType = lastIndex >= 0 && lastIndex + 1 < EVENT_ORDER.length ? EVENT_ORDER[lastIndex + 1] : null
  const allowedTypes = user ? (ROLE_EVENT_TYPES[user.role] ?? []) : []
  const canRecord = !!nextType && allowedTypes.includes(nextType)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!user?.organizationId || !nextType) return
    await appendEvent.mutateAsync({
      organizationId: user.organizationId,
      performedByUserId: user.id,
      eventType: nextType,
      location: form.location || undefined,
      additionalData: form.additionalData || undefined,
    })
    setForm({ location: '', additionalData: '' })
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography color="primary" sx={{ fontWeight: 800 }}>
        CHUỖI CUNG ỨNG
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 900 }}>
        Ghi nhận sự kiện
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Tra cứu lô hàng theo mã số và ghi nhận công đoạn tiếp theo trong hành trình.
      </Typography>

      <Paper component="form" onSubmit={search} sx={{ p: 2, mb: 3, display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          label="Mã lô hàng"
          placeholder="VD: 1"
          value={batchIdInput}
          onChange={(e) => setBatchIdInput(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button type="submit" variant="contained">
          Tra cứu
        </Button>
      </Paper>

      {isLoading && batchId > 0 && <Typography>Đang tải…</Typography>}
      {isError && <Alert severity="error">{error instanceof Error ? error.message : 'Không tìm thấy lô hàng.'}</Alert>}

      {batch && (
        <>
          <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {batch.batchCode}
                </Typography>
                <Typography color="text.secondary">
                  {batch.productName} • {batch.weight} {batch.unit}
                </Typography>
              </Box>
              <StatusChip status={batch.status} />
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Lịch sử chuỗi cung ứng
            </Typography>
            <EventTimeline events={batch.events} />
          </Paper>

          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Ghi nhận công đoạn tiếp theo
            </Typography>

            {!nextType && <Alert severity="success">Lô hàng đã hoàn tất toàn bộ chuỗi cung ứng.</Alert>}

            {nextType && !canRecord && (
              <Alert severity="info">
                Lô hàng đang chờ công đoạn &quot;{EVENT_TYPE_LABELS[nextType]}&quot; — không thuộc vai trò của bạn.
              </Alert>
            )}

            {nextType && canRecord && (
              <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  label="Vị trí"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
                <TextField
                  multiline
                  minRows={3}
                  label="Ghi chú (nhiệt độ, độ ẩm, biển số xe...)"
                  value={form.additionalData}
                  onChange={(e) => setForm({ ...form, additionalData: e.target.value })}
                />
                {appendEvent.isError && (
                  <Alert severity="error">
                    {appendEvent.error instanceof Error ? appendEvent.error.message : 'Ghi sự kiện thất bại.'}
                  </Alert>
                )}
                <Button type="submit" variant="contained" disabled={appendEvent.isPending}>
                  {appendEvent.isPending ? 'Đang ghi…' : `Ghi nhận: ${EVENT_TYPE_LABELS[nextType]}`}
                </Button>
              </Box>
            )}
          </Paper>
        </>
      )}
    </Box>
  )
}
