import { Suspense } from 'react'
import { Box, Container, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLoader } from '@/components/ui/PageLoader'

/** Shell tối giản cho các trang công khai, không cần đăng nhập (vd. tra cứu QR nguồn gốc). */
export function PublicLayout() {
  const { t } = useTranslation()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box component="header" sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
        <Container maxWidth="sm">
          <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>{t('app.name')}</Typography>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Container>
    </Box>
  )
}
