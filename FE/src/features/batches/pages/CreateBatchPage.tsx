import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Button, Paper, TextField, Typography } from '@mui/material'
import { useBatchesStore, type Batch } from '../batches.store'

export function CreateBatchPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createBatch = useBatchesStore((state) => state.createBatch)

  const [form, setForm] = useState({
    tenSanPham: '',
    tenDonViSanXuat: '',
    ngayThuHoach: '',
    khoiLuong: '',
    maQR: '',
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const newBatch: Batch = {
      maLoHang: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      maSanPham: Date.now(),
      maDonViSanXuat: Date.now() + 1,
      maQR: form.maQR || `QR-${Math.floor(1000 + Math.random() * 9000)}`,
      ngayThuHoach: form.ngayThuHoach,
      khoiLuong: Number(form.khoiLuong) || 0,
      trangThai: 'Created',
      tenSanPham: form.tenSanPham,
      tenDonViSanXuat: form.tenDonViSanXuat,
      viTri: 'Pending validation',
      events: [
        {
          maSuKien: `e-${Date.now()}`,
          loaiSuKien: 'Harvest',
          thoiGian: `${form.ngayThuHoach} 06:00`,
          maDonViThucHien: 'D-NEW',
          ghiChu: 'Batch created by farmer.',
        },
      ],
    }

    createBatch(newBatch)
    navigate('/batches')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'primary.main', textTransform: 'uppercase' }}>
          {t('batches.createTitle')}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          {t('batches.createTitle')}
        </Typography>
        <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 14 }}>{t('batches.createSubtitle')}</Typography>
      </Box>

      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
        >
          <TextField
            label={t('batches.product')}
            placeholder={t('batches.productNamePlaceholder')}
            value={form.tenSanPham}
            onChange={(e) => setForm({ ...form, tenSanPham: e.target.value })}
            required
          />
          <TextField
            label={t('batches.producerUnit')}
            placeholder={t('batches.producerUnitPlaceholder')}
            value={form.tenDonViSanXuat}
            onChange={(e) => setForm({ ...form, tenDonViSanXuat: e.target.value })}
            required
          />
          <TextField
            label={t('batches.harvestDate')}
            type="date"
            value={form.ngayThuHoach}
            onChange={(e) => setForm({ ...form, ngayThuHoach: e.target.value })}
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label={t('batches.quantity')}
            type="number"
            value={form.khoiLuong}
            onChange={(e) => setForm({ ...form, khoiLuong: e.target.value })}
            required
          />
          <TextField
            label={t('batches.qrCode')}
            placeholder={t('batches.qrPlaceholder')}
            value={form.maQR}
            onChange={(e) => setForm({ ...form, maQR: e.target.value })}
          />

          <Box sx={{ gridColumn: { md: 'span 2' }, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button type="button" variant="outlined" onClick={() => navigate('/batches')}>
              {t('batches.cancel')}
            </Button>
            <Button type="submit" variant="contained">
              {t('batches.save')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
