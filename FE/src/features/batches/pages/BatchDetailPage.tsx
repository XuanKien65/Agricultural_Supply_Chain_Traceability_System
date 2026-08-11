import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Button, Paper, Typography } from '@mui/material'
import { useBatchesStore } from '../batches.store'

export function BatchDetailPage() {
  const { t } = useTranslation()
  const { batchId } = useParams()
  const batches = useBatchesStore((state) => state.batches)
  const selectedBatchId = useBatchesStore((state) => state.selectedBatchId)
  const setSelectedBatchId = useBatchesStore((state) => state.setSelectedBatchId)
  const updateBatchStatus = useBatchesStore((state) => state.updateBatchStatus)

  const batch = useMemo(() => {
    const currentId = batchId ?? selectedBatchId ?? ''
    return batches.find((item) => item.maLoHang === currentId) ?? null
  }, [batchId, batches, selectedBatchId])

  if (!batch) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography color="text.secondary">{t('batches.notFound')}</Typography>
        <Button component={Link} to="/batches" variant="outlined" sx={{ alignSelf: 'flex-start' }}>
          {t('batches.back')}
        </Button>
      </Box>
    )
  }

  const fields: [string, string][] = [
    [t('batches.batchId'), batch.maLoHang],
    [t('batches.status'), batch.trangThai],
    [t('batches.product'), batch.tenSanPham],
    [t('batches.producerUnit'), batch.tenDonViSanXuat],
    [t('batches.harvestDate'), batch.ngayThuHoach],
    [t('batches.quantity'), `${batch.khoiLuong} kg`],
    [t('batches.qrCode'), batch.maQR],
    [t('batches.location'), batch.viTri ?? '—'],
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'primary.main', textTransform: 'uppercase' }}>
            {t('batches.detailTitle')}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            {batch.tenSanPham}
          </Typography>
          <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 14 }}>{t('batches.detailSubtitle')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button component={Link} to="/batches" variant="outlined">
            {t('batches.back')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedBatchId(batch.maLoHang)
              const nextStatus =
                batch.trangThai === 'Created'
                  ? 'InTransit'
                  : batch.trangThai === 'InTransit'
                    ? 'Processed'
                    : 'Distributed'
              updateBatchStatus(batch.maLoHang, nextStatus)
            }}
          >
            {t('batches.advanceStatus')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 0.7fr' }, gap: 2 }}>
        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 800 }}>{t('batches.batchInfo')}</Typography>
          <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {fields.map(([label, value]) => (
              <Box key={label}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{label}</Typography>
                <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 800 }}>{t('batches.quickNotes')}</Typography>
          <Box component="ul" sx={{ mt: 2, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: 14, color: 'text.secondary' }}>
            <li>{t('batches.note1')}</li>
            <li>{t('batches.note2')}</li>
            <li>{t('batches.note3')}</li>
          </Box>
        </Paper>
      </Box>

      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 800 }}>{t('batches.eventHistory')}</Typography>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {batch.events.map((event) => (
            <Box key={event.maSuKien} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>{event.loaiSuKien}</Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{event.thoiGian}</Typography>
              </Box>
              <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
                {t('batches.actorUnit')}: {event.maDonViThucHien}
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{event.ghiChu}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  )
}
