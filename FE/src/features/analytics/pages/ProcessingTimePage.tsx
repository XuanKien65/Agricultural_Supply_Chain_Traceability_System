import { Box, Paper, Typography } from '@mui/material'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '@/components/ui/PageHeader'
import { EVENT_TYPE_LABELS, type EventType } from '@/features/events/events.types'
import { useProcessingTime } from '../analytics.queries'

function stageLabel(type: string) {
  return EVENT_TYPE_LABELS[type as EventType] ?? type
}

export function ProcessingTimePage() {
  const { data, isLoading, isError } = useProcessingTime()
  const items = (data?.items ?? []).map((it) => ({
    ...it,
    stage: `${stageLabel(it.fromEventType)} → ${stageLabel(it.toEventType)}`,
  }))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader title="Thời Gian Xử Lý Trung Bình" description="Thời gian trung bình (giờ) chuyển tiếp giữa các công đoạn trong chuỗi cung ứng." />

      {isLoading && <Typography color="text.secondary">Đang tải số liệu…</Typography>}
      {isError && <Typography color="error">Không thể tải dữ liệu thời gian xử lý.</Typography>}

      {!isLoading && items.length === 0 && !isError && (
        <Typography color="text.secondary">Chưa có đủ dữ liệu để thống kê.</Typography>
      )}

      {items.length > 0 && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: 420 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" angle={-20} textAnchor="end" interval={0} height={80} tick={{ fontSize: 12 }} />
              <YAxis label={{ value: 'Giờ', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value, _name, entry) => {
                  const sample = (entry?.payload as { sampleCount?: number } | undefined)?.sampleCount
                  return [`${Number(value).toFixed(1)} giờ (n=${sample ?? '—'})`, 'Thời gian trung bình']
                }}
              />
              <Bar dataKey="averageHours" name="averageHours" fill="#E65100" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}
    </Box>
  )
}
