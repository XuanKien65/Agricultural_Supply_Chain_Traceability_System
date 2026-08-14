import { Suspense } from 'react'
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { LogoutRounded } from '@mui/icons-material'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/auth.store'
import { supportedLocales } from '@/lib/i18n'
import { PageLoader } from '@/components/ui/PageLoader'

/** Shell chung cho các trang đã đăng nhập, không phải Admin (Admin có AdminLayout riêng). */
export function MainLayout() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 3 }}>
          <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>{t('app.name')}</Typography>

          <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
            {user?.role === 'Farmer' && (
              <>
                <Button component={NavLink} to="/farmer" end size="small" color="inherit">
                  {t('nav.home')}
                </Button>
                <Button component={NavLink} to="/batches" size="small" color="inherit">
                  {t('nav.batches')}
                </Button>
              </>
            )}
            {(user?.role === 'Processor' || user?.role === 'Distributor' || user?.role === 'Retailer') && (
              <Button component={NavLink} to="/events" size="small" color="inherit">
                {t('nav.events')}
              </Button>
            )}
          </Box>

          <select
            aria-label="Language"
            value={i18n.resolvedLanguage}
            onChange={(e) => void i18n.changeLanguage(e.target.value)}
            style={{ height: 32, borderRadius: 6, border: '1px solid #ddd', padding: '0 8px' }}
          >
            {supportedLocales.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>

          {user && <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{user.name}</Typography>}

          <Button
            startIcon={<LogoutRounded />}
            size="small"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            {t('nav.logout')}
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  )
}
