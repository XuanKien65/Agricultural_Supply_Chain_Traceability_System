import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Pagination,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { AddRounded, InfoOutlined, Inventory2Rounded, QrCodeScannerRounded, SearchRounded } from '@mui/icons-material'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusChip } from '@/components/ui/StatusChip'
import { useAuthStore } from '@/features/auth/auth.store'
import { QrScannerDialog } from '../components/QrScannerDialog'
import { useFarmerBatches } from '../batches.queries'
import { getRecentBatches } from '../recentBatches'

const PAGE_SIZE = 50

function FarmerBatchesTable() {
  const user = useAuthStore((s) => s.user)
  const orgId = user?.organizationId ?? 0
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [product, setProduct] = useState('')
  const { data, isLoading } = useFarmerBatches(orgId, { search: search || undefined, page, pageSize: PAGE_SIZE })

  const items = data?.items ?? []
  const productOptions = useMemo(() => Array.from(new Set(items.map((x) => x.productName))), [items])
  const rows = useMemo(
    () => (product ? items.filter((x) => x.productName === product) : items),
    [items, product],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Quản Lý Lô Hàng Nông Sản"
        description="Theo dõi toàn bộ lô nông sản từ thời điểm thu hoạch, gán mã QR định danh và kiểm tra luân chuyển."
        action={
          <Button
            component={Link}
            to="/batches/new"
            variant="contained"
            startIcon={<AddRounded />}
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2.5, px: 2.5 }}
          >
            Tạo Lô Hàng Mới
          </Button>
        }
      />

      <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Tìm theo mã lô / mã QR"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          sx={{ minWidth: { xs: '100%', sm: 280 }, flex: 1 }}
          slotProps={{ input: { startAdornment: <SearchRounded sx={{ color: 'text.disabled', mr: 1 }} /> } }}
        />
        <TextField
          select
          size="small"
          label="Sản phẩm (lọc trong trang hiện tại)"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 220 } }}
        >
          <MenuItem value="">Tất cả sản phẩm</MenuItem>
          {productOptions.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>
        <Tooltip title="Bộ lọc sản phẩm áp dụng trên danh sách đã tải ở trang hiện tại.">
          <InfoOutlined fontSize="small" sx={{ color: 'text.disabled', alignSelf: 'center' }} />
        </Tooltip>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        {isLoading ? (
          <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>Đang tải danh sách lô hàng...</Typography>
        ) : rows.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Inventory2Rounded sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
              Không tìm thấy lô hàng nào phù hợp.
            </Typography>
          </Box>
        ) : (
          rows.map((x) => (
            <Box
              key={x.batchId}
              sx={{
                py: 2.5,
                px: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr auto' },
                gap: 2,
                alignItems: 'center',
                '&:last-child': { borderBottom: 0 },
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 16 }}>{x.productName}</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main', fontWeight: 700 }}>
                  {x.batchCode}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {x.weight.toLocaleString('vi-VN')} {x.unit}
              </Typography>
              <StatusChip status={x.status} />
              <Button component={Link} to={`/batches/${x.batchId}`} variant="outlined" size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>
                Xem chi tiết →
              </Button>
            </Box>
          ))
        )}
      </Paper>

      {data && data.totalPages > 1 && (
        <Pagination
          count={data.totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          sx={{ alignSelf: 'center' }}
        />
      )}
    </Box>
  )
}

function OperatorQuickLookup() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [code, setCode] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const recent = user ? getRecentBatches(user.id) : []

  function openBatch(id: number | string) {
    navigate(`/batches/${id}`)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Tra Cứu Lô Hàng"
        description="Quét mã QR trên bao bì hoặc nhập ID lô hàng để mở nhanh."
      />

      <Alert severity="info">
        Quét mã QR trên bao bì/nhãn lô hàng hoặc nhập ID lô để mở trực tiếp thông tin lô.
      </Alert>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="ID lô hàng"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <Button variant="contained" disabled={!code.trim()} onClick={() => openBatch(code.trim())}>
          Mở lô hàng
        </Button>
        <Button variant="outlined" startIcon={<QrCodeScannerRounded />} onClick={() => setScannerOpen(true)}>
          Quét QR
        </Button>
      </Paper>

      <QrScannerDialog open={scannerOpen} onClose={() => setScannerOpen(false)} onScanned={openBatch} />

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Đã xem gần đây
        </Typography>
        {recent.length === 0 ? (
          <Typography color="text.secondary">Chưa có lô hàng nào được xem trong thiết bị này.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {recent.map((r) => (
              <Chip
                key={r.batchId}
                label={`${r.batchCode} · ${r.productName}`}
                onClick={() => openBatch(r.batchId)}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export function BatchesPage() {
  const user = useAuthStore((s) => s.user)
  return user?.role === 'FARMER' ? <FarmerBatchesTable /> : <OperatorQuickLookup />
}
