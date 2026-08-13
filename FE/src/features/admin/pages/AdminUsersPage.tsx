import {
  useMemo,
  useState,
} from 'react'

import {
  AddRounded,
  DeleteOutlineRounded,
  EditRounded,
} from '@mui/icons-material'

import {
  Alert,
  Box,
  Button,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material'

import {
  DataTable,
  type DataTableColumn,
} from '@/components/ui/DataTable'

import {
  PageHeader,
} from '@/components/ui/PageHeader'

import {
  PageLoader,
} from '@/components/ui/PageLoader'

import {
  StatusChip,
} from '@/components/ui/StatusChip'

import {
  formatDate,
} from '@/utils/format'

import {
  useAdminOrganizations,
  useAdminRoles,
  useAdminUsers,
  useCreateAdminUser,
  useDeactivateAdminUser,
  useUpdateAdminUser,
} from '../admin.queries'

import type {
  AdminUser,
  AdminUserFormData,
  AdminUserPayload,
} from '../admin.types'

import {
  UserDialog,
} from '../components/UserDialog'

export function AdminUsersPage() {
  const usersQuery =
    useAdminUsers()

  const rolesQuery =
    useAdminRoles()

  const organizationsQuery =
    useAdminOrganizations()

  const createUser =
    useCreateAdminUser()

  const updateUser =
    useUpdateAdminUser()

  const deactivateUser =
    useDeactivateAdminUser()

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false)

  const [
    editing,
    setEditing,
  ] =
    useState<AdminUser | null>(
      null,
    )

  const [
    message,
    setMessage,
  ] = useState('')

  const [
    actionError,
    setActionError,
  ] = useState('')

  const users =
    usersQuery.data ?? []

  const roles =
    rolesQuery.data ?? []

  const organizations =
    organizationsQuery.data ?? []

  const rows =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase()

      if (!q)
        return users

      return users.filter(
        item =>
          `${
            item.fullName ?? ''
          } ${
            item.email
          } ${
            item.role
          } ${
            item.organizationName ??
            ''
          }`
            .toLowerCase()
            .includes(q),
      )
    }, [
      search,
      users,
    ])

  if (
    usersQuery.isLoading ||
    rolesQuery.isLoading ||
    organizationsQuery.isLoading
  ) {
    return (
      <PageLoader
        label="Đang tải người dùng..."
      />
    )
  }

  const queryError =
    usersQuery.error ??
    rolesQuery.error ??
    organizationsQuery.error

  if (queryError) {
    return (
      <Alert severity="error">
        {queryError
          instanceof Error
          ? queryError.message
          : 'Không tải được dữ liệu người dùng.'}
      </Alert>
    )
  }

  function toPayload(
    data: AdminUserFormData,
  ): AdminUserPayload {
    return {
      fullName:
        data.fullName.trim() ||
        null,

      email:
        data.email.trim(),

      ...(data.password.trim()
        ? {
            password:
              data.password,
          }
        : {}),

      role:
        data.role,

      organizationId:
        data.role
          .toUpperCase() ===
        'ADMIN'
          ? null
          : data.organizationId,

      isActive:
        data.isActive,
    }
  }

  async function save(
    data: AdminUserFormData,
  ) {
    try {
      setActionError('')

      if (editing) {
        await updateUser.mutateAsync({
          id: editing.id,
          payload:
            toPayload(data),
        })

        setMessage(
          'Đã cập nhật người dùng trong database.',
        )
      } else {
        await createUser.mutateAsync(
          toPayload(data),
        )

        setMessage(
          'Đã tạo người dùng trong database.',
        )
      }

      setDialogOpen(false)
      setEditing(null)
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Không lưu được người dùng.',
      )
    }
  }

  async function deactivate(
    row: AdminUser,
  ) {
    if (
      !window.confirm(
        `Vô hiệu hóa người dùng ${
          row.fullName ??
          row.email
        }?`,
      )
    ) {
      return
    }

    try {
      setActionError('')

      await deactivateUser
        .mutateAsync(row.id)

      setMessage(
        'Đã vô hiệu hóa người dùng.',
      )
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Không thể vô hiệu hóa người dùng.',
      )
    }
  }

  const columns:
    DataTableColumn<AdminUser>[] =
    [
      {
        key: 'user',
        label: 'Người dùng',
        minWidth: 220,

        render: row => (
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
              }}
            >
              {row.fullName ||
                'Chưa có họ tên'}
            </Typography>

            <Typography
              sx={{
                color:
                  'text.secondary',
                fontSize: 12,
              }}
            >
              {row.email}
            </Typography>
          </Box>
        ),
      },

      {
        key: 'role',
        label: 'Vai trò',
        render: row =>
          row.role,
      },

      {
        key: 'organization',
        label: 'Tổ chức',
        minWidth: 230,

        render: row =>
          row.organizationName ??
          'Hệ thống',
      },

      {
        key: 'createdAt',
        label: 'Ngày tạo',

        render: row =>
          formatDate(
            row.createdAt,
          ),
      },

      {
        key: 'status',
        label: 'Trạng thái',

        render: row => (
          <StatusChip
            status={
              row.isActive
                ? 'ACTIVE'
                : 'INACTIVE'
            }
          />
        ),
      },

      {
        key: 'actions',
        label: 'Thao tác',
        align: 'right',

        render: row => (
          <Box
            sx={{
              display: 'flex',
              justifyContent:
                'flex-end',
            }}
          >
            <Tooltip title="Sửa">
              <IconButton
                size="small"
                onClick={() => {
                  setEditing(row)
                  setDialogOpen(
                    true,
                  )
                }}
              >
                <EditRounded
                  fontSize="small"
                />
              </IconButton>
            </Tooltip>

            <Tooltip title="Vô hiệu hóa">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={
                    !row.isActive ||
                    deactivateUser
                      .isPending
                  }
                  onClick={() =>
                    void deactivate(
                      row,
                    )
                  }
                >
                  <DeleteOutlineRounded
                    fontSize="small"
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        ),
      },
    ]

  return (
    <>
      <PageHeader
        title="Quản lý người dùng"
        description="CRUD Users thật qua API; tạo/sửa sẽ lưu SQL Server nên F5 không mất dữ liệu."
        search={search}
        onSearchChange={
          setSearch
        }
        action={
          <Button
            variant="contained"
            startIcon={
              <AddRounded />
            }
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            Thêm người dùng
          </Button>
        }
      />

      {actionError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
          onClose={() =>
            setActionError('')
          }
        >
          {actionError}
        </Alert>
      )}

      <DataTable
        rows={rows}
        columns={columns}
        getRowId={row =>
          row.id
        }
      />

      <UserDialog
        open={dialogOpen}
        initial={editing}
        roles={roles}
        organizations={
          organizations
        }
        saving={
          createUser.isPending ||
          updateUser.isPending
        }
        onClose={() => {
          setDialogOpen(false)
          setEditing(null)
        }}
        onSave={data =>
          void save(data)
        }
      />

      <Snackbar
        open={Boolean(
          message,
        )}
        autoHideDuration={
          2500
        }
        message={message}
        onClose={() =>
          setMessage('')
        }
      />
    </>
  )
}