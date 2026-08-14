// ==========================================
// CODE GỐC & CÁC IMPORT CHÍNH
// ==========================================
import { Link, useParams } from 'react-router-dom'
import { Alert, Box, Button, Chip, Paper, Typography } from '@mui/material'
import { ContentCopyRounded, QrCode2Rounded, ArrowBackRounded, TimelineRounded, OpenInNewRounded } from '@mui/icons-material'
import { StatusChip } from '@/components/ui/StatusChip'
import { useAuthStore } from '@/features/auth/auth.store'
import { EVENT_TYPE_LABELS } from '@/features/events/events.types'
import { useFarmerBatch } from '../batches.queries'

export function BatchDetailPage() {
  const { batchId } = useParams()
  const orgId = useAuthStore((s) => s.user?.organizationId) ?? 1
  const { data: b, isLoading } = useFarmerBatch(Number(batchId), orgId)

  if (isLoading) {
    return <Typography sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>Đang tải thông tin lô hàng...</Typography>
  }

  if (!b) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        Không tìm thấy thông tin lô hàng.{' '}
        <Button component={Link} to="/batches" size="small">
          Quay lại danh sách
        </Button>
      </Alert>
    )
  }

  // ==========================================
  // NEW CODE: Bố cục chi tiết lô hàng & Lịch sử Hash Chain
  // ==========================================
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header & Back navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Button
            component={Link}
            to="/batches"
            startIcon={<ArrowBackRounded />}
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600, mb: 1, color: 'text.secondary' }}
          >
            Quay lại danh sách lô
          </Button>
          <Typography color="primary.main" sx={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Chi Tiết Lô Hàng Định Danh
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
            {b.batchCode}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {b.productName} &bull; Cơ sở: <strong>{b.producerOrganizationName}</strong>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            to={`/trace/${b.batchCode}`}
            variant="contained"
            startIcon={<OpenInNewRounded />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Mở Cổng Tra Cứu QR
          </Button>
        </Box>
      </Box>

      {/* Grid 2 Cột: Thông tin sản xuất & Mã định danh QR */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2.5 }}>
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
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5 }}>
            Thông Tin Nguồn Gốc & Sản Xuất
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
            {[
              ['Chủng loại nông sản', b.productName],
              ['Sản lượng thu hoạch', `${b.weight.toLocaleString('vi-VN')} ${b.unit}`],
              ['Ngày thu hoạch', new Date(b.harvestDate).toLocaleDateString('vi-VN')],
              ['Trạng thái lưu thông', b.status],
              ['Cơ sở sản xuất', b.producerOrganizationName],
              ['Ngày khởi tạo mã', new Date(b.createdAt).toLocaleString('vi-VN')],
            ].map(([k, v]) => (
              <Box key={k} sx={{ pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  {k}
                </Typography>
                {k === 'Trạng thái lưu thông' ? (
                  <Box>
                    <StatusChip status={v || ''} />
                  </Box>
                ) : (
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: 'text.primary' }}>
                    {v}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'white',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <QrCode2Rounded sx={{ fontSize: 100, color: 'primary.main', mb: 1 }} />
          <Typography sx={{ fontWeight: 800, fontSize: 16 }}>Mã QR Định Danh</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all', my: 1, fontFamily: 'monospace', fontSize: 12 }}>
            {b.qrCode}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyRounded />}
            onClick={() => void navigator.clipboard.writeText(`${location.origin}${b.qrCode}`)}
            sx={{ mt: 1, textTransform: 'none', borderRadius: 2 }}
          >
            Sao chép liên kết QR
          </Button>
        </Paper>
      </Box>

      {/* Lịch sử bất biến (Hash Chain) */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <TimelineRounded color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Lịch Sử Bất Biến (Hash Chain SHA-256)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Các sự kiện chỉ được ghi nhận theo cơ chế Append-only, không thể chỉnh sửa hoặc xóa bỏ.
        </Typography>

        {b.events.map((e) => (
          <Box
            key={e.eventId}
            sx={{
              borderLeft: '3px solid',
              borderColor: 'primary.main',
              pl: 2.5,
              py: 1.5,
              mb: 2.5,
              bgcolor: '#F8FAFC',
              borderRadius: '0 12px 12px 0',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label="THU HOẠCH" color="success" size="small" sx={{ fontWeight: 700, fontSize: 11 }} />
              <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                {new Date(e.eventTime).toLocaleString('vi-VN')}
              </Typography>
            </Box>

            <Typography sx={{ mt: 1, fontWeight: 700, color: 'text.primary' }}>
              {e.location || 'Không có thông tin địa điểm'}
            </Typography>

            {e.additionalData && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {e.additionalData}
              </Typography>
            )}

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                wordBreak: 'break-all',
                mt: 1,
                fontFamily: 'monospace',
                color: 'text.disabled',
                fontSize: 11,
              }}
            >
              Hash: {e.currentHash}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  )
}
