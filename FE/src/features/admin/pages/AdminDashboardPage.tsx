import {
  ApartmentRounded,
  Inventory2Rounded,
  PeopleAltRounded,
  WarningAmberRounded,
} from '@mui/icons-material'

import {
  Alert,
  Box,
  Typography,
} from '@mui/material'

import {
  DataTable,
  type DataTableColumn,
} from '@/components/ui/DataTable'

import { PageHeader } from '@/components/ui/PageHeader'
import { PageLoader } from '@/components/ui/PageLoader'
import { StatCard } from '@/components/ui/StatCard'

import {
  formatDateTime,
  formatNumber,
} from '@/utils/format'

import {
  useAdminDashboard,
} from '../admin.queries'

import type {
  AdminBatch,
} from '../admin.types'

export function AdminDashboardPage() {
  const {
    data,
    isLoading,
    error,
  } = useAdminDashboard()

  if (isLoading) {
    return (
      <PageLoader label="Đang tải dữ liệu Admin..." />
    )
  }

  if (error || !data) {
    return (
      <Alert severity="error">
        {error instanceof Error
          ? error.message
          : 'Không tải được dữ liệu Admin.'}
      </Alert>
    )
  }

  const columns:
    DataTableColumn<AdminBatch>[] = [
      {
        key: 'batch',
        label: 'Mã lô',
        render: row => (
          <Typography
            sx={{ fontWeight: 800 }}
          >
            {row.batchCode}
          </Typography>
        ),
      },
      {
        key: 'product',
        label: 'Sản phẩm',
        render: row =>
          row.productName ?? '-',
      },
      {
        key: 'organization',
        label: 'Đơn vị hiện tại',
        minWidth: 220,
        render: row =>
          row.currentOrganizationName ??
          '-',
      },
      {
        key: 'quantity',
        label: 'Số lượng',
        align: 'right',
        render: row =>
          formatNumber(
            row.quantity,
          ),
      },
      {
        key: 'createdAt',
        label: 'Ngày tạo',
        render: row =>
          formatDateTime(
            row.createdAt,
          ),
      },
    ]

  return (
    <>
      <PageHeader
        title="Tổng quan hệ thống"
        description="Tổng quan số liệu toàn hệ thống."
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            xl: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          title="Tổ chức"
          value={
            data.organizationCount
          }
          description="Organizations"
          icon={
            <ApartmentRounded />
          }
          iconBg="#E8F5E9"
          iconColor="#19713A"
        />

        <StatCard
          title="Người dùng"
          value={data.userCount}
          description="Users"
          icon={
            <PeopleAltRounded />
          }
          iconBg="#E3F2FD"
          iconColor="#1565C0"
        />

        <StatCard
          title="Lô hàng"
          value={data.batchCount}
          description="Batches"
          icon={
            <Inventory2Rounded />
          }
          iconBg="#FFF3E0"
          iconColor="#E65100"
        />

        <StatCard
          title="Thu hồi"
          value={data.recallCount}
          description="Recalls"
          icon={
            <WarningAmberRounded />
          }
          iconBg="#FFEBEE"
          iconColor="#C62828"
        />
      </Box>

      <Typography
        sx={{
          mb: 1.5,
          fontSize: 19,
          fontWeight: 900,
        }}
      >
        Lô hàng mới nhất
      </Typography>

      <DataTable
        rows={
          data.recentBatches
        }
        columns={columns}
        getRowId={row =>
          row.id
        }
      />
    </>
  )
}