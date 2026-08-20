import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Box, Button, IconButton, Paper, TextField, Typography } from '@mui/material'
import { AddRounded, ArrowBackRounded, DeleteOutlineRounded, QrCodeScannerRounded } from '@mui/icons-material'
import { useAuthStore } from '@/features/auth/auth.store'
import { batchesApi } from '../batches.api'
import type { FarmerBatchDto } from '../batches.types'
import { useMergeBatches } from '../batches.queries'
import { QrScannerDialog } from '../components/QrScannerDialog'

interface SourceRow {
  batchId: number
  quantity: string
  preview?: FarmerBatchDto
  error?: string
}

export function MergeBatchPage() {
  const user = useAuthStore((s) => s.user)
  const merge = useMergeBatches()

  const [sources, setSources] = useState<SourceRow[]>([])
  const [batchIdInput, setBatchIdInput] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(false)

  const productIds = new Set(sources.filter((s) => s.preview).map((s) => s.preview!.productId))
  const productMismatch = productIds.size > 1
  const total = sources.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0)

  async function addSource(id: number) {
    if (!id || sources.some((s) => s.batchId === id)) return
    setLoadingPreview(true)
    try {
      const preview = await batchesApi.getBatch(id)
      setSources((prev) => [...prev, { batchId: id, quantity: String(preview.weight), preview }])
    } catch {
      setSources((prev) => [...prev, { batchId: id, quantity: '', error: 'Không tìm thấy lô hàng này.' }])
    } finally {
      setLoadingPreview(false)
      setBatchIdInput('')
    }
  }

  function updateQuantity(index: number, value: string) {
    setSources((prev) => prev.map((s, i) => (i === index ? { ...s, quantity: value } : s)))
  }

  function removeSource(index: number) {
    setSources((prev) => prev.filter((_, i) => i !== index))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!user?.organizationId || sources.length < 2 || productMismatch) return
    await merge.mutateAsync({
      organizationId: user.organizationId,
      performedByUserId: user.id,
      sources: sources.map((s) => ({ batchId: s.batchId, quantity: Number(s.quantity) })),
      location: location || undefined,
      description: description || undefined,
    })
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Button component={Link} to="/batches" startIcon={<ArrowBackRounded />} size="small" sx={{ alignSelf: 'flex-start', textTransform: 'none' }}>
        Quay lại danh sách lô
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 900 }}>
        Gộp lô hàng
      </Typography>
      <Typography color="text.secondary">
        Chọn các lô nguồn cùng sản phẩm (quét QR hoặc nhập ID) để gộp thành một lô mới.
      </Typography>

      {merge.isSuccess ? (
        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Gộp lô thành công — tạo lô mới {merge.data.batchCode} với tổng {merge.data.totalQuantity.toLocaleString('vi-VN')}.
          </Alert>
          <Button component={Link} to={`/batches/${merge.data.resultBatchId}`} variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Xem lô hàng mới
          </Button>
        </Paper>
      ) : (
        <Paper component="form" onSubmit={submit} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              label="Thêm lô nguồn theo ID"
              value={batchIdInput}
              onChange={(e) => setBatchIdInput(e.target.value)}
              sx={{ flex: 1 }}
            />
            <Button variant="outlined" disabled={!batchIdInput.trim() || loadingPreview} onClick={() => void addSource(Number(batchIdInput.trim()))}>
              Thêm
            </Button>
            <Button variant="outlined" startIcon={<QrCodeScannerRounded />} onClick={() => setScannerOpen(true)}>
              Quét QR
            </Button>
          </Box>

          <QrScannerDialog
            open={scannerOpen}
            onClose={() => setScannerOpen(false)}
            onScanned={(id) => {
              setScannerOpen(false)
              void addSource(id)
            }}
          />

          {sources.length === 0 && <Typography color="text.secondary">Chưa có lô nguồn nào.</Typography>}

          {sources.map((s, i) => (
            <Box key={s.batchId} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {s.error ? (
                <Alert severity="error" sx={{ flex: 1 }}>
                  Lô #{s.batchId}: {s.error}
                </Alert>
              ) : (
                <>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{s.preview?.batchCode}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {s.preview?.productName} — hiện có {s.preview?.weight.toLocaleString('vi-VN')} {s.preview?.unit}
                    </Typography>
                  </Box>
                  <TextField
                    type="number"
                    size="small"
                    label="Số lượng lấy"
                    value={s.quantity}
                    onChange={(e) => updateQuantity(i, e.target.value)}
                    sx={{ width: 140 }}
                    slotProps={{ htmlInput: { min: 0.01, step: 0.01, max: s.preview?.weight } }}
                  />
                </>
              )}
              <IconButton size="small" onClick={() => removeSource(i)}>
                <DeleteOutlineRounded fontSize="small" />
              </IconButton>
            </Box>
          ))}

          {productMismatch && <Alert severity="error">Các lô nguồn phải cùng một sản phẩm.</Alert>}

          <TextField label="Vị trí thực hiện" value={location} onChange={(e) => setLocation(e.target.value)} />
          <TextField label="Ghi chú" multiline minRows={2} value={description} onChange={(e) => setDescription(e.target.value)} />

          <Typography color="text.secondary" variant="body2">
            Tổng số lượng gộp: {total.toLocaleString('vi-VN')}
          </Typography>

          {merge.isError && (
            <Alert severity="error">{merge.error instanceof Error ? merge.error.message : 'Gộp lô thất bại.'}</Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={sources.length < 2 || productMismatch || merge.isPending}
            startIcon={<AddRounded />}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {merge.isPending ? 'Đang xử lý…' : 'Xác nhận gộp lô'}
          </Button>
        </Paper>
      )}
    </Box>
  )
}
