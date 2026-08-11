import {
  useMemo,
  useState,
} from 'react'

import {
  Box,
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

import {
  StatusChip,
} from '@/components/ui/StatusChip'

import type {
  CanhBaoThuHoi,
  ThongBaoThuHoi,
} from '../admin.types'

export function AdminRecallsPage() {
  const canhBaoThuHois =
    useAdminStore(
      (state) =>
        state.canhBaoThuHois,
    )

  const thongBaoThuHois =
    useAdminStore(
      (state) =>
        state.thongBaoThuHois,
    )

  const nguoiDungs =
    useAdminStore(
      (state) =>
        state.nguoiDungs,
    )

  const donVis =
    useAdminStore(
      (state) =>
        state.donVis,
    )

  const resolveCanhBao =
    useAdminStore(
      (state) =>
        state.resolveCanhBao,
    )

  const [
    search,
    setSearch,
  ] = useState('')

  const alerts = useMemo(() => {
    const q =
      search
        .trim()
        .toLowerCase()

    if (!q) {
      return canhBaoThuHois
    }

    return canhBaoThuHois.filter(
      (item) =>
        `CB-${item.maCanhBao} LH-${item.maLoHang} ${item.lyDo} ${item.mucDoNghiemTrong}`
          .toLowerCase()
          .includes(q),
    )
  }, [
    canhBaoThuHois,
    search,
  ])

  const alertColumns:
    DataTableColumn<CanhBaoThuHoi>[] =
      [
        {
          key: 'id',

          label: 'Cảnh báo',

          render: (row) => (
            <Typography
              sx={{ fontWeight: 800 }}
            >
              CB-
              {
                row.maCanhBao
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
          key: 'creator',

          label:
            'Người tạo',

          render: (row) =>
            nguoiDungs.find(
              (item) =>
                item.maNguoiDung ===
                row.maNguoiTao,
            )?.hoTen ?? '-',
        },

        {
          key: 'reason',

          label: 'Lý do',

          minWidth: 300,

          render: (row) =>
            row.lyDo,
        },

        {
          key: 'severity',

          label: 'Mức độ',

          render: (row) => (
            <StatusChip
              status={
                row.mucDoNghiemTrong
              }
            />
          ),
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

        {
          key: 'action',

          label: 'Thao tác',

          align: 'right',

          render: (row) =>
            row.trangThai ===
            'Active' ? (
              <Button
                size="small"
                onClick={() =>
                  resolveCanhBao(
                    row.maCanhBao,
                  )
                }
                sx={{
                  color:
                    '#19713A',

                  fontWeight: 800,
                }}
              >
                Đánh dấu đã xử lý
              </Button>
            ) : (
              '-'
            ),
        },
      ]

  const notificationColumns:
    DataTableColumn<ThongBaoThuHoi>[] =
      [
        {
          key: 'id',

          label: 'Thông báo',

          render: (row) =>
            `TB-${row.maThongBao}`,
        },

        {
          key: 'alert',

          label: 'Cảnh báo',

          render: (row) =>
            `CB-${row.maCanhBao}`,
        },

        {
          key: 'unit',

          label:
            'Đơn vị nhận',

          minWidth: 250,

          render: (row) =>
            donVis.find(
              (item) =>
                item.maDonVi ===
                row.maDonVi,
            )?.tenDonVi ?? '-',
        },

        {
          key: 'time',

          label:
            'Thời gian gửi',

          render: (row) =>
            new Date(
              row.thoiGianGui,
            ).toLocaleString(
              'vi-VN',
            ),
        },

        {
          key: 'status',

          label: 'Xác nhận',

          render: (row) => (
            <StatusChip
              status={
                row.trangThaiXacNhan
              }
            />
          ),
        },

        {
          key: 'note',

          label:
            'Ghi chú xử lý',

          minWidth: 250,

          render: (row) =>
            row.ghiChuXuLy,
        },
      ]

  return (
    <>
      <PageHeader
        title="Cảnh báo thu hồi"
        description="CanhBaoThuHoi và ThongBaoThuHoi trong ERD."
        search={search}
        onSearchChange={
          setSearch
        }
      />

      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            mb: 1.5,

            fontSize: 19,
            fontWeight: 900,
          }}
        >
          Danh sách cảnh báo
        </Typography>

        <DataTable
          rows={alerts}
          columns={
            alertColumns
          }
          getRowId={(row) =>
            row.maCanhBao
          }
        />
      </Box>

      <Box>
        <Typography
          sx={{
            mb: 1.5,

            fontSize: 19,
            fontWeight: 900,
          }}
        >
          Thông báo tới đơn vị
        </Typography>

        <DataTable
          rows={
            thongBaoThuHois
          }
          columns={
            notificationColumns
          }
          getRowId={(row) =>
            row.maThongBao
          }
        />
      </Box>
    </>
  )
}