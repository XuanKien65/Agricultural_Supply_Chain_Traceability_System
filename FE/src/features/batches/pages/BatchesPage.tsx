import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material'
import { AddRounded } from '@mui/icons-material'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusChip } from '@/components/ui/StatusChip'
import { useAuthStore } from '@/features/auth/auth.store'
import { useFarmerBatches } from '../batches.queries'

export function BatchesPage() {
  const user = useAuthStore(s => s.user); const orgId = user?.organizationId ?? 1
  const { data = [], isLoading } = useFarmerBatches(orgId); const [search,setSearch]=useState(''); const [status,setStatus]=useState('')
  const rows=useMemo(()=>data.filter(x=>(!status||x.status===status)&&(`${x.batchCode} ${x.productName}`.toLowerCase().includes(search.toLowerCase()))),[data,search,status])
  return <Box sx={{display:'flex',flexDirection:'column',gap:3}}>
    <PageHeader title="Lô hàng của nông trại" description="Quản lý lô nông sản từ thời điểm thu hoạch và định danh QR." action={<Button component={Link} to="/batches/new" variant="contained" startIcon={<AddRounded/>}>Tạo lô hàng</Button>}/>
    <Paper sx={{p:2,border:'1px solid',borderColor:'divider',borderRadius:3,display:'flex',gap:2,flexWrap:'wrap'}}><TextField size="small" label="Tìm mã lô hoặc sản phẩm" value={search} onChange={e=>setSearch(e.target.value)} sx={{minWidth:280}}/><TextField select size="small" label="Trạng thái" value={status} onChange={e=>setStatus(e.target.value)} sx={{minWidth:180}}><MenuItem value="">Tất cả</MenuItem><MenuItem value="Created">Mới tạo</MenuItem><MenuItem value="InTransit">Đang vận chuyển</MenuItem><MenuItem value="Recalled">Thu hồi</MenuItem></TextField></Paper>
    <Paper sx={{p:3,border:'1px solid',borderColor:'divider',borderRadius:3}}>{isLoading?<Typography>Đang tải…</Typography>:rows.length===0?<Typography color="text.secondary">Không có lô hàng phù hợp.</Typography>:rows.map(x=><Box key={x.batchId} sx={{py:2,borderBottom:'1px solid',borderColor:'divider',display:'grid',gridTemplateColumns:{xs:'1fr',md:'2fr 1fr 1fr auto'},gap:2,alignItems:'center'}}><Box><Typography sx={{fontWeight:800}}>{x.productName}</Typography><Typography variant="body2" color="text.secondary">{x.batchCode}</Typography></Box><Typography>{x.weight.toLocaleString('vi-VN')} {x.unit}</Typography><StatusChip status={x.status}/><Button component={Link} to={`/batches/${x.batchId}`} variant="outlined" size="small">Xem chi tiết</Button></Box>)}</Paper>
  </Box>
}
