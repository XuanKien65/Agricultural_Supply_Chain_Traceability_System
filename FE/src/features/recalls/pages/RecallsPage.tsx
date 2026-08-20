import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { AddRounded, CheckRounded, WarningAmberRounded } from '@mui/icons-material'
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { recallsApi, type Recall } from '../recalls.api'

export function RecallsPage() {
  const client = useQueryClient()
  const [open, setOpen] = useState(false)
  const [batchId, setBatchId] = useState('')
  const [reason, setReason] = useState('')
  const [severity, setSeverity] = useState('HIGH')
  const query = useQuery({ queryKey: ['recalls'], queryFn: recallsApi.getAll })
  const create = useMutation({ mutationFn: () => recallsApi.create({ batchId: Number(batchId), reason: reason.trim(), severity }), onSuccess: () => { void client.invalidateQueries({ queryKey: ['recalls'] }); setOpen(false); setBatchId(''); setReason('') } })
  const resolve = useMutation({ mutationFn: recallsApi.resolve, onSuccess: () => void client.invalidateQueries({ queryKey: ['recalls'] }) })
  const rows = query.data?.items ?? []

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, mb: 3 }}><Box><Typography variant="h4" sx={{ fontWeight: 900 }}>Thu hồi sản phẩm</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>Kích hoạt và theo dõi cảnh báo an toàn thực phẩm.</Typography></Box><Button variant="contained" color="error" startIcon={<AddRounded />} onClick={() => setOpen(true)} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 800 }}>Phát hành thu hồi</Button></Box>
      {query.isError && <Alert severity="error" sx={{ mb: 2 }}>Không thể tải danh sách lệnh thu hồi.</Alert>}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}><Table><TableHead><TableRow sx={{ bgcolor: 'grey.50' }}><TableCell>Mã thu hồi</TableCell><TableCell>Mã lô</TableCell><TableCell>Lý do</TableCell><TableCell>Mức độ</TableCell><TableCell>Ngày tạo</TableCell><TableCell>Trạng thái</TableCell><TableCell align="right">Thao tác</TableCell></TableRow></TableHead><TableBody>{rows.map((recall: Recall) => { const resolved = Boolean(recall.resolvedAt) || recall.status === 'RESOLVED'; return <TableRow key={recall.id} hover><TableCell sx={{ fontWeight: 800 }}>#{recall.id}</TableCell><TableCell>#{recall.batchId}</TableCell><TableCell>{recall.reason}</TableCell><TableCell><Chip icon={<WarningAmberRounded />} label={recall.severity} color={recall.severity === 'CRITICAL' || recall.severity === 'HIGH' ? 'error' : 'warning'} size="small" /></TableCell><TableCell>{new Date(recall.createdAt).toLocaleDateString('vi-VN')}</TableCell><TableCell><Chip label={resolved ? 'Đã giải quyết' : 'Đang cảnh báo'} color={resolved ? 'success' : 'error'} size="small" /></TableCell><TableCell align="right">{!resolved && <Button size="small" startIcon={<CheckRounded />} onClick={() => resolve.mutate(recall.id)} sx={{ textTransform: 'none' }}>Đánh dấu xong</Button>}</TableCell></TableRow> })}{!query.isLoading && rows.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>Chưa có lệnh thu hồi.</TableCell></TableRow>}</TableBody></Table></TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle sx={{ fontWeight: 900 }}>Phát hành lệnh thu hồi</DialogTitle><DialogContent sx={{ display: 'grid', gap: 2, pt: '12px !important' }}><TextField label="ID lô hàng" type="number" value={batchId} onChange={(event) => setBatchId(event.target.value)} required /><TextField label="Mức độ" select value={severity} onChange={(event) => setSeverity(event.target.value)}><MenuItem value="LOW">LOW - Thấp</MenuItem><MenuItem value="MEDIUM">MEDIUM - Trung bình</MenuItem><MenuItem value="HIGH">HIGH - Cao</MenuItem><MenuItem value="CRITICAL">CRITICAL - Khẩn cấp</MenuItem></TextField><TextField label="Lý do thu hồi" multiline minRows={3} value={reason} onChange={(event) => setReason(event.target.value)} required /></DialogContent><DialogActions sx={{ p: 2 }}><Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Hủy</Button><Button variant="contained" color="error" disabled={!batchId || !reason.trim() || create.isPending} onClick={() => create.mutate()} sx={{ textTransform: 'none' }}>Xác nhận thu hồi</Button></DialogActions></Dialog>
    </Box>
  )
}