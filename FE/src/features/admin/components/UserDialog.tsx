import {
  useEffect,
  useState,
} from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
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
  onClose: () => void
  onSave: (
    data: AdminUserFormData,
  ) => void
}

const emptyForm: AdminUserFormData = {
  fullName: '',
  email: '',
  password: '',
  role: 'FARMER',
  organizationId: null,
  isActive: true,
}

export function UserDialog({
  open,
  initial,
  roles,
  organizations,
  saving = false,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] =
    useState<AdminUserFormData>(
      emptyForm,
    )

  useEffect(() => {
    if (!open) return

    if (initial) {
      setForm({
        fullName:
          initial.fullName ?? '',

        email:
          initial.email,

        password:
          '',

        role:
          initial.role,

        organizationId:
          initial.organizationId,

        isActive:
          initial.isActive,
      })
    } else {
      setForm({
        ...emptyForm,

        role:
          roles.find(
            role =>
              role.name !== 'ADMIN',
          )?.name ??
          roles[0]?.name ??
          'FARMER',

        organizationId:
          organizations[0]?.id ??
          null,
      })
    }
  }, [
    initial,
    open,
    organizations,
    roles,
  ])

  const isSystemAdmin =
    form.role.toUpperCase() ===
    'ADMIN'

  const canSave =
    form.email.trim() !== '' &&
    form.role.trim() !== '' &&
    (
      !isSystemAdmin ||
      form.organizationId === null
    )

  function update<
    K extends keyof AdminUserFormData,
  >(
    key: K,
    value: AdminUserFormData[K],
  ) {
    setForm(current => ({
      ...current,
      [key]: value,
    }))
  }

  return (
    <Dialog
      open={open}
      onClose={
        saving
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle
        sx={{
          fontWeight: 900,
        }}
      >
        {initial
          ? 'Cập nhật người dùng'
          : 'Thêm người dùng'}
      </DialogTitle>

      <DialogContent
        sx={{
          pt: '12px !important',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <TextField
          label="Họ tên"
          value={form.fullName}
          onChange={event =>
            update(
              'fullName',
              event.target.value,
            )
          }
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={event =>
            update(
              'email',
              event.target.value,
            )
          }
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
          onChange={event =>
            update(
              'password',
              event.target.value,
            )
          }
          helperText="Nếu nhập mật khẩu, Backend sẽ hash trước khi lưu vào PasswordHash."
          fullWidth
        />

        <FormControl
          fullWidth
          required
        >
          <InputLabel>
            Vai trò
          </InputLabel>

          <Select
            label="Vai trò"
            value={form.role}
            onChange={event => {
              const role =
                event.target.value

              setForm(current => ({
                ...current,
                role,
                organizationId:
                  role.toUpperCase() ===
                  'ADMIN'
                    ? null
                    : current.organizationId,
              }))
            }}
          >
            {roles.map(role => (
              <MenuItem
                key={role.name}
                value={role.name}
              >
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          fullWidth
          disabled={isSystemAdmin}
        >
          <InputLabel>
            Tổ chức
          </InputLabel>

          <Select
            label="Tổ chức"
            value={
              form.organizationId ??
              ''
            }
            onChange={event => {
              const value =
                event.target.value as
                  | number
                  | ''

              update(
                'organizationId',
                value === ''
                  ? null
                  : Number(value),
              )
            }}
          >
            <MenuItem value="">
              Không gắn tổ chức
            </MenuItem>

            {organizations.map(
              organization => (
                <MenuItem
                  key={
                    organization.id
                  }
                  value={
                    organization.id
                  }
                >
                  {organization.name}
                  {' '}
                  ({organization.type})
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={
                form.isActive
              }
              onChange={(
                _,
                checked,
              ) =>
                update(
                  'isActive',
                  checked,
                )
              }
            />
          }
          label={
            form.isActive
              ? 'Đang hoạt động'
              : 'Đã khóa'
          }
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
        }}
      >
        <Button
          onClick={onClose}
          disabled={saving}
        >
          Hủy
        </Button>

        <Button
          variant="contained"
          disabled={
            !canSave ||
            saving
          }
          loading={saving}
          onClick={() =>
            onSave(form)
          }
        >
          {initial
            ? 'Lưu thay đổi'
            : 'Tạo người dùng'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}