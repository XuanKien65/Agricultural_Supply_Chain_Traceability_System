import { Link } from 'react-router-dom'
import { Box, Button, Paper, Typography } from '@mui/material'
import { AgricultureRounded, Inventory2Rounded, ScaleRounded, WarningAmberRounded } from '@mui/icons-material'
import { StatCard } from '@/components/ui/StatCard'
import { StatusChip } from '@/components/ui/StatusChip'
import { useAuthStore } from '@/features/auth/auth.store'
import { useFarmerBatches } from '@/features/batches/batches.queries'

export function FarmerDashboardPage() {
  const user = useAuthStore((s) => s.user); const orgId = user?.organizationId ?? 1
  const { data = [], isLoading } = useFarmerBatches(orgId)
  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}><Box><Typography color="primary" sx={{ fontWeight: 800 }}>CỔNG THÔNG TIN NÔNG HỘ</Typography><Typography variant="h4" sx={{ fontWeight: 900 }}>Xin chào, {user?.name}</Typography><Typography color="text.secondary">{user?.unitName} • Theo dõi hoạt động sản xuất hôm nay</Typography></Box><Button component={Link} to="/batches/new" variant="contained" startIcon={<AgricultureRounded />}>Tạo lô thu hoạch</Button></Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' }, gap: 2 }}>
      <StatCard title="Tổng số lô" value={data.length} description="Lô do nông trại tạo" icon={<Inventory2Rounded />} iconBg="#E8F5E9" iconColor="#19713A" />
      <StatCard title="Mới tạo" value={data.filter(x => x.status === 'Created').length} description="Đang tại nông trại" icon={<AgricultureRounded />} iconBg="#E3F2FD" iconColor="#1565C0" />
      <StatCard title="Tổng khối lượng" value={`${data.reduce((n,x) => n+x.weight,0).toLocaleString('vi-VN')} kg`} description="Tất cả mùa vụ" icon={<ScaleRounded />} iconBg="#FFF3E0" iconColor="#E65100" />
      <StatCard title="Đang thu hồi" value={data.filter(x => x.status === 'Recalled').length} description="Cần xử lý" icon={<WarningAmberRounded />} iconBg="#FFEBEE" iconColor="#C62828" />
    </Box>
    <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}><Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Lô hàng gần đây</Typography>{isLoading ? <Typography>Đang tải…</Typography> : data.slice(0,5).map(x => <Box key={x.batchId} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}><Box><Typography sx={{ fontWeight: 700 }}>{x.productName}</Typography><Typography variant="body2" color="text.secondary">{x.batchCode} • {x.weight} {x.unit} • Thu hoạch {new Date(x.harvestDate).toLocaleDateString('vi-VN')}</Typography></Box><Box sx={{ display:'flex', gap:1, alignItems:'center' }}><StatusChip status={x.status}/><Button component={Link} to={`/batches/${x.batchId}`} size="small">Chi tiết</Button></Box></Box>)}</Paper>
  </Box>
}
