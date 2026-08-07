import {
  useMemo,
  useState,
} from 'react'

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
  SanPham,
} from '../admin.types'

export function AdminProductsPage() {
  const sanPhams =
    useAdminStore(
      (state) =>
        state.sanPhams,
    )

  const [
    search,
    setSearch,
  ] = useState('')

  const rows = useMemo(() => {
    const q =
      search
        .trim()
        .toLowerCase()

    if (!q) {
      return sanPhams
    }

    return sanPhams.filter(
      (item) =>
        `${item.tenSanPham} ${item.donViTinh} ${item.moTa}`
          .toLowerCase()
          .includes(q),
    )
  }, [sanPhams, search])

  const columns:
    AdminColumn<SanPham>[] = [
      {
        key: 'id',

        label:
          'Mã sản phẩm',

        render: (row) =>
          `SP-${row.maSanPham}`,
      },

      {
        key: 'name',

        label:
          'Tên sản phẩm',

        minWidth: 220,

        render: (row) => (
          <Typography
            fontWeight={800}
          >
            {row.tenSanPham}
          </Typography>
        ),
      },

      {
        key: 'unit',

        label:
          'Đơn vị tính',

        render: (row) =>
          row.donViTinh,
      },

      {
        key: 'description',

        label: 'Mô tả',

        minWidth: 350,

        render: (row) =>
          row.moTa,
      },
    ]

  return (
    <>
      <PageHeader
        title="Quản lý sản phẩm"
        description="Danh mục SanPham dùng khi tạo lô hàng."
        search={search}
        onSearchChange={
          setSearch
        }
      />

      <AdminDataTable
        rows={rows}
        columns={columns}
        getRowId={(row) =>
          row.maSanPham
        }
      />
    </>
  )
}