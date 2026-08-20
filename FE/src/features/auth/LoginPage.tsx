import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AgricultureRounded, ArrowForwardRounded, CheckCircleRounded, LockRounded, PublicRounded } from '@mui/icons-material'
import { Alert, Box, Button, CircularProgress, Container, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material'
import { ApiError } from '@/lib/api/http'
import { authApi } from './auth.api'
import { useAuthStore } from './auth.store'

export default function LoginPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setAuth = useAuthStore((state) => state.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/" replace />

  const fillDemo = () => { setEmail('admin@agritrace.vn'); setPassword('P@ssw0rd123'); setError('') }
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !password) { setError('Vui lòng nhập email và mật khẩu.'); return }
    try {
      setLoading(true); setError('')
      const result = await authApi.login({ email: email.trim(), username: email.trim(), password })
      setAuth(result.accessToken, result.refreshToken, result.user)
      navigate(result.user.role === 'ADMIN' || result.user.role === 'ORGADMIN' ? '/admin' : '/', { replace: true })
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Không thể đăng nhập.') } finally { setLoading(false) }
  }

  return <Box sx={{ minHeight: '100vh', bgcolor: '#071d16', display: 'flex', alignItems: 'center', py: { xs: 2, md: 5 } }}><Container maxWidth="lg"><Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: { xs: 3, md: 5 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 0.9fr' }, minHeight: { md: 620 } }}><Box sx={{ p: { xs: 3, sm: 5, md: 7 }, color: 'common.white', bgcolor: 'primary.dark', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}><Box sx={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(255,255,255,.16)', right: -150, top: -120 }} /><Box sx={{ position: 'relative' }}><Stack direction="row" alignItems="center" gap={1.5}><Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'success.main', display: 'grid', placeItems: 'center' }}><AgricultureRounded /></Box><Typography sx={{ fontWeight: 900, fontSize: 22 }}>AgriTrace</Typography></Stack><Typography sx={{ mt: { xs: 7, md: 11 }, fontSize: { xs: 34, md: 48 }, lineHeight: 1.05, fontWeight: 900, maxWidth: 470 }}>Minh bạch từ nông trại đến bàn ăn.</Typography><Typography sx={{ mt: 2, color: 'rgba(255,255,255,.7)', maxWidth: 430, fontSize: 16, lineHeight: 1.7 }}>Một không gian duy nhất để quản lý tổ chức, kiểm định chất lượng và truy xuất hành trình nông sản.</Typography></Box><Stack spacing={1.5} sx={{ position: 'relative', mt: 5 }}><Stack direction="row" gap={1.2} alignItems="center"><CheckCircleRounded sx={{ color: '#8ce0a7' }} /><Typography variant="body2">Dữ liệu chuỗi cung ứng có kiểm chứng</Typography></Stack><Stack direction="row" gap={1.2} alignItems="center"><CheckCircleRounded sx={{ color: '#8ce0a7' }} /><Typography variant="body2">Tra cứu công khai không cần tài khoản</Typography></Stack></Stack></Box><Box sx={{ p: { xs: 3, sm: 5, md: 7 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><Typography variant="overline" sx={{ letterSpacing: 1.5, fontWeight: 800, color: 'primary.main' }}>Khu vực vận hành</Typography><Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>Đăng nhập hệ thống</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>Sử dụng tài khoản được cấp để tiếp tục.</Typography>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}><TextField fullWidth required type="email" label="Email công việc" value={email} autoComplete="email" onChange={(event) => setEmail(event.target.value)} /><TextField fullWidth required type="password" label="Mật khẩu" value={password} autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockRounded color="action" /></InputAdornment> } }} /><Button type="submit" variant="contained" size="large" disabled={loading} endIcon={!loading && <ArrowForwardRounded />} sx={{ minHeight: 52, borderRadius: 2, fontWeight: 800 }}>{loading ? <CircularProgress size={23} color="inherit" /> : 'Đăng nhập'}</Button></Box><Button variant="text" onClick={fillDemo} sx={{ mt: 2, textTransform: 'none', justifyContent: 'flex-start', color: 'text.secondary' }}>Dùng tài khoản Admin mẫu</Button><Button startIcon={<PublicRounded />} onClick={() => navigate('/')} sx={{ mt: 1, textTransform: 'none', justifyContent: 'flex-start' }}>Tra cứu công khai không cần đăng nhập</Button></Box></Paper></Container></Box>
}