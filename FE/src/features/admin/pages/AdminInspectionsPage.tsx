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

import {
  StatusChip,
} from '../components/StatusChip'

import type {
  KiemDinh,
} from '../admin.types'

export function AdminInspectionsPage() {
  const kiemDinhs =
    useAdminStore(
      (state) =>
        state.kiemDinhs,
    )

  const donVis =
    useAdminStore(
      (state) =>
        state.donVis,
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
      return kiemDinhs
    }

    return kiemDinhs.filter(
      (item) =>
        `KD-${item.maKiemDinh} LH-${item.maLoHang} ${item.ketQua} ${item.ghiChu}`
          .toLowerCase()
          .includes(q),
    )
  }, [kiemDinhs, search])

  const columns:
    AdminColumn<KiemDinh>[] =
      [
        {
          key: 'id',

          label:
            'Mã kiểm định',

          render: (row) => (
            <Typography
              fontWeight={800}
            >
              KD-
              {
                row.maKiemDinh
              }
            </Typography>
          ),
        },

        {
          key: 'batch',

          label: 'Lô hàng',

          render: (row) =>
            `LH-${row.maLoHang}`,
        },

        {
          key: 'unit',

          label:
            'Đơn vị kiểm định',

          minWidth: 250,

          render: (row) =>
            donVis.find(
              (item) =>
                item.maDonVi ===
                row.maDonViKiemDinh,
            )?.tenDonVi ?? '-',
        },

        {
          key: 'date',

          label:
            'Ngày kiểm định',

          render: (row) =>
            row.ngayKiemDinh,
        },

        {
          key: 'result',

          label: 'Kết quả',

          render: (row) => (
            <StatusChip
              status={
                row.ketQua
              }
            />
          ),
        },

        {
          key: 'note',

          label: 'Ghi chú',

          minWidth: 300,

          render: (row) =>
            row.ghiChu,
        },
      ]

  return (
    <>
      <PageHeader
        title="Quản lý kiểm định"
        description="Kết quả kiểm định chất lượng theo từng lô hàng."
        search={search}
        onSearchChange={
          setSearch
        }
      />

      <AdminDataTable
        rows={rows}
        columns={columns}
        getRowId={(row) =>
          row.maKiemDinh
        }
      />
    </>
  )
}