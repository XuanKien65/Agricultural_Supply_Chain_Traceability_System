import {
  ApartmentRounded,
  LocalShippingRounded,
  PeopleAltRounded,
  WarningAmberRounded,
} from '@mui/icons-material'

import {
  Box,
  Paper,
  Typography,
} from '@mui/material'

import { useAdminStore } from '../admin.store'

import {
  DataTable,
  type DataTableColumn,
} from '@/components/ui/DataTable'

import { StatCard } from '@/components/ui/StatCard'
import { StatusChip } from '@/components/ui/StatusChip'

import type { LoHang } from '../admin.types'

export function AdminDashboardPage() {
  const donVis =
    useAdminStore(
      (state) => state.donVis,
    )

  const nguoiDungs =
    useAdminStore(
      (state) =>
        state.nguoiDungs,
    )

  const loHangs =
    useAdminStore(
      (state) => state.loHangs,
    )

  const canhBaoThuHois =
    useAdminStore(
      (state) =>
        state.canhBaoThuHois,
    )

  const sanPhams =
    useAdminStore(
      (state) =>
        state.sanPhams,
    )

  const columns:
    DataTableColumn<LoHang>[] = [
      {
        key: 'id',
        label: 'Mã lô',

        render: (row) => (
          <Typography
            sx={{ fontWeight: 800 }}
          >
            LH-{row.maLoHang}
          </Typography>
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
        key: 'weight',
        label: 'Khối lượng',

        render: (row) =>
          `${row.khoiLuong.toLocaleString(
            'vi-VN',
          )} kg`,
      },

      {
        key: 'date',
        label: 'Thu hoạch',

        render: (row) =>
          row.ngayThuHoach,
      },

      {
        key: 'status',
        label: 'Trạng thái',

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
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
          }}
        >
          Tổng quan hệ thống
        </Typography>

        <Typography
          sx={{
            mt: 0.5,

            color:
              'text.secondary',
          }}
        >
          Theo dõi dữ liệu
          truy xuất nguồn gốc
          nông sản từ MockData.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',

            sm: 'repeat(2, 1fr)',

            xl: 'repeat(4, 1fr)',
          },

          gap: 2,

          mb: 3,
        }}
      >
        <StatCard
          title="Đơn vị"
          value={donVis.length}
          description="Đơn vị tham gia hệ thống"
          icon={
            <ApartmentRounded />
          }
          iconBg="#E8F5E9"
          iconColor="#19713A"
        />

        <StatCard
          title="Người dùng"
          value={
            nguoiDungs.length
          }
          description="Tài khoản đang quản lý"
          icon={
            <PeopleAltRounded />
          }
          iconBg="#E3F2FD"
          iconColor="#1565C0"
        />

        <StatCard
          title="Lô hàng"
          value={loHangs.length}
          description="Lô hàng trong chuỗi"
          icon={
            <LocalShippingRounded />
          }
          iconBg="#FFF3E0"
          iconColor="#E65100"
        />

        <StatCard
          title="Cảnh báo"
          value={
            canhBaoThuHois.filter(
              (item) =>
                item.trangThai ===
                'Active',
            ).length
          }
          description="Cảnh báo chưa xử lý"
          icon={
            <WarningAmberRounded />
          }
          iconBg="#FFEBEE"
          iconColor="#C62828"
        />
      </Box>

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            xl: '2fr 1fr',
          },

          gap: 2.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              mb: 1.5,

              fontSize: 19,
              fontWeight: 900,
            }}
          >
            Lô hàng gần đây
          </Typography>

          <DataTable
            rows={loHangs.slice(
              0,
              5,
            )}
            columns={columns}
            getRowId={(row) =>
              row.maLoHang
            }
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,

            border: '1px solid',
            borderColor: 'divider',

            borderRadius: 3,
          }}
        >
          <Typography
            sx={{
              mb: 2,

              fontSize: 19,
              fontWeight: 900,
            }}
          >
            Cảnh báo thu hồi
          </Typography>

          {canhBaoThuHois.map(
            (alert) => (
              <Box
                key={
                  alert.maCanhBao
                }
                sx={{
                  p: 1.5,
                  mb: 1.3,

                  borderRadius: 2,

                  bgcolor:
                    '#FFF8F8',

                  border:
                    '1px solid #FFCDD2',
                }}
              >
                <Box
                  sx={{
                    display:
                      'flex',

                    justifyContent:
                      'space-between',

                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{ fontWeight: 800 }}
                  >
                    LH-
                    {
                      alert.maLoHang
                    }
                  </Typography>

                  <StatusChip
                    status={
                      alert.mucDoNghiemTrong
                    }
                  />
                </Box>

                <Typography
                  sx={{
                    mt: 1,

                    color:
                      'text.secondary',

                    fontSize: 13,
                  }}
                >
                  {alert.lyDo}
                </Typography>
              </Box>
            ),
          )}
        </Paper>
      </Box>
    </Box>
  )
}