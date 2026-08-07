import {
  useMemo,
  useState,
} from 'react'

import {
  Box,
  Typography,
} from '@mui/material'

import {
  QrCode2Rounded,
} from '@mui/icons-material'

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
  LoHang,
} from '../admin.types'

export function AdminBatchesPage() {
  const loHangs =
    useAdminStore(
      (state) =>
        state.loHangs,
    )

  const sanPhams =
    useAdminStore(
      (state) =>
        state.sanPhams,
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
      return loHangs
    }

    return loHangs.filter(
      (item) => {
        const sanPham =
          sanPhams.find(
            (product) =>
              product.maSanPham ===
              item.maSanPham,
          )?.tenSanPham ?? ''

        const donVi =
          donVis.find(
            (unit) =>
              unit.maDonVi ===
              item.maDonViSanXuat,
          )?.tenDonVi ?? ''

        return `LH-${item.maLoHang} ${item.maQR} ${sanPham} ${donVi} ${item.trangThai}`
          .toLowerCase()
          .includes(q)
      },
    )
  }, [
    donVis,
    loHangs,
    sanPhams,
    search,
  ])

  const columns:
    AdminColumn<LoHang>[] = [
      {
        key: 'batch',

        label:
          'Lô hàng / QR',

        minWidth: 190,

        render: (row) => (
          <Box
            sx={{
              display: 'flex',

              alignItems:
                'center',

              gap: 1,
            }}
          >
            <QrCode2Rounded
              sx={{
                color:
                  '#19713A',
              }}
            />

            <Box>
              <Typography
                fontWeight={
                  800
                }
              >
                LH-
                {row.maLoHang}
              </Typography>

              <Typography
                sx={{
                  color:
                    'text.secondary',

                  fontSize: 11,
                }}
              >
                {row.maQR}
              </Typography>
            </Box>
          </Box>
        ),
      },

      {
        key: 'product',

        label: 'Sản phẩm',

        render: (row) =>
          sanPhams.find(
            (item) =>
              item.maSanPham ===
              row.maSanPham,
          )?.tenSanPham ?? '-',
      },

      {
        key: 'producer',

        label:
          'Đơn vị sản xuất',

        minWidth: 240,

        render: (row) =>
          donVis.find(
            (item) =>
              item.maDonVi ===
              row.maDonViSanXuat,
          )?.tenDonVi ?? '-',
      },

      {
        key: 'parent',

        label: 'Lô cha',

        render: (row) =>
          row.maLoHangCha
            ? `LH-${row.maLoHangCha}`
            : '-',
      },

      {
        key: 'harvest',

        label:
          'Thu hoạch',

        render: (row) =>
          row.ngayThuHoach,
      },

      {
        key: 'weight',

        label:
          'Khối lượng',

        align: 'right',

        render: (row) =>
          `${row.khoiLuong.toLocaleString(
            'vi-VN',
          )} kg`,
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
        title="Quản lý lô hàng"
        description="Theo dõi LoHang, QR và quan hệ lô cha - lô con."
        search={search}
        onSearchChange={
          setSearch
        }
      />

      <AdminDataTable
        rows={rows}
        columns={columns}
        getRowId={(row) =>
          row.maLoHang
        }
      />
    </>
  )
}