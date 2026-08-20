import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Alert, Box, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { ArrowDownwardRounded, HubRounded } from '@mui/icons-material'
import { http } from '@/lib/api/http'
import { unwrapApi, type ApiEnvelope } from '@/lib/api/api.types'

interface LineageData { nodes: Array<{ batchId: number; batchCode: string; quantity: number }>; edges: Array<{ sourceBatchId: number; targetBatchId: number; relationType: string }> }

export function LineagePage() {
  const { batchId } = useParams()
  const query = useQuery({ queryKey: ['lineage', batchId], queryFn: async () => unwrapApi((await http.get<ApiEnvelope<LineageData>>(`/public/trace/${batchId}/lineage`)).data), enabled: Boolean(batchId), retry: 1 })
  if (query.isLoading) return <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300 }}><CircularProgress /></Box>
  if (query.isError || !query.data) return <Alert severity="error">Không thể tải phả hệ lô hàng #{batchId}.</Alert>
  const { nodes, edges } = query.data
  return <Box sx={{ maxWidth: 860, mx: 'auto' }}><Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}><HubRounded color="primary" /><Typography variant="h4" sx={{ fontWeight: 900 }}>Phả hệ lô hàng</Typography></Stack><Typography color="text.secondary" sx={{ mb: 3 }}>Quan hệ tách/gộp được ghi nhận giữa các lô trong chuỗi cung ứng.</Typography><Stack spacing={2}>{nodes.map((node) => { const incoming = edges.filter((edge) => edge.targetBatchId === node.batchId); const outgoing = edges.filter((edge) => edge.sourceBatchId === node.batchId); return <Paper key={node.batchId} variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: '4px solid', borderLeftColor: incoming.length ? 'secondary.main' : 'primary.main' }}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}><Box><Typography sx={{ fontWeight: 900 }}>{node.batchCode}</Typography><Typography variant="body2" color="text.secondary">Batch ID #{node.batchId} • {node.quantity} đơn vị</Typography></Box><Stack direction="row" gap={1} flexWrap="wrap">{incoming.map((edge) => <Chip key={`${edge.sourceBatchId}-${edge.targetBatchId}`} icon={<ArrowDownwardRounded />} label={`${edge.relationType} từ #${edge.sourceBatchId}`} size="small" color="secondary" variant="outlined" />)}{outgoing.map((edge) => <Chip key={`${edge.sourceBatchId}-${edge.targetBatchId}`} label={`${edge.relationType} đến #${edge.targetBatchId}`} size="small" color="primary" variant="outlined" />)}</Stack></Stack></Paper> })}{nodes.length === 0 && <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>Chưa có quan hệ tách/gộp cho lô này.</Paper>}</Stack></Box>
}