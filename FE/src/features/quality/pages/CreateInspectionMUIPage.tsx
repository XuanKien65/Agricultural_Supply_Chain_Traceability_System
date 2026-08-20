import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import { ArrowBackRounded, SaveRounded } from '@mui/icons-material'
import { qualityApi } from '../quality.api'
import { ApiError } from '@/lib/api/http'

export function CreateInspectionMUIPage() {
  const navigate = useNavigate()
  const client = useQueryClient()
  const [batchId, setBatchId] = useState('')
  const [result, setResult] = useState('PASS')
  const [notes, setNotes] = useState('')
  const parsedBatchId = Number(batchId)
  const mutation = useMutation({
    mutationFn: () => {
      if (!Number.isInteger(parsedBatchId) || parsedBatchId <= 0) {
        throw new Error('ID lô hàng phải là số nguyên dương.')
      }

      return qualityApi.create(parsedBatchId, {
        result,
        notes: notes.trim() || undefined,
      })
    },
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['inspections'] }); navigate(`/admin/quality?batchId=${parsedBatchId}`) },
  })

  const errorMessage = mutation.error instanceof ApiError
    ? mutation.error.message
    : 'Không thể lưu phiếu kiểm định.'

  return <Box sx={{ maxWidth: 720, mx: 'auto' }}><Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/admin/quality')} sx={{ textTransform: 'none', mb: 2 }}>Quay lại</Button><Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}><Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>Lập phiếu kiểm định</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Ghi nhận kết quả kiểm tra chất lượng và tự động tạo sự kiện INSPECT.</Typography>{mutation.isError && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}<Stack spacing={2}><TextField label="ID lô hàng" type="number" value={batchId} onChange={(event) => setBatchId(event.target.value)} error={Boolean(batchId) && (!Number.isInteger(parsedBatchId) || parsedBatchId <= 0)} helperText={batchId && (!Number.isInteger(parsedBatchId) || parsedBatchId <= 0) ? 'ID lô hàng phải là số nguyên dương.' : undefined} required fullWidth /><TextField label="Kết quả" select value={result} onChange={(event) => setResult(event.target.value)} fullWidth><MenuItem value="PASS">PASS - Đạt</MenuItem><MenuItem value="FAIL">FAIL - Không đạt</MenuItem><MenuItem value="PENDING">PENDING - Chờ xử lý</MenuItem></TextField><TextField label="Ghi chú kiểm định" multiline minRows={5} value={notes} onChange={(event) => setNotes(event.target.value)} fullWidth /><Button variant="contained" startIcon={<SaveRounded />} disabled={mutation.isPending} onClick={() => mutation.mutate()} sx={{ alignSelf: 'flex-end', textTransform: 'none', borderRadius: 2, fontWeight: 800 }}>Lưu phiếu kiểm định</Button></Stack></Paper></Box>
}