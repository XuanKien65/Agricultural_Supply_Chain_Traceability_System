import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Button, Typography } from '@mui/material'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 4, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 64, fontWeight: 900, color: 'primary.main' }}>404</Typography>
      <Typography color="text.secondary">{t('common.notFound')}</Typography>
      <Button component={Link} to="/" variant="outlined">
        {t('common.backHome')}
      </Button>
    </Box>
  )
}
