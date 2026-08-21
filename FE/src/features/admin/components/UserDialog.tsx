import {
  useEffect,
  useState,
} from 'react'

import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material'

import type {
  AdminOrganization,
  AdminRole,
  AdminUser,
  AdminUserFormData,
} from '../admin.types'

interface Props {
  open: boolean
  initial: AdminUser | null
  roles: AdminRole[]
  organizations: AdminOrganization[]
  saving?: boolean
  error?: string | null
  onClose: () => void
  onSave: (
    data: AdminUserFormData,
  ) => void
}

import { useAuthStore } from '@/features/auth/auth.store'

const emptyForm: AdminUserFormData = {
  fullName: '',
  email: '',
  password: '',
  role: '',
  organizationId: null,
  isActive: true,
}

export function UserDialog({
  open,
  initial,
  roles,
  organizations,
  saving = false,
  error = null,
  onClose,
  onSave,
}: Props) {
  const currentUser = useAuthStore(state => state.user)
  const isOrgAdmin = currentUser?.role === 'ORGADMIN'

  const [form, setForm] =
    useState<AdminUserFormData>(
      emptyForm,
    )

  const [validationError, setValidationError] =
    useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setValidationError(null)

    if (initial) {
      setForm({
        fullName: initial.fullName ?? '',
        email: initial.email,
        password: '',
        role: initial.role,
        organizationId: initial.organizationId,
        isActive: initial.isActive,
      })
    } else {
      setForm({
        ...emptyForm,
        organizationId: isOrgAdmin ? (currentUser?.organizationId ?? null) : null,
      })
    }
  }, [currentUser?.organizationId, initial, isOrgAdmin, open, organizations, roles])

  const isSystemAdmin = form.role.toUpperCase() === 'ADMIN'

  function update<K extends keyof AdminUserFormData>(
    key: K,
    value: AdminUserFormData[K],
  ) {
    setValidationError(null)
    setForm(current => ({
      ...current,
      [key]: value,
    }))
  }

  function handleSave() {
    setValidationError(null)

    if (!form.fullName.trim()) {
      setValidationError('Vui lòng nhập đầy đủ Họ và tên.')
      return
    }

    if (!form.email.trim() || !form.email.includes('@')) {
      setValidationError('Vui lòng nhập Địa chỉ Email hợp lệ.')
      return
    }

    if (!initial && !form.password.trim()) {
      setValidationError('Vui lòng nhập Mật khẩu cho người dùng mới.')
      return
    }

    if (!form.role.trim()) {
      setValidationError('Vui lòng chọn Vai trò cho người dùng.')
      return
    }

    if (!isSystemAdmin && form.organizationId === null) {
      setValidationError('Vui lòng chọn Tổ chức liên kết cho vai trò này.')
      return
    }

    onSave(form)
  }

  const activeError = validationError || error

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ fontWeight: 900 }}>
        {initial ? 'Cập nhật người dùng' : 'Thêm người dùng'}
      </DialogTitle>

      <DialogContent
        sx={{
          pt: '12px !important',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {activeError && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {activeError}
          </Alert>
        )}

        <TextField
          label="Họ tên"
          value={form.fullName}
          onChange={event => update('fullName', event.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={event => update('email', event.target.value)}
          required
          fullWidth
        />

        <TextField
          label={
            initial
              ? 'Mật khẩu mới (để trống nếu không đổi)'
              : 'Mật khẩu'
          }
          type="password"
          value={form.password}
          onChange={event => update('password', event.target.value)}
          required={!initial}
          helperText="Backend sẽ hash mã hoá mật khẩu trước khi lưu vào cơ sở dữ liệu."
          fullWidth
        />

        <Autocomplete
          options={roles}
          getOptionLabel={role => role.name}
          value={roles.find(r => r.name === form.role) ?? null}
          onChange={(_, newValue) => {
            const role = newValue ? newValue.name : ''
            setValidationError(null)
            setForm(current => ({
              ...current,
              role,
              organizationId: role.toUpperCase() === 'ADMIN' ? null : current.organizationId,
            }))
          }}
          renderInput={params => (
            <TextField
              {...params}
              label="Vai trò"
              placeholder="Nhập để tìm/lọc vai trò..."
              required
              fullWidth
            />
          )}
          noOptionsText="Không tìm thấy vai trò phù hợp"
          fullWidth
        />

        <Autocomplete
          disabled={isSystemAdmin || isOrgAdmin}
          options={organizations}
          getOptionLabel={org => `${org.name} (${org.type})`}
          value={organizations.find(org => org.id === form.organizationId) ?? null}
          onChange={(_, newValue) => {
            update('organizationId', newValue ? newValue.id : null)
          }}
          renderInput={params => (
            <TextField
              {...params}
              label="Tổ chức"
              placeholder="Nhập để tìm/lọc tên tổ chức..."
              required={!isSystemAdmin}
              fullWidth
            />
          )}
          noOptionsText="Không tìm thấy tổ chức phù hợp"
          fullWidth
        />

        <FormControlLabel
          control={
            <Switch
              checked={form.isActive}
              onChange={(_, checked) => update('isActive', checked)}
            />
          }
          label={form.isActive ? 'Đang hoạt động' : 'Đã khóa'}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={saving}>
          Hủy
        </Button>

        <Button
          variant="contained"
          disabled={saving}
          loading={saving}
          onClick={handleSave}
        >
          {initial ? 'Lưu thay đổi' : 'Tạo người dùng'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}