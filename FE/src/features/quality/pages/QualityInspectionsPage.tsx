import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AddRounded, CancelRounded, CheckCircleRounded, SearchRounded } from '@mui/icons-material'
import { Alert, Box, Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { qualityApi, type Inspection } from '../quality.api'

export function QualityInspectionsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [batchId, setBatchId] = useState(
    searchParams.get('batchId') ?? '',
  )
  const parsedBatchId = Number(batchId)
  const query = useQuery({
    queryKey: ['inspections', parsedBatchId],
    queryFn: () => qualityApi.getByBatch(parsedBatchId),
    enabled: Number.isInteger(parsedBatchId) && parsedBatchId > 0,
  })
  const rows = (query.data ?? []).filter((item) => {
    const search = batchId.trim().toLowerCase()
    return !search || String(item.batchId).includes(search) || String(item.id).includes(search)
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, mb: 3 }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 900 }}>Kiểm định chất lượng</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>Theo dõi kết quả PASS/FAIL của từng lô hàng.</Typography></Box>
        <Button variant="contained" startIcon={<AddRounded />} onClick={() => navigate('/admin/quality/new')} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 800 }}>Lập phiếu kiểm định</Button>
      </Box>
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}><TextField fullWidth size="small" label="Mã lô hàng" placeholder="Nhập ID lô, ví dụ 1" value={batchId} onChange={(event) => setBatchId(event.target.value)} slotProps={{ input: { startAdornment: <SearchRounded sx={{ mr: 1, color: 'text.secondary' }} /> } }} /></Paper>
      {query.isError && <Alert severity="error" sx={{ mb: 2 }}>Không thể tải kết quả kiểm định cho lô hàng này.</Alert>}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}><Table><TableHead><TableRow sx={{ bgcolor: 'grey.50' }}><TableCell>Mã phiếu</TableCell><TableCell>Mã lô</TableCell><TableCell>Đơn vị kiểm định</TableCell><TableCell>Kết quả</TableCell><TableCell>Ngày kiểm</TableCell><TableCell>Ghi chú</TableCell></TableRow></TableHead><TableBody>{rows.map((inspection: Inspection) => <TableRow key={inspection.id} hover><TableCell sx={{ fontWeight: 800 }}>#{inspection.id}</TableCell><TableCell>#{inspection.batchId}</TableCell><TableCell>{inspection.inspectorOrganizationName ?? 'Đơn vị kiểm định'}</TableCell><TableCell><Chip icon={(inspection.result ?? '').toUpperCase() === 'PASS' ? <CheckCircleRounded /> : <CancelRounded />} label={inspection.result ?? 'PENDING'} color={(inspection.result ?? '').toUpperCase() === 'PASS' ? 'success' : 'error'} size="small" /></TableCell><TableCell>{inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString('vi-VN') : '-'}</TableCell><TableCell>{inspection.notes ?? '-'}</TableCell></TableRow>)}{!query.isLoading && rows.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>{batchId ? 'Không tìm thấy phiếu kiểm định.' : 'Nhập mã lô để xem kết quả kiểm định.'}</TableCell></TableRow>}</TableBody></Table></TableContainer>
    </Box>
  )
}