import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material'
import { useAuthStore } from '@/features/auth/auth.store'
import { useCreateBatch, useProducts } from '../batches.queries'

export function CreateBatchPage() {
  const navigate=useNavigate(); const user=useAuthStore(s=>s.user); const {data:products=[]}=useProducts(); const create=useCreateBatch()
  const [form,setForm]=useState({productId:'',harvestDate:new Date().toISOString().slice(0,10),weight:'',location:'',harvestNotes:''})
  async function submit(e:FormEvent){e.preventDefault();const batch=await create.mutateAsync({productId:Number(form.productId),producerOrganizationId:user?.organizationId??1,performedByUserId:user?.id??1,harvestDate:form.harvestDate,weight:Number(form.weight),location:form.location,harvestNotes:form.harvestNotes});navigate(`/batches/${batch.batchId}`)}
  return <Box sx={{maxWidth:900,mx:'auto'}}><Typography color="primary" sx={{fontWeight:800}}>GHI NHẬN THU HOẠCH</Typography><Typography variant="h4" sx={{fontWeight:900}}>Tạo lô hàng mới</Typography><Typography color="text.secondary" sx={{mb:3}}>Hệ thống sẽ tự sinh mã lô, QR và sự kiện HARVEST đầu tiên.</Typography>
    <Paper component="form" onSubmit={submit} sx={{p:3,border:'1px solid',borderColor:'divider',borderRadius:3,display:'grid',gridTemplateColumns:{xs:'1fr',md:'1fr 1fr'},gap:2}}>
      <TextField select required label="Sản phẩm" value={form.productId} onChange={e=>setForm({...form,productId:e.target.value})}>{products.map(x=><MenuItem key={x.productId} value={x.productId}>{x.name} ({x.unit})</MenuItem>)}</TextField>
      <TextField required type="number" label="Khối lượng" value={form.weight} onChange={e=>setForm({...form,weight:e.target.value})} slotProps={{htmlInput:{min:0.01,step:0.01}}}/>
      <TextField required type="date" label="Ngày thu hoạch" value={form.harvestDate} onChange={e=>setForm({...form,harvestDate:e.target.value})} slotProps={{inputLabel:{shrink:true}}}/>
      <TextField label="Địa điểm thu hoạch" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
      <TextField multiline minRows={4} label="Ghi chú thu hoạch" value={form.harvestNotes} onChange={e=>setForm({...form,harvestNotes:e.target.value})} sx={{gridColumn:{md:'span 2'}}}/>
      {create.isError&&<Alert severity="error" sx={{gridColumn:{md:'span 2'}}}>{create.error.message}</Alert>}
      <Box sx={{gridColumn:{md:'span 2'},display:'flex',justifyContent:'flex-end',gap:1}}><Button onClick={()=>navigate('/batches')}>Hủy</Button><Button type="submit" variant="contained" disabled={create.isPending}>{create.isPending?'Đang tạo…':'Tạo lô và cấp QR'}</Button></Box>
    </Paper></Box>
}
