import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Button, Paper, Typography } from '@mui/material'
import { Inventory2Rounded, LocalShippingRounded, TaskAltRounded } from '@mui/icons-material'
import { useAuthStore } from '@/features/auth/auth.store'
import { StatCard } from '@/components/ui/StatCard'
import { StatusChip } from '@/components/ui/StatusChip'
import { useBatchesStore } from '../batches.store'

export function BatchesPage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const batches = useBatchesStore((state) => state.batches)
  const setSelectedBatchId = useBatchesStore((state) => state.setSelectedBatchId)

  const canCreate = user?.role === 'Farmer'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'primary.main', textTransform: 'uppercase' }}>
            {t('batches.portal')}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            {t('batches.title')}
          </Typography>
          <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 14 }}>{t('batches.subtitle')}</Typography>
        </Box>
        {canCreate && (
          <Button component={Link} to="/batches/new" variant="contained">
            {t('batches.create')}
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        <StatCard
          title={t('batches.totalBatches')}
          value={batches.length}
          description={t('batches.title')}
          icon={<Inventory2Rounded />}
          iconBg="#E8F5E9"
          iconColor="#19713A"
        />
        <StatCard
          title={t('batches.created')}
          value={batches.filter((b) => b.trangThai === 'Created').length}
          description={t('batches.created')}
          icon={<TaskAltRounded />}
          iconBg="#E3F2FD"
          iconColor="#1565C0"
        />
        <StatCard
          title={t('batches.inTransit')}
          value={batches.filter((b) => b.trangThai === 'InTransit').length}
          description={t('batches.inTransit')}
          icon={<LocalShippingRounded />}
          iconBg="#FFF3E0"
          iconColor="#E65100"
        />
      </Box>

      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 800 }}>{t('batches.title')}</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{t('batches.recentActivity')}</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {batches.map((batch) => (
            <Box
              key={batch.maLoHang}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 1.5,
                alignItems: { md: 'center' },
                justifyContent: 'space-between',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{batch.tenSanPham}</Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {batch.maLoHang} • {batch.tenDonViSanXuat} • {batch.viTri}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <StatusChip status={batch.trangThai} />
                <Button
                  component={Link}
                  to={`/batches/${batch.maLoHang}`}
                  size="small"
                  variant="outlined"
                  onClick={() => setSelectedBatchId(batch.maLoHang)}
                >
                  {t('batches.viewDetails')}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  )
}
