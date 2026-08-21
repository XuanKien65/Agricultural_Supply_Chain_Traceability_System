import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { CheckCircleRounded, WarningAmberRounded } from '@mui/icons-material'
import { useAuthStore } from '@/features/auth/auth.store'
import { notificationsApi } from '@/features/notifications/notifications.api'
import type { RecallNotificationItem } from '@/features/notifications/notifications.types'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'

export function RecallNotificationsPage() {
  const user = useAuthStore((state) => state.user)
  const orgId = user?.organizationId

  const [items, setItems] = useState<RecallNotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    if (!orgId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await notificationsApi.getRecallNotifications(orgId)
      setItems(data)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [orgId])

  async function handleAcknowledge() {
    if (!selectedId) return
    try {
      setSubmitting(true)
      setError(null)
      await notificationsApi.acknowledgeRecall(selectedId, notes)
      setSelectedId(null)
      setNotes('')
      await loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Xác nhận thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: DataTableColumn<RecallNotificationItem>[] = [
    {
      key: 'id',
      label: 'Mã TB',
      render: (r) => <Typography sx={{ fontWeight: 700 }}>#{r.id}</Typography>,
    },
    {
      key: 'batchCode',
      label: 'Lô hàng',
      render: (r) => (
        <Typography color="primary.main" sx={{ fontWeight: 700 }}>
          {r.batchCode || `Lô #${r.batchId}`}
        </Typography>
      ),
    },
    {
      key: 'reason',
      label: 'Lý do thu hồi',
      render: (r) => (
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
          {r.reason || 'Cảnh báo chất lượng / An toàn thực phẩm'}
        </Typography>
      ),
    },
    {
      key: 'severity',
      label: 'Mức độ',
      render: (r) => {
        const sev = (r.severity || 'CRITICAL').toUpperCase()
        const isCritical = sev === 'CRITICAL' || sev === 'HIGH'
        return (
          <Chip
            label={sev}
            size="small"
            color={isCritical ? 'error' : 'warning'}
            sx={{ fontWeight: 900, fontSize: 11 }}
          />
        )
      },
    },
    {
      key: 'isAcknowledged',
      label: 'Trạng thái xử lý',
      render: (r) => (
        <Chip
          label={r.isAcknowledged ? 'Đã xác nhận xử lý' : 'Chờ xác nhận'}
          size="small"
          color={r.isAcknowledged ? 'success' : 'error'}
          variant={r.isAcknowledged ? 'filled' : 'outlined'}
          sx={{ fontWeight: 800, fontSize: 11 }}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (r) =>
        r.isAcknowledged ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
            <CheckCircleRounded fontSize="small" />
            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
              Đã xử lý
            </Typography>
          </Box>
        ) : (
          <Button
            size="small"
            variant="contained"
            color="warning"
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, fontSize: 12 }}
            onClick={() => {
              setSelectedId(r.id)
              setNotes('')
            }}
          >
            Xác nhận xử lý
          </Button>
        ),
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 900 }}>
          <WarningAmberRounded color="warning" fontSize="large" />
          Thông Báo Thu Hồi Nông Sản Của Tổ Chức
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 14 }}>
          Danh sách các lệnh thu hồi khẩn cấp liên quan trực tiếp đến lô hàng và tổ chức của bạn.
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ borderRadius: 3, fontWeight: 600 }}>
        Khi nhận được lệnh thu hồi, Quản trị viên Tổ chức (ORGADMIN) có trách nhiệm kiểm tra kho hàng, phong tỏa lô
        hàng vi phạm và bấm <strong>Xác nhận đã xử lý</strong> kèm ghi chú phương án xử lý (hủy bỏ, cách ly, niêm phong).
      </Alert>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable columns={columns} rows={items} getRowId={(r) => r.id} />
        )}
      </Paper>

      {/* Dialog Confirm Acknowledge */}
      <Dialog open={Boolean(selectedId)} onClose={() => setSelectedId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Xác Nhận Đã Xử Lý Thu Hồi</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2, fontSize: 13 }}>
            Nhập ghi chú hoặc phương án xử lý lô hàng khẩn cấp của tổ chức (ví dụ: Đã niêm phong kho 50kg, dừng phân phối).
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Ghi chú xử lý thu hồi *"
            multiline
            rows={3}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ví dụ: Đã cách ly lô hàng khỏi kho thành công..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedId(null)} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="contained" color="warning" onClick={handleAcknowledge} loading={submitting} disabled={!notes.trim()}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
