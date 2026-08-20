import { Box, Typography } from '@mui/material'
import {
  ApartmentRounded,
  EventNoteRounded,
  FactCheckRounded,
  GroupRounded,
  Inventory2Rounded,
  VerifiedRounded,
  WarningAmberRounded,
  WorkspacePremiumRounded,
} from '@mui/icons-material'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { useOverview } from '../analytics.queries'

export function AnalyticsOverviewPage() {
  const { data, isLoading, isError } = useOverview()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader title="Tổng Quan Hệ Thống" description="Thống kê tổng số liệu toàn bộ chuỗi cung ứng." />

      {isLoading && <Typography color="text.secondary">Đang tải số liệu…</Typography>}
      {isError && <Typography color="error">Không thể tải dữ liệu tổng quan.</Typography>}

      {data && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <StatCard title="Tổ chức" value={data.totalOrganizations} description="Tổng số đơn vị tham gia" icon={<ApartmentRounded />} iconBg="#E8F5E9" iconColor="#19713A" />
          <StatCard title="Người dùng" value={data.totalUsers} description="Tài khoản trong hệ thống" icon={<GroupRounded />} iconBg="#E3F2FD" iconColor="#1565C0" />
          <StatCard title="Lô hàng" value={data.totalBatches} description="Tổng số lô đã tạo" icon={<Inventory2Rounded />} iconBg="#FFF3E0" iconColor="#E65100" />
          <StatCard title="Sự kiện" value={data.totalEvents} description="Sự kiện chuỗi cung ứng" icon={<EventNoteRounded />} iconBg="#EDE7F6" iconColor="#5E35B1" />
          <StatCard title="Kiểm định" value={data.totalInspections} description="Lượt kiểm định chất lượng" icon={<FactCheckRounded />} iconBg="#E0F7FA" iconColor="#00838F" />
          <StatCard title="Chứng nhận" value={data.totalCertificates} description="Chứng chỉ đã cấp" icon={<WorkspacePremiumRounded />} iconBg="#FFFDE7" iconColor="#F9A825" />
          <StatCard title="Thu hồi" value={data.totalRecalls} description="Tổng số cảnh báo thu hồi" icon={<WarningAmberRounded />} iconBg="#FFEBEE" iconColor="#C62828" />
          <StatCard title="Đang thu hồi" value={data.activeRecalls} description="Cảnh báo đang hoạt động" icon={<VerifiedRounded />} iconBg="#FCE4EC" iconColor="#AD1457" />
        </Box>
      )}
    </Box>
  )
}
