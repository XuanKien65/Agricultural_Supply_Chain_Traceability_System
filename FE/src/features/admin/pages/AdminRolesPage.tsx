import {
  Alert,
  Typography,
} from '@mui/material'

import {
  DataTable,
  type DataTableColumn,
} from '@/components/ui/DataTable'

import { PageHeader } from '@/components/ui/PageHeader'
import { PageLoader } from '@/components/ui/PageLoader'

import {
  useAdminRoles,
} from '../admin.queries'

import type {
  AdminRole,
} from '../admin.types'

export function AdminRolesPage() {
  const {
    data = [],
    isLoading,
    error,
  } = useAdminRoles()

  if (isLoading) {
    return (
      <PageLoader label="Đang tải vai trò..." />
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        {error instanceof Error
          ? error.message
          : 'Không tải được vai trò.'}
      </Alert>
    )
  }

  const columns:
    DataTableColumn<AdminRole>[] = [
      {
        key: 'name',
        label: 'Vai trò',
        render: row => (
          <Typography
            sx={{
              fontWeight: 800,
            }}
          >
            {row.name}
          </Typography>
        ),
      },
      {
        key: 'description',
        label: 'Mô tả',
        minWidth: 320,
        render: row =>
          row.description,
      },
      {
        key: 'users',
        label: 'Số người dùng',
        align: 'right',
        render: row =>
          row.userCount,
      },
    ]

  return (
    <>
      <PageHeader
        title="Quản lý vai trò"
      />

      <DataTable
        rows={data}
        columns={columns}
        getRowId={row =>
          row.name
        }
      />
    </>
  )
}