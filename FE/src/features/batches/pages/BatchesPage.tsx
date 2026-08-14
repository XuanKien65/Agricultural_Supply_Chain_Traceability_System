// ==========================================
// CODE GỐC & CÁC IMPORT CHÍNH
// ==========================================
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material'
import { AddRounded, SearchRounded, Inventory2Rounded } from '@mui/icons-material'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusChip } from '@/components/ui/StatusChip'
import { useAuthStore } from '@/features/auth/auth.store'
import { useFarmerBatches } from '../batches.queries'

export function BatchesPage() {
  const user = useAuthStore((s) => s.user)
  const orgId = user?.organizationId ?? 1
  const { data = [], isLoading } = useFarmerBatches(orgId)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  // ==========================================
  // CODE GỐC: Lọc danh sách lô hàng
  // ==========================================
  const rows = useMemo(
    () =>
      data.filter(
        (x) =>
          (!status || x.status === status) &&
          `${x.batchCode} ${x.productName}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [data, search, status],
  )

  // ==========================================
  // NEW CODE: Bố cục & CSS giao diện chuyên nghiệp
  // ==========================================
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
            sx={{
              bgcolor: 'primary.main',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2.5,
              px: 2.5,
              boxShadow: '0 4px 12px rgba(25, 113, 58, 0.25)',
            }}
          >
            Tạo Lô Hàng Mới
          </Button>
        }
      />

      {/* Thanh tìm kiếm & Bộ lọc */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          bgcolor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <TextField
          size="small"
          label="Tìm mã lô hoặc tên nông sản..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 300 }, flex: 1 }}
          slotProps={{
            input: {
              startAdornment: <SearchRounded sx={{ color: 'text.disabled', mr: 1 }} />,
            },
          }}
        />

        <TextField
          select
          size="small"
          label="Trạng thái"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 200 } }}
        >
          <MenuItem value="">Tất cả trạng thái</MenuItem>
          <MenuItem value="Created">Mới tạo (Created)</MenuItem>
          <MenuItem value="InTransit">Đang vận chuyển (InTransit)</MenuItem>
          <MenuItem value="Processing">Đang sơ chế (Processing)</MenuItem>
          <MenuItem value="Recalled">Đã thu hồi (Recalled)</MenuItem>
        </TextField>
      </Paper>

      {/* Danh sách thẻ lô hàng */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {isLoading ? (
          <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
            Đang tải danh sách lô hàng...
          </Typography>
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
                borderRadius: 2,
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(248, 250, 252, 0.8)',
                },
                '&:last-child': {
                  borderBottom: 0,
                },
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: 'text.primary' }}>
                  {x.productName}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main', fontWeight: 700 }}>
                  {x.batchCode}
                </Typography>
              </Box>

              <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {x.weight.toLocaleString('vi-VN')} {x.unit}
              </Typography>

              <Box>
                <StatusChip status={x.status} />
              </Box>

              <Button
                component={Link}
                to={`/batches/${x.batchId}`}
                variant="outlined"
                size="small"
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'primary.50',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  },
                }}
              >
                Xem chi tiết →
              </Button>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  )
}
