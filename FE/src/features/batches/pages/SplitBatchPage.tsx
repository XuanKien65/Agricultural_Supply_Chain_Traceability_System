import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Box, Button, IconButton, Paper, TextField, Typography } from '@mui/material'
import { AddRounded, ArrowBackRounded, DeleteOutlineRounded } from '@mui/icons-material'
import { useAuthStore } from '@/features/auth/auth.store'
import { useBatch, useSplitBatch } from '../batches.queries'

export function SplitBatchPage() {
  const { batchId } = useParams()
  const id = Number(batchId)
  const user = useAuthStore((s) => s.user)
  const { data: batch, isLoading } = useBatch(id)
  const split = useSplitBatch(id)

  const [children, setChildren] = useState<string[]>(['', ''])
  const [location, setLocation] = useState('')

  const total = children.reduce((sum, v) => sum + (Number(v) || 0), 0)
  const overLimit = batch ? total > batch.weight : false

  function updateChild(index: number, value: string) {
    setChildren((prev) => prev.map((v, i) => (i === index ? value : v)))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!user?.organizationId || !batch) return
    const childBatches = children.filter((v) => Number(v) > 0).map((v) => ({ quantity: Number(v) }))
    if (childBatches.length < 2) return
    await split.mutateAsync({
      organizationId: user.organizationId,
      performedByUserId: user.id,
      childBatches,
      location: location || undefined,
    })
  }

  if (isLoading) return <Typography sx={{ p: 4, textAlign: 'center' }}>Đang tải…</Typography>
  if (!batch) return <Alert severity="warning">Không tìm thấy lô hàng.</Alert>

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Button component={Link} to={`/batches/${id}`} startIcon={<ArrowBackRounded />} size="small" sx={{ alignSelf: 'flex-start', textTransform: 'none' }}>
        Quay lại lô hàng
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 900 }}>
        Tách lô: {batch.batchCode}
      </Typography>
      <Typography color="text.secondary">
        Số lượng hiện có: <strong>{batch.weight.toLocaleString('vi-VN')} {batch.unit}</strong>
      </Typography>

      {split.isSuccess ? (
        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Tách lô thành công — đã tạo {split.data.childBatches.length} lô con.
          </Alert>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {split.data.childBatches.map((c) => (
              <Button key={c.batchId} component={Link} to={`/batches/${c.batchId}`} variant="outlined" sx={{ justifyContent: 'space-between', textTransform: 'none' }}>
                <span>{c.batchCode}</span>
                <span>{c.quantity.toLocaleString('vi-VN')} {batch.unit}</span>
              </Button>
            ))}
          </Box>
        </Paper>
      ) : (
        <Paper component="form" onSubmit={submit} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontWeight: 700 }}>Số lượng từng lô con</Typography>
          {children.map((v, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                type="number"
                size="small"
                label={`Lô con #${i + 1}`}
                value={v}
                onChange={(e) => updateChild(i, e.target.value)}
                slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                sx={{ flex: 1 }}
              />
              <IconButton
                size="small"
                disabled={children.length <= 2}
                onClick={() => setChildren((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <DeleteOutlineRounded fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddRounded />} onClick={() => setChildren((prev) => [...prev, ''])} sx={{ alignSelf: 'flex-start', textTransform: 'none' }}>
            Thêm lô con
          </Button>

          <TextField label="Vị trí thực hiện" value={location} onChange={(e) => setLocation(e.target.value)} />

          <Typography color={overLimit ? 'error' : 'text.secondary'} variant="body2">
            Tổng: {total.toLocaleString('vi-VN')} / {batch.weight.toLocaleString('vi-VN')} {batch.unit}
          </Typography>

          {overLimit && <Alert severity="error">Tổng số lượng lô con vượt quá số lượng lô cha.</Alert>}
          {split.isError && (
            <Alert severity="error">{split.error instanceof Error ? split.error.message : 'Tách lô thất bại.'}</Alert>
          )}

          <Button type="submit" variant="contained" disabled={overLimit || split.isPending} sx={{ textTransform: 'none', fontWeight: 700 }}>
            {split.isPending ? 'Đang xử lý…' : 'Xác nhận tách lô'}
          </Button>
        </Paper>
      )}
    </Box>
  )
}
