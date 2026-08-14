// ==========================================
// CODE GỐC & CÁC IMPORT CHÍNH
// ==========================================
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material'
import { ArrowBackRounded, QrCode2Rounded, CheckCircleRounded } from '@mui/icons-material'
import { useAuthStore } from '@/features/auth/auth.store'
import { useCreateBatch, useProducts } from '../batches.queries'

export function CreateBatchPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: products = [] } = useProducts()
  const create = useCreateBatch()

  // ==========================================
  // CODE GỐC: State form và submit
  // ==========================================
  const [form, setForm] = useState({
    productId: '',
    harvestDate: new Date().toISOString().slice(0, 10),
    weight: '',
    location: '',
    harvestNotes: '',
  })

  async function submit(e: FormEvent) {
    e.preventDefault()
    const batch = await create.mutateAsync({
      productId: Number(form.productId),
      producerOrganizationId: user?.organizationId ?? 1,
      performedByUserId: user?.id ?? 1,
      harvestDate: form.harvestDate,
      weight: Number(form.weight),
      location: form.location,
      harvestNotes: form.harvestNotes,
    })
    navigate(`/batches/${batch.batchId}`)
  }

  // ==========================================
  // NEW CODE: Bố cục & CSS form tạo lô hàng
  // ==========================================
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header & Nút Quay lại */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          onClick={() => navigate('/batches')}
          startIcon={<ArrowBackRounded />}
          sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
        >
          Quay lại danh sách
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontSize: 13, fontWeight: 700 }}>
          <CheckCircleRounded fontSize="small" />
          <span>Tự động tạo mã QR & băm SHA-256</span>
        </Box>
      </Box>

      <Box>
        <Typography color="primary.main" sx={{ fontWeight: 800, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Ghi Nhận Thu Hoạch
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
          Khởi Tạo Lô Hàng Mới
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 14 }}>
          Hệ thống sẽ tự động cấp mã định danh duy nhất (UUID/BatchCode), sinh mã QR truy xuất và ghi nhận sự kiện HARVEST đầu tiên vào Hash Chain.
        </Typography>
      </Box>

      <Paper
        component="form"
        onSubmit={submit}
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2.5,
          bgcolor: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}
      >
        <TextField
          select
          required
          label="Chủng loại nông sản *"
          value={form.productId}
          onChange={(e) => setForm({ ...form, productId: e.target.value })}
        >
          {products.map((x) => (
            <MenuItem key={x.productId} value={x.productId}>
              {x.name} ({x.unit})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          required
          type="number"
          label="Sản lượng / Khối lượng thu hoạch *"
          value={form.weight}
          onChange={(e) => setForm({ ...form, weight: e.target.value })}
          slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
          placeholder="Ví dụ: 500"
        />

        <TextField
          required
          type="date"
          label="Ngày thu hoạch *"
          value={form.harvestDate}
          onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Vị trí / Vườn thu hoạch"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Ví dụ: Vườn A2, Nông trại Đà Lạt"
        />

        <TextField
          multiline
          minRows={3}
          label="Nhật ký & Ghi chú thu hoạch"
          value={form.harvestNotes}
          onChange={(e) => setForm({ ...form, harvestNotes: e.target.value })}
          sx={{ gridColumn: { md: 'span 2' } }}
          placeholder="Nhập ghi chú giống cây trồng, thời tiết thu hoạch, phân bón..."
        />

        {create.isError && (
          <Alert severity="error" sx={{ gridColumn: { md: 'span 2' }, borderRadius: 2 }}>
            {create.error.message}
          </Alert>
        )}

        <Box sx={{ gridColumn: { md: 'span 2' }, display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={() => navigate('/batches')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Hủy
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={create.isPending}
            startIcon={<QrCode2Rounded />}
            sx={{
              bgcolor: 'primary.main',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: '0 4px 12px rgba(25, 113, 58, 0.25)',
            }}
          >
            {create.isPending ? 'Đang tạo...' : 'Tạo Lô & Cấp Mã QR'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
