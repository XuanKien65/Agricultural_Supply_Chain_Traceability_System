import { Link } from 'react-router-dom'
import { Box, Button, Paper, Typography } from '@mui/material'
import { AdminPanelSettingsRounded, ArrowBackRounded } from '@mui/icons-material'

export function RegisterPage() {
  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'success.50' }}><Paper variant="outlined" sx={{ maxWidth: 520, p: 4, borderRadius: 3, textAlign: 'center' }}><AdminPanelSettingsRounded color="primary" sx={{ fontSize: 52 }} /><Typography variant="h5" sx={{ mt: 2, fontWeight: 900 }}>Tài khoản do quản trị viên cấp</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Theo phân quyền BE, người dùng không tự đăng ký. Admin hoặc OrgAdmin tạo tài khoản trong mục Quản lý người dùng.</Typography><Button component={Link} to="/login" variant="contained" startIcon={<ArrowBackRounded />} sx={{ textTransform: 'none' }}>Quay lại đăng nhập</Button></Paper></Box>
}