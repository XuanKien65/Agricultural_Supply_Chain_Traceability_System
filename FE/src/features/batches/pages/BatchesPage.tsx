import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  MenuItem,
  Pagination,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { AddRounded, InfoOutlined, Inventory2Rounded, SearchRounded } from '@mui/icons-material'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusChip } from '@/components/ui/StatusChip'
import { useAuthStore } from '@/features/auth/auth.store'
import { useFarmerBatches } from '../batches.queries'

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
        <Tooltip title="Backend hiện chưa hỗ trợ lọc theo sản phẩm/ngày tạo ở server — bộ lọc này chỉ áp dụng trên các lô đã tải ở trang hiện tại.">
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

export function BatchesPage() {
  return <FarmerBatchesTable />
}
