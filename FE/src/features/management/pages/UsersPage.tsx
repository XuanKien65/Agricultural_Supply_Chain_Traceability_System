import {
  useState,
} from 'react'

import {
  AddRounded,
} from '@mui/icons-material'

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import type {
  UserRole,
} from '@/features/auth/auth.types'

import {
  managementApi,
} from '../management.api'

import {
  useManagementMutation,
  useOrganizations,
  useUsers,
} from '../management.queries'

import type {
  User,
} from '../management.types'

import ManagementPageHeader from '../components/ManagementPageHeader'

const roles: Array<{
  value: UserRole
  label: string
}> = [
  {
    value: 'ADMIN',
    label: 'Quản trị hệ thống',
  },
  {
    value: 'ORGADMIN',
    label: 'Quản trị tổ chức',
  },
  {
    value: 'FARMER',
    label: 'Nông dân',
  },
  {
    value: 'OPERATOR',
    label: 'Vận hành',
  },
  {
    value: 'INSPECTOR',
    label: 'Kiểm định',
  },
]

export default function UsersPage() {
  const [search, setSearch] =
    useState('')

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false)

  const [
    organizationId,
    setOrganizationId,
  ] =
    useState<number | ''>('')

  const [role, setRole] =
    useState<UserRole>(
      'FARMER',
    )

  const [
    fullName,
    setFullName,
  ] = useState('')

  const [email, setEmail] =
    useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const usersQuery =
    useUsers({
      page: 1,
      pageSize: 100,
      search:
        search.trim() ||
        undefined,
    })

  const organizationsQuery =
    useOrganizations({
      page: 1,
      pageSize: 100,
    })

  const createMutation =
    useManagementMutation<
      void,
      User
    >(
      () =>
        managementApi.createUser({
          organizationId:
            organizationId ===
            ''
              ? null
              : organizationId,

          role,

          fullName:
            fullName.trim(),

          email:
            email.trim(),

          password,
        }),

      ['users'],
    )

  const statusMutation =
    useManagementMutation<
      {
        id: number
        isActive: boolean
      },
      void
    >(
      ({
        id,
        isActive,
      }) =>
        managementApi.updateUserStatus(
          id,
          isActive,
        ),

      ['users'],
    )

  const openCreateDialog =
    () => {
      setOrganizationId('')
      setRole('FARMER')
      setFullName('')
      setEmail('')
      setPassword('')
      setDialogOpen(true)
    }

  const handleCreate =
    async () => {
      if (
        !fullName.trim() ||
        !email.trim() ||
        !password
      ) {
        return
      }

      await createMutation.mutateAsync()

      setDialogOpen(false)
    }

  const rows =
    usersQuery.data?.items ??
    []

  const organizations =
    organizationsQuery.data
      ?.items ?? []

  return (
    <Box>
      <ManagementPageHeader
        title="Quản lý người dùng"
        description="Tạo tài khoản và quản lý trạng thái người dùng hệ thống."
        action={
          <Button
            variant="contained"
            startIcon={
              <AddRounded />
            }
            onClick={
              openCreateDialog
            }
            sx={{
              textTransform:
                'none',
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            Thêm người dùng
          </Button>
        }
      />

      {usersQuery.isError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
        >
          Không thể tải danh sách người dùng.
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
        }}
      >
        <TextField
          label="Tìm người dùng"
          placeholder="Tên hoặc email..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          size="small"
          sx={{
            width: {
              xs: '100%',
              md: 360,
            },
          }}
        />
      </Paper>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 3,
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor:
                  'grey.50',
              }}
            >
              <TableCell>
                Người dùng
              </TableCell>

              <TableCell>
                Email
              </TableCell>

              <TableCell>
                Vai trò
              </TableCell>

              <TableCell>
                Tổ chức
              </TableCell>

              <TableCell>
                Trạng thái
              </TableCell>

              <TableCell
                align="right"
              >
                Kích hoạt
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((user) => (
              <TableRow
                key={
                  user.userId
                }
                hover
              >
                <TableCell>
                  <Typography
                    fontWeight={
                      700
                    }
                  >
                    {
                      user.fullName
                    }
                  </Typography>
                </TableCell>

                <TableCell>
                  {user.email}
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={
                      user.role
                    }
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>
                  {user.organizationName ??
                    '—'}
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={
                      user.isActive
                        ? 'ACTIVE'
                        : 'INACTIVE'
                    }
                    color={
                      user.isActive
                        ? 'success'
                        : 'default'
                    }
                  />
                </TableCell>

                <TableCell
                  align="right"
                >
                  <Switch
                    checked={
                      user.isActive
                    }
                    color="success"
                    onChange={(
                      event,
                    ) =>
                      statusMutation.mutate({
                        id:
                          user.userId,

                        isActive:
                          event.target
                            .checked,
                      })
                    }
                  />
                </TableCell>
              </TableRow>
            ))}

            {!usersQuery.isLoading &&
              rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{
                      py: 5,
                    }}
                  >
                    Không có người dùng.
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() =>
          setDialogOpen(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Tạo người dùng
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              pt: 1,
              display: 'flex',
              flexDirection:
                'column',
              gap: 2,
            }}
          >
            <TextField
              label="Họ tên"
              value={fullName}
              onChange={(event) =>
                setFullName(
                  event.target.value,
                )
              }
              fullWidth
              required
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              fullWidth
              required
            />

            <TextField
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              fullWidth
              required
            />

            <TextField
              select
              label="Vai trò"
              value={role}
              onChange={(event) =>
                setRole(
                  event.target
                    .value as UserRole,
                )
              }
              fullWidth
            >
              {roles.map(
                (item) => (
                  <MenuItem
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {item.label}
                  </MenuItem>
                ),
              )}
            </TextField>

            <TextField
              select
              label="Tổ chức"
              value={
                organizationId
              }
              onChange={(event) => {
                const value =
                  event.target.value

                setOrganizationId(
                  value === ''
                    ? ''
                    : Number(
                        value,
                      ),
                )
              }}
              fullWidth
            >
              <MenuItem value="">
                Không thuộc tổ chức
              </MenuItem>

              {organizations.map(
                (organization) => (
                  <MenuItem
                    key={
                      organization.organizationId
                    }
                    value={
                      organization.organizationId
                    }
                  >
                    {
                      organization.name
                    }
                  </MenuItem>
                ),
              )}
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDialogOpen(false)
            }
            sx={{
              textTransform:
                'none',
            }}
          >
            Hủy
          </Button>

          <Button
            variant="contained"
            disabled={
              createMutation.isPending ||
              !fullName.trim() ||
              !email.trim() ||
              password.length < 6
            }
            onClick={
              handleCreate
            }
            sx={{
              textTransform:
                'none',
            }}
          >
            Tạo tài khoản
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}