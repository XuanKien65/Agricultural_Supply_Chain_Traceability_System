import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material'
import { QrCodeScannerRounded } from '@mui/icons-material'
import { StatusChip } from '@/components/ui/StatusChip'
import { useAuthStore } from '@/features/auth/auth.store'
import { QrScannerDialog } from '@/features/batches/components/QrScannerDialog'
import { EventTimeline } from '../components/EventTimeline'
import { useAppendEvent, useBatch } from '../events.queries'
import { EVENT_TYPE_LABELS, ORG_TYPE_EVENT_TYPES, type EventType } from '../events.types'

/** Sự kiện tự do chọn (không theo thứ tự cứng) — SPLIT/MERGE có màn riêng, HARVEST tự sinh khi tạo lô. */
function allowedEventTypes(organizationType: string | null | undefined): EventType[] {
  if (!organizationType) return []
  const types = ORG_TYPE_EVENT_TYPES[organizationType] ?? []
  return types.filter((t) => t !== 'SPLIT' && t !== 'MERGE' && t !== 'HARVEST')
}

export function RecordEventPage() {
  const params = useParams<{ batchId?: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const batchId = Number(params.batchId) || 0
  const [batchIdInput, setBatchIdInput] = useState(params.batchId ?? '')
  const [scannerOpen, setScannerOpen] = useState(false)
  const { data: batch, isLoading, isError, error } = useBatch(batchId)
  const appendEvent = useAppendEvent(batchId)

  const eligibleTypes = allowedEventTypes(user?.organizationType)
  const [eventType, setEventType] = useState<EventType | ''>('')
  const [form, setForm] = useState({ location: '', additionalData: '' })

  useEffect(() => {
    setEventType(eligibleTypes[0] ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId])

  function search(e: FormEvent) {
    e.preventDefault()
    if (batchIdInput.trim()) navigate(`/record-event/${batchIdInput.trim()}`)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!user?.organizationId || !eventType) return
    await appendEvent.mutateAsync({
      organizationId: user.organizationId,
      performedByUserId: user.id,
      eventType,
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
        Tra cứu lô hàng theo mã số (hoặc quét QR) và ghi nhận công đoạn của đơn vị bạn.
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
        <Button variant="outlined" startIcon={<QrCodeScannerRounded />} onClick={() => setScannerOpen(true)}>
          Quét QR
        </Button>
      </Paper>

      <QrScannerDialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanned={(id) => {
          setScannerOpen(false)
          navigate(`/record-event/${id}`)
        }}
      />

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
              Ghi nhận công đoạn
            </Typography>

            {eligibleTypes.length === 0 && (
              <Alert severity="info">
                Tài khoản của bạn hiện không có công đoạn nào để ghi nhận cho lô hàng này.
              </Alert>
            )}

            {eligibleTypes.length > 0 && (
              <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  select
                  label="Loại sự kiện"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                >
                  {eligibleTypes.map((t) => (
                    <MenuItem key={t} value={t}>
                      {EVENT_TYPE_LABELS[t]}
                    </MenuItem>
                  ))}
                </TextField>
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
                <Button type="submit" variant="contained" disabled={appendEvent.isPending || !eventType}>
                  {appendEvent.isPending ? 'Đang ghi…' : `Ghi nhận: ${eventType ? EVENT_TYPE_LABELS[eventType] : ''}`}
                </Button>
              </Box>
            )}
          </Paper>
        </>
      )}
    </Box>
  )
}
