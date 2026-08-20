import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  ImageList,
  ImageListItem,
  Paper,
  Typography,
} from '@mui/material'
import {
  AddPhotoAlternateRounded,
  ArrowBackRounded,
  CallMergeRounded,
  CallSplitRounded,
  DownloadRounded,
  EventRounded,
  OpenInNewRounded,
  PrintRounded,
  TravelExploreRounded,
  VerifiedRounded,
} from '@mui/icons-material'
import { QRCodeCanvas } from 'qrcode.react'
import { env } from '@/config/env'
import { StatusChip } from '@/components/ui/StatusChip'
import { useAuthStore } from '@/features/auth/auth.store'
import { EventTimeline } from '@/features/events/components/EventTimeline'
import type { EventType } from '@/features/events/events.types'
import { useBatch, useUploadBatchImage, useVerifyHashChain } from '../batches.queries'
import { addRecentBatch } from '../recentBatches'

export function BatchDetailPage() {
  const { batchId } = useParams()
  const id = Number(batchId)
  const user = useAuthStore((s) => s.user)
  const { data: batch, isLoading } = useBatch(id)
  const verify = useVerifyHashChain(id)
  const upload = useUploadBatchImage(id)
  const qrRef = useRef<HTMLCanvasElement>(null)
  const [sessionImages, setSessionImages] = useState<string[]>([])

  useEffect(() => {
    if (batch && user) {
      addRecentBatch(user.id, { batchId: batch.batchId, batchCode: batch.batchCode, productName: batch.productName })
    }
  }, [batch, user])

  if (isLoading) {
    return <Typography sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>Đang tải thông tin lô hàng...</Typography>
  }

  if (!batch) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        Không tìm thấy thông tin lô hàng.{' '}
        <Button component={Link} to="/batches" size="small">
          Quay lại danh sách
        </Button>
      </Alert>
    )
  }

  const canRecordEvent = user?.role === 'OPERATOR'
  const canSplitMerge =
    user?.role === 'ADMIN' ||
    (user?.role === 'OPERATOR' && ['PROCESSOR', 'DISTRIBUTOR'].includes(user.organizationType ?? ''))
  const canTraceback = user?.role === 'ADMIN' || user?.role === 'INSPECTOR'
  const orgLabel =
    user?.organizationId === batch.producerOrganizationId && user.organizationName
      ? user.organizationName
      : `Tổ chức #${batch.producerOrganizationId}`

  function downloadQrPng() {
    const canvas = qrRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-${batch!.batchCode}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function printQr() {
    const canvas = qrRef.current
    if (!canvas) return
    const win = window.open('', '_blank', 'width=400,height=500')
    if (!win) return
    win.document.write(
      `<html><head><title>QR ${batch!.batchCode}</title></head><body style="text-align:center;font-family:sans-serif;">` +
        `<h3>${batch!.batchCode}</h3><img src="${canvas.toDataURL('image/png')}" width="256" height="256" />` +
        `<p>${batch!.qrCode}</p></body></html>`,
    )
    win.document.close()
    win.focus()
    win.print()
  }

  async function onUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await upload.mutateAsync({ file })
    setSessionImages((prev) => [...prev, result.imageUrl])
    e.target.value = ''
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Button component={Link} to="/batches" startIcon={<ArrowBackRounded />} size="small" sx={{ textTransform: 'none', fontWeight: 600, mb: 1, color: 'text.secondary' }}>
            Quay lại danh sách lô
          </Button>
          <Typography color="primary.main" sx={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Chi Tiết Lô Hàng
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
            {batch.batchCode}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {batch.productName} &bull; Đang tại: <strong>{orgLabel}</strong>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {canRecordEvent && (
            <Button component={Link} to={`/record-event/${batch.batchId}`} variant="contained" startIcon={<EventRounded />} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Ghi nhận sự kiện
            </Button>
          )}
          {canSplitMerge && (
            <Button component={Link} to={`/batches/${batch.batchId}/split`} variant="outlined" startIcon={<CallSplitRounded />} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Tách lô
            </Button>
          )}
          {canSplitMerge && (
            <Button component={Link} to="/batches/merge" variant="outlined" startIcon={<CallMergeRounded />} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Gộp lô
            </Button>
          )}
          {canTraceback && (
            <Button component={Link} to={`/analytics/traceback/${batch.batchId}`} variant="outlined" startIcon={<TravelExploreRounded />} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Truy vết ngược
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2.5 }}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5 }}>
            Thông Tin Lô Hàng
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
            {[
              ['Chủng loại nông sản', batch.productName],
              ['Sản lượng', `${batch.weight.toLocaleString('vi-VN')} ${batch.unit ?? ''}`],
              ['Ngày thu hoạch', batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString('vi-VN') : '—'],
              ['Trạng thái', null],
              ['Tổ chức đang giữ lô', orgLabel],
              ['Ngày khởi tạo mã', new Date(batch.createdAt).toLocaleString('vi-VN')],
            ].map(([k, v]) => (
              <Box key={k} sx={{ pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  {k}
                </Typography>
                {k === 'Trạng thái' ? <StatusChip status={batch.status} /> : (
                  <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{v}</Typography>
                )}
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 800, fontSize: 16, mb: 1.5 }}>Mã QR Truy Xuất</Typography>
          <QRCodeCanvas ref={qrRef} value={batch.qrCode} size={180} includeMargin />
          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all', my: 1.5, fontFamily: 'monospace', fontSize: 12 }}>
            {batch.qrCode}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button size="small" variant="outlined" startIcon={<DownloadRounded />} onClick={downloadQrPng}>
              Tải PNG
            </Button>
            <Button size="small" variant="outlined" startIcon={<PrintRounded />} onClick={printQr}>
              In mã QR
            </Button>
            <Button size="small" variant="text" startIcon={<OpenInNewRounded />} component="a" href={batch.qrCode} target="_blank" rel="noreferrer">
              Mở trang tra cứu
            </Button>
          </Box>
        </Paper>
      </Box>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Lịch Sử Bất Biến (Hash Chain SHA-256)
          </Typography>
          <Button size="small" variant="contained" startIcon={<VerifiedRounded />} disabled={verify.isPending} onClick={() => verify.mutate()}>
            {verify.isPending ? 'Đang xác minh…' : 'Xác minh chuỗi Hash'}
          </Button>
        </Box>

        {verify.data && (
          <Alert severity={verify.data.isValid ? 'success' : 'error'} sx={{ mb: 2 }}>
            {verify.data.message}
          </Alert>
        )}

        <EventTimeline events={batch.events.map((e) => ({ ...e, eventType: e.eventType as EventType }))} />
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          Ảnh Lô Hàng
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Backend hiện chỉ có API tải ảnh lên, chưa có API đọc lại — ảnh dưới đây chỉ hiển thị trong phiên làm việc
          này, sẽ mất khi tải lại trang.
        </Alert>
        <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateRounded />} disabled={upload.isPending} sx={{ mb: 2 }}>
          {upload.isPending ? 'Đang tải lên…' : 'Tải ảnh lên'}
          <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onUploadFile} />
        </Button>
        {upload.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {upload.error instanceof Error ? upload.error.message : 'Tải ảnh thất bại.'}
          </Alert>
        )}
        {sessionImages.length > 0 && (
          <ImageList cols={4} gap={12} sx={{ m: 0 }}>
            {sessionImages.map((src) => (
              <ImageListItem key={src} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <img src={src.startsWith('http') ? src : `${env.apiOrigin}${src}`} alt="Ảnh lô hàng" loading="lazy" />
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </Paper>
    </Box>
  )
}
