import {
  useState,
} from 'react'

import {
  AddRounded,
  EditRounded,
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
  IconButton,
  MenuItem,
  Paper,
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
  OrganizationType,
} from '@/features/auth/auth.types'

import {
  managementApi,
} from '../management.api'

import {
  useManagementMutation,
  useOrganizations,
} from '../management.queries'

import type {
  Organization,
  OrganizationStatus,
} from '../management.types'

import ManagementPageHeader from '../components/ManagementPageHeader'

const organizationTypes: Array<{
  value: OrganizationType
  label: string
}> = [
  {
    value: 'FARM',
    label: 'Nông trại',
  },
  {
    value: 'PROCESSOR',
    label: 'Đơn vị sơ chế',
  },
  {
    value: 'DISTRIBUTOR',
    label: 'Nhà phân phối',
  },
  {
    value: 'RETAILER',
    label: 'Nhà bán lẻ',
  },
]

export default function OrganizationsPage() {
  const [search, setSearch] =
    useState('')

  const [dialogOpen, setDialogOpen] =
    useState(false)

  const [
    editingOrganization,
    setEditingOrganization,
  ] =
    useState<Organization | null>(
      null,
    )

  const [name, setName] =
    useState('')

  const [type, setType] =
    useState<OrganizationType>(
      'FARM',
    )

  const organizationsQuery =
    useOrganizations({
      page: 1,
      pageSize: 100,
      search:
        search.trim() ||
        undefined,
    })

  const saveMutation =
    useManagementMutation<
      void,
      Organization
    >(
      async () => {
        if (
          editingOrganization
        ) {
          return managementApi.updateOrganization(
            editingOrganization.organizationId,
            {
              name: name.trim(),
              type,
            },
          )
        }

        return managementApi.createOrganization({
          name: name.trim(),
          type,
        })
      },
      ['organizations'],
    )

  const statusMutation =
    useManagementMutation<
      {
        id: number
        status: OrganizationStatus
      },
      void
    >(
      ({ id, status }) =>
        managementApi.updateOrganizationStatus(
          id,
          status,
        ),
      ['organizations'],
    )

  const openCreateDialog = () => {
    setEditingOrganization(
      null,
    )

    setName('')
    setType('FARM')
    setDialogOpen(true)
  }

  const openEditDialog = (
    organization: Organization,
  ) => {
    setEditingOrganization(
      organization,
    )

    setName(
      organization.name,
    )

    setType(
      organization.type,
    )

    setDialogOpen(true)
  }

  const handleSave =
    async () => {
      if (!name.trim()) {
        return
      }

      await saveMutation.mutateAsync()

      setDialogOpen(false)
    }

  const rows =
    organizationsQuery.data
      ?.items ?? []

  return (
    <Box>
      <ManagementPageHeader
        title="Quản lý tổ chức"
        description="Quản lý các đơn vị tham gia chuỗi cung ứng nông sản."
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
              borderRadius: 2,
              textTransform:
                'none',
              fontWeight: 700,
            }}
          >
            Thêm tổ chức
          </Button>
        }
      />

      {organizationsQuery.isError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
        >
          Không thể tải danh sách tổ chức.
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
          size="small"
          label="Tìm kiếm tổ chức"
          placeholder="Nhập tên tổ chức..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          sx={{
            width: {
              xs: '100%',
              sm: 350,
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
                ID
              </TableCell>

              <TableCell>
                Tên tổ chức
              </TableCell>

              <TableCell>
                Loại
              </TableCell>

              <TableCell>
                Trạng thái
              </TableCell>

              <TableCell
                align="right"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map(
              (organization) => (
                <TableRow
                  key={
                    organization.organizationId
                  }
                  hover
                >
                  <TableCell>
                    {
                      organization.organizationId
                    }
                  </TableCell>

                  <TableCell>
                    <Typography
                      fontWeight={
                        700
                      }
                    >
                      {
                        organization.name
                      }
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {
                      organization.type
                    }
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        organization.status
                      }
                      color={
                        organization.status ===
                        'ACTIVE'
                          ? 'success'
                          : organization.status ===
                              'SUSPENDED'
                            ? 'warning'
                            : 'default'
                      }
                    />
                  </TableCell>

                  <TableCell
                    align="right"
                  >
                    <IconButton
                      onClick={() =>
                        openEditDialog(
                          organization,
                        )
                      }
                    >
                      <EditRounded />
                    </IconButton>

                    <Button
                      size="small"
                      onClick={() =>
                        statusMutation.mutate({
                          id:
                            organization.organizationId,

                          status:
                            organization.status ===
                            'ACTIVE'
                              ? 'INACTIVE'
                              : 'ACTIVE',
                        })
                      }
                      sx={{
                        textTransform:
                          'none',
                      }}
                    >
                      {organization.status ===
                      'ACTIVE'
                        ? 'Vô hiệu hóa'
                        : 'Kích hoạt'}
                    </Button>
                  </TableCell>
                </TableRow>
              ),
            )}

            {!organizationsQuery.isLoading &&
              rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{
                      py: 5,
                    }}
                  >
                    Không có tổ chức nào.
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
          {editingOrganization
            ? 'Cập nhật tổ chức'
            : 'Thêm tổ chức'}
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
              label="Tên tổ chức"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              required
              fullWidth
            />

            <TextField
              select
              label="Loại tổ chức"
              value={type}
              onChange={(event) =>
                setType(
                  event.target
                    .value as OrganizationType,
                )
              }
              fullWidth
            >
              {organizationTypes.map(
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
              !name.trim() ||
              saveMutation.isPending
            }
            onClick={
              handleSave
            }
            sx={{
              textTransform:
                'none',
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}