// ==========================================
// CODE GỐC & CÁC IMPORT CHÍNH
// ==========================================
import { Suspense } from 'react'
import { AppBar, Box, Button, Toolbar, Typography, Chip, Avatar } from '@mui/material'
import { LogoutRounded, DashboardRounded, Inventory2Rounded, TimelineRounded, FactCheckRounded, WarningAmberRounded, CategoryRounded, HomeRounded } from '@mui/icons-material'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/auth.store'
import { supportedLocales } from '@/lib/i18n'
import { PageLoader } from '@/components/ui/PageLoader'

/** Shell chung cho các trang đã đăng nhập, không phải Admin (Admin có AdminLayout riêng). */
export function MainLayout() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  /* ==========================================
   * NEW CODE - Danh sách navigation theo vai trò
   * ========================================== */
  const navItems = [
    { label: 'Trang chủ', to: '/', icon: <HomeRounded fontSize="small" /> },
    { label: 'Bảng điều khiển', to: '/dashboard', icon: <DashboardRounded fontSize="small" /> },
    { label: 'Lô hàng', to: '/batches', icon: <Inventory2Rounded fontSize="small" /> },
    { label: 'Sự kiện chuỗi', to: '/events', icon: <TimelineRounded fontSize="small" /> },
    { label: 'Sản phẩm', to: '/products', icon: <CategoryRounded fontSize="small" /> },
    { label: 'Kiểm định (QC)', to: '/quality', icon: <FactCheckRounded fontSize="small" /> },
    { label: 'Thu hồi (Recall)', to: '/recalls', icon: <WarningAmberRounded fontSize="small" /> },
    { label: 'Thông báo thu hồi', to: '/recall-notifications', icon: <WarningAmberRounded fontSize="small" /> },
  ]
  /* ==========================================
   * END NEW CODE
   * ========================================== */

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
        <Toolbar sx={{ gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' }, py: { xs: 1, md: 0 } }}>
          {/* Logo & Tên hệ thống */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 16 }}>
              🌾
            </Box>
            <Typography sx={{ fontWeight: 900, color: 'primary.main', fontSize: 18, tracking: '-0.5px' }}>
              {t('app.name')}
            </Typography>
          </Box>

          {/* ==========================================
           * NEW CODE - Thanh điều hướng các phân hệ
           * ========================================== */}
          <Box sx={{ display: 'flex', gap: 0.5, flex: 1, overflowX: 'auto', py: 0.5 }}>
            {navItems.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                startIcon={item.icon}
                size="small"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  color: 'text.secondary',
                  borderRadius: 2,
                  px: 1.5,
                  '&.active': {
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    fontWeight: 700,
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          {/* ==========================================
           * END NEW CODE
           * ========================================== */}

          {/* Ngôn ngữ */}
          <select
            aria-label="Language"
            value={i18n.resolvedLanguage}
            onChange={(e) => void i18n.changeLanguage(e.target.value)}
            style={{ height: 32, borderRadius: 6, border: '1px solid #CBD5E1', padding: '0 8px', fontSize: 12, backgroundColor: '#FFF' }}
          >
            {supportedLocales.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Thông tin user & Đăng xuất */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                {user.name?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{user.name}</Typography>
                <Chip label={user.role} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: 'primary.50', color: 'primary.main' }} />
              </Box>
            </Box>
          )}

          <Button
            startIcon={<LogoutRounded />}
            size="small"
            variant="outlined"
            color="inherit"
            sx={{ textTransform: 'none', borderRadius: 2, fontSize: 12 }}
            onClick={() => {
              clearAuth()
              navigate('/login')
            }}
          >
            {t('nav.logout')}
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, width: '100%', mx: 'auto', flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  )
}
