import { Box, CircularProgress, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function PageLoader({ label }: { label?: string }) {
  const { t } = useTranslation()
  return (
    <Box
      role="status"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, p: 8 }}
    >
      <CircularProgress size={24} />
      <Typography color="text.secondary">{label ?? t('common.loading')}</Typography>
    </Box>
  )
}
