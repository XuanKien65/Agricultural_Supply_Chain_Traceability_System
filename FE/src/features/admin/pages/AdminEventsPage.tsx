import {
  useMemo,
  useState,
} from 'react'

import {
  Box,
  Tooltip,
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
  SuKien,
} from '../admin.types'

export function AdminEventsPage() {
  const suKiens =
    useAdminStore(
      (state) =>
        state.suKiens,
    )

  const donVis =
    useAdminStore(
      (state) =>
        state.donVis,
    )

  const nguoiDungs =
    useAdminStore(
      (state) =>
        state.nguoiDungs,
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
      return suKiens
    }

    return suKiens.filter(
      (item) =>
        `${item.loaiSuKien} LH-${item.maLoHang} ${item.viTri} ${item.duLieuBoSung}`
          .toLowerCase()
          .includes(q),
    )
  }, [search, suKiens])

  const columns:
    DataTableColumn<SuKien>[] = [
      {
        key: 'event',

        label: 'Sự kiện',

        render: (row) => (
          <Box>
            <Typography
              sx={{ fontWeight: 800 }}
            >
              {row.loaiSuKien}
            </Typography>

            <Typography
              sx={{
                color:
                  'text.secondary',

                fontSize: 12,
              }}
            >
              LH-{row.maLoHang}
            </Typography>
          </Box>
        ),
      },

      {
        key: 'unit',

        label:
          'Đơn vị thực hiện',

        minWidth: 230,

        render: (row) =>
          donVis.find(
            (item) =>
              item.maDonVi ===
              row.maDonViThucHien,
          )?.tenDonVi ?? '-',
      },

      {
        key: 'user',

        label:
          'Người ghi nhận',

        render: (row) =>
          nguoiDungs.find(
            (item) =>
              item.maNguoiDung ===
              row.maNguoiThucHien,
          )?.hoTen ?? '-',
      },

      {
        key: 'time',

        label: 'Thời gian',

        render: (row) =>
          new Date(
            row.thoiGian,
          ).toLocaleString(
            'vi-VN',
          ),
      },

      {
        key: 'location',

        label: 'Vị trí',

        render: (row) =>
          row.viTri,
      },

      {
        key: 'hash',

        label:
          'Hash chain',

        minWidth: 180,

        render: (row) => (
          <Tooltip
            title={`${row.maHash}\n${row.duLieuBoSung}`}
          >
            <Typography
              noWrap
              sx={{
                maxWidth: 180,

                color:
                  '#19713A',

                fontFamily:
                  'monospace',

                fontSize: 12,
              }}
            >
              {row.maHash}
            </Typography>
          </Tooltip>
        ),
      },
    ]

  return (
    <>
      <PageHeader
        title="Chuỗi sự kiện"
        description="Bảng SuKien và dữ liệu hash chain của từng lô hàng."
        search={search}
        onSearchChange={
          setSearch
        }
      />

      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) =>
          row.maSuKien
        }
      />
    </>
  )
}