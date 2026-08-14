import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Button, Paper, Typography } from '@mui/material'
import { useAuthStore } from '@/features/auth/auth.store'

const ROLE_HOME: Record<string, string> = {
  Admin: '/admin',
  Farmer: '/farmer',
  Processor: '/events',
  Distributor: '/events',
  Retailer: '/events',
}

export function HomePage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          {t('app.name')}
        </Typography>
        <Typography sx={{ mt: 1, color: 'text.secondary' }}>{t('app.tagline')}</Typography>
      </Box>

      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, maxWidth: 480 }}>
        <Typography sx={{ fontWeight: 700 }}>
          {user ? `${user.name} • ${user.role}` : t('auth.signInToContinue')}
        </Typography>
        <Button component={Link} to={user ? (ROLE_HOME[user.role] ?? '/') : '/login'} variant="contained" sx={{ mt: 2 }}>
          {t('nav.batches')} →
        </Button>
      </Paper>
    </Box>
  )
}
