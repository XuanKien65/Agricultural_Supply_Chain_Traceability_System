import {
  useMemo,
  useState,
} from 'react'

import {
  Button,
  Typography,
} from '@mui/material'

import {
  useAdminStore,
} from '../admin.store'

import {
  DataTable,
  type DataTableColumn,
} from '@/components/ui/DataTable'

import {
  PageHeader,
} from '@/components/ui/PageHeader'

import type {
  ChungNhan,
} from '../admin.types'

export function AdminCertificatesPage() {
  const chungNhans =
    useAdminStore(
      (state) =>
        state.chungNhans,
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
      return chungNhans
    }

    return chungNhans.filter(
      (item) =>
        `${item.loaiChungNhan} ${item.donViCap} LH-${item.maLoHang}`
          .toLowerCase()
          .includes(q),
    )
  }, [chungNhans, search])

  const columns:
    DataTableColumn<ChungNhan>[] =
      [
        {
          key: 'type',

          label:
            'Loại chứng nhận',

          render: (row) => (
            <Typography
              sx={{ fontWeight: 800 }}
            >
              {
                row.loaiChungNhan
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
          key: 'inspection',

          label:
            'Kiểm định',

          render: (row) =>
            row.maKiemDinh
              ? `KD-${row.maKiemDinh}`
              : 'Độc lập',
        },

        {
          key: 'issuer',

          label:
            'Đơn vị cấp',

          minWidth: 240,

          render: (row) =>
            row.donViCap,
        },

        {
          key: 'issued',

          label: 'Ngày cấp',

          render: (row) =>
            row.ngayCap,
        },

        {
          key: 'expiry',

          label: 'Hết hạn',

          render: (row) =>
            row.ngayHetHan,
        },

        {
          key: 'file',

          label: 'File',

          render: (row) => (
            <Button
              size="small"
              component="a"
              href={
                row.fileChungNhanUrl
              }
              sx={{
                color:
                  '#19713A',

                fontWeight: 800,
              }}
            >
              Xem file
            </Button>
          ),
        },
      ]

  return (
    <>
      <PageHeader
        title="Quản lý chứng nhận"
        description="VietGAP, GlobalGAP, Organic, HACCP..."
        search={search}
        onSearchChange={
          setSearch
        }
      />

      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) =>
          row.maChungNhan
        }
      />
    </>
  )
}