import {
  Typography,
} from '@mui/material'

import {
  useAdminStore,
} from '../admin.store'

import {
  AdminDataTable,
  type AdminColumn,
} from '../components/AdminDataTable'

import {
  PageHeader,
} from '../components/PageHeader'

import type {
  VaiTro,
} from '../admin.types'

export function AdminRolesPage() {
  const vaiTros =
    useAdminStore(
      (state) =>
        state.vaiTros,
    )

  const nguoiDungs =
    useAdminStore(
      (state) =>
        state.nguoiDungs,
    )

  const columns:
    AdminColumn<VaiTro>[] = [
      {
        key: 'id',

        label:
          'Mã vai trò',

        render: (row) =>
          `VT-${row.maVaiTro}`,
      },

      {
        key: 'name',

        label:
          'Tên vai trò',

        render: (row) => (
          <Typography
            fontWeight={800}
          >
            {row.tenVaiTro}
          </Typography>
        ),
      },

      {
        key: 'description',

        label: 'Mô tả',

        minWidth: 300,

        render: (row) =>
          row.moTa,
      },

      {
        key: 'users',

        label:
          'Số người dùng',

        render: (row) =>
          nguoiDungs.filter(
            (item) =>
              item.maVaiTro ===
              row.maVaiTro,
          ).length,
      },
    ]

  return (
    <>
      <PageHeader
        title="Quản lý vai trò"
        description="Dữ liệu bảng VaiTro trong ERD."
      />

      <AdminDataTable
        rows={vaiTros}
        columns={columns}
        getRowId={(row) =>
          row.maVaiTro
        }
      />
    </>
  )
}