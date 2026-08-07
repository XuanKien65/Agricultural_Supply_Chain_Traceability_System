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
  DonVi,
} from '../admin.types'

export function AdminUnitsPage() {
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
      return donVis
    }

    return donVis.filter(
      (item) =>
        `${item.tenDonVi} ${item.loaiDonVi} ${item.diaChi} ${item.maSoThue}`
          .toLowerCase()
          .includes(q),
    )
  }, [donVis, search])

  const columns:
    AdminColumn<DonVi>[] = [
      {
        key: 'name',

        label: 'Đơn vị',

        minWidth: 250,

        render: (row) => (
          <Typography
            fontWeight={800}
          >
            {row.tenDonVi}
          </Typography>
        ),
      },

      {
        key: 'type',

        label: 'Loại',

        render: (row) =>
          row.loaiDonVi,
      },

      {
        key: 'address',

        label: 'Địa chỉ',

        minWidth: 200,

        render: (row) =>
          row.diaChi,
      },

      {
        key: 'phone',

        label:
          'Số điện thoại',

        render: (row) =>
          row.soDienThoai,
      },

      {
        key: 'tax',

        label:
          'Mã số thuế',

        render: (row) =>
          row.maSoThue,
      },

      {
        key: 'status',

        label:
          'Trạng thái',

        render: (row) => (
          <StatusChip
            status={
              row.trangThai
            }
          />
        ),
      },
    ]

  return (
    <>
      <PageHeader
        title="Quản lý đơn vị"
        description="Farmer, Processor, Distributor, Retailer và Inspector."
        search={search}
        onSearchChange={
          setSearch
        }
      />

      <AdminDataTable
        rows={rows}
        columns={columns}
        getRowId={(row) =>
          row.maDonVi
        }
      />
    </>
  )
}