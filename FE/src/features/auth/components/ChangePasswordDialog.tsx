import { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { authApi } from '../auth.api'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ChangePasswordDialog({ open, onClose, onSuccess }: Props) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  function handleClose() {
    if (loading) return
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setError(null)
    setSuccessMsg('')
    onClose()
  }

  async function handleSubmit() {
    setError(null)
    setSuccessMsg('')

    if (!currentPassword) {
      setError('Vui lòng nhập Mật khẩu hiện tại.')
      return
    }

    if (!newPassword) {
      setError('Vui lòng nhập Mật khẩu mới.')
      return
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có độ dài từ 6 ký tự trở lên.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError('Xác nhận mật khẩu mới không khớp.')
      return
    }

    if (currentPassword === newPassword) {
      setError('Mật khẩu mới không được giống Mật khẩu hiện tại.')
      return
    }

    try {
      setLoading(true)
      await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      })

      setSuccessMsg('Đổi mật khẩu thành công!')
      setTimeout(() => {
        handleClose()
        onSuccess?.()
      }, 1500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể đổi mật khẩu.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 900 }}>Đổi mật khẩu tài khoản</DialogTitle>

      <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {successMsg && (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            {successMsg}
          </Alert>
        )}

        <TextField
          label="Mật khẩu hiện tại *"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoFocus
          fullWidth
        />

        <TextField
          label="Mật khẩu mới *"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          helperText="Tối thiểu 6 ký tự"
          fullWidth
        />

        <TextField
          label="Xác nhận mật khẩu mới *"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          fullWidth
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          loading={loading}
          onClick={handleSubmit}
        >
          Lưu mật khẩu
        </Button>
      </DialogActions>
    </Dialog>
  )
}
