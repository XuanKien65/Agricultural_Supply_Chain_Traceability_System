import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Button, Paper, Typography, Card, CardContent } from '@mui/material'
import { AgricultureRounded, Inventory2Rounded, ScaleRounded, LocalShippingRounded, PlusOneRounded, ChevronRightRounded, CheckCircleRounded, CategoryRounded, WarningAmberRounded } from '@mui/icons-material'
import { StatCard } from '@/components/ui/StatCard'
import { StatusChip } from '@/components/ui/StatusChip'
import { useAuthStore } from '@/features/auth/auth.store'
import { farmerApi } from '@/features/farmer/farmer.api'

export function FarmerDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const orgId = user?.organizationId ?? 1

  const { data: stats, isLoading } = useQuery({
    queryKey: ['farmer-dashboard', orgId],
    queryFn: () => farmerApi.getDashboard(orgId),
    enabled: Boolean(orgId),
  })

  const recentBatches = stats?.recentBatches ?? []

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography color="primary" sx={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: 0.5 }}>
            🌾 CỔNG QUẢN TRỊ NÔNG HỘ SẢN XUẤT
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
            Xin chào, {user?.name || 'Nông dân'}
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            {user?.organizationName || 'Nông trại Việt'} • Nhật ký thu hoạch và quản lý nông trại hôm nay
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/batches/new"
            variant="contained"
            color="success"
            startIcon={<PlusOneRounded />}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Tạo Lô Thu Hoạch Mới
          </Button>
          <Button
            component={Link}
            to="/record-event"
            variant="outlined"
            color="primary"
            startIcon={<LocalShippingRounded />}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Ghi Nhận Sự Kiện
          </Button>
        </Box>
      </Box>

      {/* Stat Cards Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' }, gap: 2 }}>
        <StatCard
          title="Tổng số lô hàng"
          value={stats?.totalBatches ?? 0}
          description="Đã khởi tạo từ nông trại"
          icon={<Inventory2Rounded />}
          iconBg="#E8F5E9"
          iconColor="#19713A"
        />
        <StatCard
          title="Đang canh tác / luân chuyển"
          value={stats?.inProgressBatches ?? 0}
          description="Đang xử lý tại nông trại"
          icon={<AgricultureRounded />}
          iconBg="#E3F2FD"
          iconColor="#1565C0"
        />
        <StatCard
          title="Tổng sản lượng thu hoạch"
          value={`${(stats?.totalWeight ?? 0).toLocaleString('vi-VN')} kg`}
          description="Khối lượng nông sản ghi nhận"
          icon={<ScaleRounded />}
          iconBg="#FFF3E0"
          iconColor="#E65100"
        />
        <StatCard
          title="Hoàn thành / Xuất kho"
          value={stats?.completedBatches ?? 0}
          description="Đã bàn giao cho nhà máy/chuỗi"
          icon={<CheckCircleRounded />}
          iconBg="#F3E5F5"
          iconColor="#7B1FA2"
        />
      </Box>

      {/* Main Content Grid: Recent Batches & Quick Actions */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Recent Batches List */}
        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Lô Hàng Mới Thu Hoạch Gần Đây
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Các lô hàng vừa khởi tạo và thu hoạch từ nông trại
              </Typography>
            </Box>
            <Button size="small" endIcon={<ChevronRightRounded />} onClick={() => navigate('/batches')}>
              Xem tất cả
            </Button>
          </Box>

          {isLoading ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Đang tải danh sách lô hàng...
            </Typography>
          ) : recentBatches.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Chưa có lô hàng nào được thu hoạch.
              </Typography>
              <Button variant="contained" color="success" size="small" component={Link} to="/batches/new">
                Tạo lô thu hoạch đầu tiên
              </Button>
            </Box>
          ) : (
            recentBatches.map((batch) => (
              <Box
                key={batch.batchId}
                sx={{
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: 'success.50',
                      color: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                    }}
                  >
                    🌾
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{batch.productName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Mã lô: <strong>{batch.batchCode}</strong> • {batch.weight} {batch.unit || 'kg'} • Thu hoạch:{' '}
                      {batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString('vi-VN') : 'Mới khởi tạo'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <StatusChip status={batch.status} />
                  <Button
                    component={Link}
                    to={`/batches/${batch.batchId}`}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700 }}
                  >
                    Chi tiết
                  </Button>
                </Box>
              </Box>
            ))
          )}
        </Paper>

        {/* Quick Action Sidebar */}
        <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 'none' }}>
          <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Thao Tác Nhanh
            </Typography>

            <Button
              variant="outlined"
              color="success"
              fullWidth
              startIcon={<AgricultureRounded />}
              onClick={() => navigate('/batches/new')}
              sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2, fontWeight: 700 }}
            >
              Tạo Lô Nông Sản & Sinh Mã QR
            </Button>

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<LocalShippingRounded />}
              onClick={() => navigate('/record-event')}
              sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2, fontWeight: 700 }}
            >
              Ghi Nhận Sự Kiện Thu Hoạch
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              startIcon={<CategoryRounded />}
              onClick={() => navigate('/products')}
              sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2, fontWeight: 700 }}
            >
              Danh Mục Sản Phẩm Nông Sản
            </Button>

            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<WarningAmberRounded />}
              onClick={() => navigate('/admin/recall-notifications')}
              sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2, fontWeight: 700 }}
            >
              Thông Báo Thu Hồi Sản Phẩm
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
