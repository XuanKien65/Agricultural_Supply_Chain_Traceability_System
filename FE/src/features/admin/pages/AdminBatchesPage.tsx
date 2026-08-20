import {
  useMemo,
  useState,
} from 'react'

import {
  AddRounded,
  QrCode2Rounded,
} from '@mui/icons-material'

import {
  Alert,
  Box,
  Button,
  Snackbar,
  Typography,
} from '@mui/material'

import {
  DataTable,
  type DataTableColumn,
} from '@/components/ui/DataTable'

import { PageHeader } from '@/components/ui/PageHeader'
import { PageLoader } from '@/components/ui/PageLoader'

import {
  formatDateTime,
  formatNumber,
} from '@/utils/format'

import {
  useAdminBatches,
  useAdminOrganizations,
  useAdminProducts,
  useBatchCrud,
} from '../admin.queries'

import type {
  AdminBatch,
  AdminBatchPayload,
} from '../admin.types'

import {
  AdminFormDialog,
  type FormValues,
} from '../components/AdminFormDialog'

import { AdminRowActions } from '../components/AdminRowActions'

export function AdminBatchesPage() {
  const batches =
    useAdminBatches()

  const products =
    useAdminProducts()

  const organizations =
    useAdminOrganizations()

  const crud =
    useBatchCrud()

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    editing,
    setEditing,
  ] =
    useState<AdminBatch | null>(
      null,
    )

  const [
    open,
    setOpen,
  ] = useState(false)

  const [
    message,
    setMessage,
  ] = useState('')

  const [
    actionError,
    setActionError,
  ] = useState('')

  const data =
    batches.data ?? []

  const rows =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase()

      if (!q)
        return data

      return data.filter(
        item =>
          `${item.batchCode} ${
            item.productName ??
            ''
          } ${
            item.currentOrganizationName ??
            ''
          }`
            .toLowerCase()
            .includes(q),
      )
    }, [
      data,
      search,
    ])

  if (
    batches.isLoading ||
    products.isLoading ||
    organizations.isLoading
  ) {
    return (
      <PageLoader label="Đang tải lô hàng..." />
    )
  }

  const error =
    batches.error ??
    products.error ??
    organizations.error

  if (error) {
    return (
      <Alert severity="error">
        {error instanceof Error
          ? error.message
          : 'Không tải được lô hàng.'}
      </Alert>
    )
  }

  async function save(
    values: FormValues,
  ) {
    try {
      setActionError('')

      const productId =
        Number(values.productId)

      const batchCode =
        String(
          values.batchCode ?? '',
        ).trim()

      const quantity =
        Number(values.quantity)

      const currentOrganizationId =
        values.currentOrganizationId === '' ||
        values.currentOrganizationId === null
          ? null
          : Number(
              values.currentOrganizationId,
            )

      if (!Number.isInteger(productId) || productId <= 0) {
        setActionError('Bạn phải chọn sản phẩm.')
        return
      }

      if (!batchCode) {
        setActionError('Mã lô không được để trống.')
        return
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        setActionError('Số lượng phải lớn hơn 0.')
        return
      }

      if (
        currentOrganizationId === null ||
        !Number.isInteger(currentOrganizationId) ||
        currentOrganizationId <= 0
      ) {
        setActionError('Bạn phải chọn đơn vị hiện tại.')
        return
      }

      const payload: AdminBatchPayload = {
        productId,
        batchCode,
        quantity,
        currentOrganizationId,

        parentBatchId:
          values.parentBatchId === '' ||
          values.parentBatchId === null
            ? null
            : Number(values.parentBatchId),

        rootBatchId:
          values.rootBatchId === '' ||
          values.rootBatchId === null
            ? null
            : Number(values.rootBatchId),

        // Nếu không nhập QR thì dùng luôn mã lô.
        // Điều này tương thích schema cũ nơi QrCode là NOT NULL + UNIQUE.
        qrCode:
          String(values.qrCode ?? '').trim() ||
          batchCode,
      }

      if (editing) {
        await crud.update.mutateAsync({
          id: editing.id,
          payload,
        })

        setMessage('Đã cập nhật lô hàng.')
      } else {
        await crud.create.mutateAsync(payload)
        setMessage('Đã thêm lô hàng mới.')
      }

      setOpen(false)
      setEditing(null)
    } catch (error) {
      console.error('Lỗi lưu lô hàng:', error)

      setActionError(
        error instanceof Error
          ? error.message
          : 'Không thể lưu lô hàng.',
      )
    }
  }

  async function remove(
    row: AdminBatch,
  ) {
    if (
      !window.confirm(
        `Xóa lô ${row.batchCode}?`,
      )
    ) {
      return
    }

    await crud.remove.mutateAsync(
      row.id,
    )

    setMessage(
      'Đã xóa lô hàng.',
    )
  }

  const columns:
    DataTableColumn<AdminBatch>[] =
    [
      {
        key: 'batch',
        label: 'Lô hàng',
        minWidth: 210,

        render: row => (
          <Box
            sx={{
              display:
                'flex',
              gap: 1,
              alignItems:
                'center',
            }}
          >
            <QrCode2Rounded />

            <Box>
              <Typography
                sx={{
                  fontWeight:
                    800,
                }}
              >
                {
                  row.batchCode
                }
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  color:
                    'text.secondary',
                }}
              >
                {row.qrCode ??
                  '-'}
              </Typography>
            </Box>
          </Box>
        ),
      },

      {
        key: 'product',
        label: 'Sản phẩm',

        render: row =>
          row.productName ??
          `#${row.productId}`,
      },

      {
        key: 'org',
        label:
          'Đơn vị hiện tại',
        minWidth: 200,

        render: row =>
          row.currentOrganizationName ??
          '-',
      },

      {
        key: 'qty',
        label: 'Số lượng',
        align: 'right',

        render: row =>
          formatNumber(
            row.quantity,
          ),
      },

      {
        key: 'date',
        label: 'Ngày tạo',

        render: row =>
          formatDateTime(
            row.createdAt,
          ),
      },

      {
        key: 'actions',
        label: 'Thao tác',
        align: 'right',

        render: row => (
          <AdminRowActions
            deleting={
              crud.remove.isPending
            }
            onEdit={() => {
              setEditing(row)
              setOpen(true)
            }}
            onDelete={() =>
              void remove(row)
            }
          />
        ),
      },
    ]

  const batchOptions =
    data
      .filter(
        item =>
          !editing ||
          item.id !==
            editing.id,
      )
      .map(item => ({
        value: item.id,
        label:
          item.batchCode,
      }))

  return (
    <>
      <PageHeader
        title="Quản lý lô hàng"
        description="Quản lý toàn bộ lô hàng trong hệ thống."
        search={search}
        onSearchChange={
          setSearch
        }
        action={
          <Button
            variant="contained"
            startIcon={
              <AddRounded />
            }
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            Thêm lô hàng
          </Button>
        }
      />

      {actionError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setActionError('')}
        >
          {actionError}
        </Alert>
      )}

      <DataTable
        rows={rows}
        columns={columns}
        getRowId={row =>
          row.id
        }
      />

      <AdminFormDialog
        open={open}
        title={
          editing
            ? 'Sửa lô hàng'
            : 'Thêm lô hàng'
        }
        saving={
          crud.create.isPending ||
          crud.update.isPending
        }
        initial={
          editing
            ? {
                productId:
                  editing.productId,

                batchCode:
                  editing.batchCode,

                quantity:
                  editing.quantity,

                currentOrganizationId:
                  editing.currentOrganizationId,

                parentBatchId:
                  editing.parentBatchId,

                rootBatchId:
                  editing.rootBatchId,

                qrCode:
                  editing.qrCode ??
                  '',
              }
            : {
                productId:
                  products
                    .data?.[0]
                    ?.id ?? '',

                batchCode: '',

                quantity: 1,

                currentOrganizationId:
                  organizations
                    .data?.[0]
                    ?.id ?? null,

                parentBatchId:
                  null,

                rootBatchId:
                  null,

                qrCode: '',
              }
        }
        fields={[
          {
            name: 'productId',
            label: 'Sản phẩm',
            type: 'select',
            required: true,

            options: (
              products.data ??
              []
            ).map(item => ({
              value: item.id,
              label:
                item.name ??
                `#${item.id}`,
            })),
          },

          {
            name: 'batchCode',
            label: 'Mã lô',
            required: true,
          },

          {
            name: 'quantity',
            label: 'Số lượng',
            type: 'number',
            required: true,
          },

          {
            name:
              'currentOrganizationId',
            label:
              'Đơn vị hiện tại',
            type: 'select',
            required: true,

            options: (
              organizations.data ??
              []
            ).map(item => ({
              value: item.id,
              label: item.name,
            })),
          },

          {
            name:
              'parentBatchId',
            label: 'Lô cha',
            type: 'select',
            options:
              batchOptions,
          },

          {
            name:
              'rootBatchId',
            label: 'Lô gốc',
            type: 'select',
            options:
              batchOptions,
          },

          {
            name: 'qrCode',
            label:
              'QR Code / URL',
          },
        ]}
        onClose={() => {
          setOpen(false)
          setEditing(null)
        }}
        onSave={values =>
          void save(values)
        }
      />

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={2200}
        message={message}
        onClose={() =>
          setMessage('')
        }
      />
    </>
  )
}