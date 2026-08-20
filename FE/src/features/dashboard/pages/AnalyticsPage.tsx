import { useQueries, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material'
import { AnalyticsRounded, SearchRounded, TimelineRounded } from '@mui/icons-material'
import { analyticsApi, type AnalyticsRecord } from '../analytics.api'

function displayValue(value: unknown) {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function MetricGrid({ data }: { data?: AnalyticsRecord }) {
  const entries = Object.entries(data ?? {}).slice(0, 8)
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>{entries.map(([key, value]) => <Paper key={key} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}><Typography variant="caption" color="text.secondary">{key}</Typography><Typography sx={{ mt: 1, fontSize: 24, fontWeight: 900, wordBreak: 'break-word' }}>{displayValue(value)}</Typography></Paper>)}</Box>
}

export function AnalyticsPage() {
  const overview = useQuery({ queryKey: ['analytics', 'overview'], queryFn: analyticsApi.getOverview })
  const supporting = useQueries({ queries: [{ queryKey: ['analytics', 'distribution'], queryFn: analyticsApi.getBatchDistribution }, { queryKey: ['analytics', 'processing'], queryFn: analyticsApi.getProcessingTime }] })
  const [batchId, setBatchId] = useState('')
  const traceback = useQuery({ queryKey: ['analytics', 'traceback', batchId], queryFn: () => analyticsApi.getTraceback(Number(batchId)), enabled: false })
  return <Box><Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2} sx={{ mb: 3 }}><Box><Stack direction="row" alignItems="center" gap={1}><AnalyticsRounded color="primary" /><Typography variant="h4" sx={{ fontWeight: 900 }}>Analytics Dashboard</Typography></Stack><Typography color="text.secondary" sx={{ mt: 0.5 }}>Tổng quan, phân bổ lô, thời gian xử lý và truy vết ngược.</Typography></Box></Stack>{overview.isError && <Alert severity="error" sx={{ mb: 2 }}>Không thể tải Analytics Overview.</Alert>}<MetricGrid data={overview.data} /><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2, mt: 2 }}>{supporting.map((query, index) => <Paper key={index} variant="outlined" sx={{ p: 3, borderRadius: 3 }}><Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>{index === 0 ? 'Phân bổ lô hàng' : 'Thời gian xử lý'}</Typography><MetricGrid data={query.data} /></Paper>)}</Box><Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mt: 2 }}><Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ xs: 'stretch', sm: 'center' }}><Box sx={{ flex: 1 }}><Stack direction="row" alignItems="center" gap={1}><TimelineRounded color="primary" /><Typography variant="h6" sx={{ fontWeight: 900 }}>Truy vết ngược</Typography></Stack><Typography variant="body2" color="text.secondary">Tìm các lô liên quan khi phát hiện sự cố.</Typography></Box><TextField size="small" label="ID lô hàng" type="number" value={batchId} onChange={(event) => setBatchId(event.target.value)} /><Button variant="contained" startIcon={<SearchRounded />} disabled={!batchId || traceback.isFetching} onClick={() => void traceback.refetch()} sx={{ textTransform: 'none' }}>Tra cứu</Button></Stack>{traceback.data && <Box sx={{ mt: 2 }}><Chip label="Đã tải kết quả traceback" color="success" /><Typography component="pre" sx={{ mt: 2, p: 2, bgcolor: 'grey.50', overflow: 'auto', borderRadius: 2, fontSize: 12 }}>{JSON.stringify(traceback.data, null, 2)}</Typography></Box>}</Paper></Box>
}