import { Box, Paper, Typography } from '@mui/material'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '@/components/ui/PageHeader'
import { useBatchDistribution } from '../analytics.queries'

import { useAuthStore } from '@/features/auth/auth.store'

export function BatchDistributionPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isError } = useBatchDistribution()
  const rawItems = data?.items ?? []
  const items = user?.role === 'ORGADMIN' && user?.organizationId
    ? rawItems.filter((it) => it.organizationId === user.organizationId)
    : rawItems

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader title="Phân Bổ Lô Hàng Theo Tổ Chức" description="Số lượng lô và tổng khối lượng đang nắm giữ ở từng đơn vị." />

      {isLoading && <Typography color="text.secondary">Đang tải số liệu…</Typography>}
      {isError && <Typography color="error">Không thể tải dữ liệu phân bổ.</Typography>}

      {!isLoading && items.length === 0 && !isError && (
        <Typography color="text.secondary">Chưa có dữ liệu.</Typography>
      )}

      {items.length > 0 && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: 420 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="organizationName" angle={-25} textAnchor="end" interval={0} height={80} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="batchCount" name="Số lô" fill="#19713A" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="totalQuantity" name="Tổng khối lượng" fill="#1565C0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {items.length > 0 && (
        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          {items.map((it) => (
            <Box key={it.organizationId} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontWeight: 700 }}>{it.organizationName}</Typography>
              <Typography color="text.secondary">{it.organizationType}</Typography>
              <Typography>{it.batchCount} lô</Typography>
              <Typography>{it.totalQuantity.toLocaleString('vi-VN')}</Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  )
}
