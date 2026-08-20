import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Alert, Box, Chip, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material'
import { CheckCircleRounded, ErrorRounded, EventRounded, LocationOnRounded, QrCode2Rounded } from '@mui/icons-material'
import { http } from '@/lib/api/http'
import { unwrapApi, type ApiEnvelope } from '@/lib/api/api.types'

interface PublicTraceData {
  batch: { id: number; productName: string; productUnit?: string | null; producerOrganizationName: string; qrCode?: string | null; weight: number; status: string; createdAt: string }
  events: Array<{ id: number; eventType: string; eventTime: string; organizationName?: string | null; location?: string | null; additionalData?: string | null; currentHash: string }>
  inspections: Array<{ id: number; result?: string | null; inspectionDate?: string | null; notes?: string | null }>
  certificates: Array<{ id: number; certificateType?: string | null; fileUrl?: string | null; issuedDate?: string | null }>
  hashChainValid: boolean
}

export function TracePublicPage() {
  const { batchId } = useParams()
  const query = useQuery({
    queryKey: ['public-trace', batchId],
    queryFn: async () => unwrapApi((await http.get<ApiEnvelope<PublicTraceData>>(`/public/trace/${batchId}`)).data),
    enabled: Boolean(batchId),
    retry: 1,
  })

  if (query.isLoading) return <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
  if (query.isError || !query.data) return <Alert severity="error" icon={<ErrorRounded />}>Không tìm thấy thông tin công khai của lô hàng #{batchId}.</Alert>
  const { batch, events, inspections, certificates, hashChainValid } = query.data
  const recalled = ['RECALLED', 'RECALLED'.toLowerCase()].includes(batch.status.toUpperCase())

  return <Box sx={{ maxWidth: 760, mx: 'auto' }}><Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 4 }}><Stack spacing={3}><Box><Stack direction="row" justifyContent="space-between" gap={2} alignItems="flex-start"><Box><Typography variant="h4" sx={{ fontWeight: 900 }}>{batch.productName}</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>Sản xuất bởi {batch.producerOrganizationName}</Typography></Box><QrCode2Rounded color="primary" sx={{ fontSize: 42 }} /></Stack><Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}><Chip label={`Lô #${batch.id}`} size="small" /><Chip icon={hashChainValid ? <CheckCircleRounded /> : <ErrorRounded />} label={hashChainValid ? 'Chuỗi hash hợp lệ' : 'Cần kiểm tra hash'} color={hashChainValid ? 'success' : 'error'} size="small" />{recalled && <Chip label="ĐANG THU HỒI" color="error" size="small" />}</Stack></Box>
      <Divider />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><Paper variant="outlined" sx={{ p: 2, flex: 1, bgcolor: 'primary.50' }}><Typography variant="caption" color="text.secondary">Khối lượng</Typography><Typography variant="h6" sx={{ fontWeight: 900 }}>{batch.weight} {batch.productUnit ?? 'kg'}</Typography></Paper><Paper variant="outlined" sx={{ p: 2, flex: 1, bgcolor: 'success.50' }}><Typography variant="caption" color="text.secondary">Mã QR</Typography><Typography sx={{ fontWeight: 800, wordBreak: 'break-all' }}>{batch.qrCode ?? `TRACE-${batch.id}`}</Typography></Paper></Stack>
      {recalled && <Alert severity="error">Lô hàng này đang có cảnh báo thu hồi. Vui lòng dừng sử dụng và liên hệ nhà cung cấp.</Alert>}
      {certificates.length > 0 && <Box><Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Chứng nhận</Typography><Stack direction="row" gap={1} flexWrap="wrap">{certificates.map((certificate) => <Chip key={certificate.id} label={certificate.certificateType ?? 'Chứng nhận chất lượng'} color="success" variant="outlined" />)}</Stack></Box>}
      {inspections.length > 0 && <Box><Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Kết quả kiểm định</Typography><Stack spacing={1}>{inspections.map((inspection) => <Paper key={inspection.id} variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', gap: 2 }}><Box><Typography sx={{ fontWeight: 700 }}>Phiếu kiểm định #{inspection.id}</Typography><Typography variant="body2" color="text.secondary">{inspection.notes ?? 'Không có ghi chú'}</Typography></Box><Chip label={inspection.result ?? 'PENDING'} color={inspection.result?.toUpperCase() === 'PASS' ? 'success' : 'error'} size="small" /></Paper>)}</Stack></Box>}
      <Box><Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Lộ trình chuỗi cung ứng</Typography><Stack spacing={0}>{events.map((event, index) => <Box key={event.id} sx={{ display: 'flex', gap: 2, position: 'relative', pb: index === events.length - 1 ? 0 : 3 }}><Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><EventRounded color="primary" /><Box sx={{ width: 2, flex: 1, bgcolor: index === events.length - 1 ? 'transparent' : 'primary.100' }} /></Box><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 800 }}>{event.eventType}</Typography><Typography variant="body2" color="text.secondary">{new Date(event.eventTime).toLocaleString('vi-VN')}</Typography>{event.organizationName && <Typography variant="body2"><LocationOnRounded sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />{event.organizationName}{event.location ? ` - ${event.location}` : ''}</Typography>}{event.additionalData && <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>{event.additionalData}</Typography>}</Box></Box>)}</Stack></Box></Stack></Paper></Box>
}