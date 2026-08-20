import {
  useMemo,
  useState,
} from 'react'

import {
  AddRounded,
} from '@mui/icons-material'

import {
  Alert,
  Button,
  Snackbar,
  Typography,
} from '@mui/material'

import {
  DataTable,
  type DataTableColumn,
} from '@/components/ui/DataTable'

import {
  PageHeader,
} from '@/components/ui/PageHeader'

import {
  PageLoader,
} from '@/components/ui/PageLoader'

import {
  StatusChip,
} from '@/components/ui/StatusChip'

import {
  formatDateTime,
} from '@/utils/format'

import {
  useAdminBatches,
  useAdminInspections,
  useAdminUsers,
  useInspectionCrud,
} from '../admin.queries'

import type {
  AdminInspection,
  AdminInspectionPayload,
} from '../admin.types'

import {
  AdminFormDialog,
  type FormValues,
} from '../components/AdminFormDialog'

import {
  AdminRowActions,
} from '../components/AdminRowActions'

export function AdminInspectionsPage() {
  const inspections =
    useAdminInspections()

  const batches =
    useAdminBatches()

  const users =
    useAdminUsers()

  const crud =
    useInspectionCrud()

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    editing,
    setEditing,
  ] =
    useState<AdminInspection | null>(
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
    inspections.data ?? []

  // Chỉ user có role INSPECTOR mới được tạo kiểm định.
  const inspectors =
    (users.data ?? []).filter(
      user =>
        user.role
          ?.trim()
          .toUpperCase() ===
        'INSPECTOR',
    )

  const rows =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase()

      if (!q) {
        return data
      }

      return data.filter(
        item =>
          `${
            item.batchCode ??
            ''
          } ${
            item.inspectorName ??
            ''
          } ${
            item.result ??
            ''
          } ${
            item.notes ??
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
    inspections.isLoading ||
    batches.isLoading ||
    users.isLoading
  ) {
    return (
      <PageLoader
        label="Đang tải kiểm định..."
      />
    )
  }

  const queryError =
    inspections.error ??
    batches.error ??
    users.error

  if (queryError) {
    return (
      <Alert severity="error">
        {queryError instanceof Error
          ? queryError.message
          : 'Không tải được dữ liệu kiểm định.'}
      </Alert>
    )
  }

  function openCreateDialog() {
    setActionError('')

    if (
      (batches.data ?? [])
        .length === 0
    ) {
      setActionError(
        'Chưa có lô hàng. Hãy tạo lô hàng trước.',
      )

      return
    }

    if (
      inspectors.length === 0
    ) {
      setActionError(
        'Chưa có người dùng có vai trò INSPECTOR. Hãy vào Người dùng và tạo một tài khoản INSPECTOR trước.',
      )

      return
    }

    setEditing(null)
    setOpen(true)
  }

  async function save(
    values: FormValues,
  ) {
    try {
      setActionError('')

      const batchId =
        Number(
          values.batchId,
        )

      const inspectorId =
        Number(
          values.inspectorId,
        )

      const result =
        String(
          values.result ?? '',
        )
          .trim()
          .toUpperCase()

      const notes =
        String(
          values.notes ?? '',
        ).trim()

      if (
        !Number.isInteger(
          batchId,
        ) ||
        batchId <= 0
      ) {
        setActionError(
          'Bạn phải chọn lô hàng.',
        )

        return
      }

      if (
        !Number.isInteger(
          inspectorId,
        ) ||
        inspectorId <= 0
      ) {
        setActionError(
          'Bạn phải chọn kiểm định viên.',
        )

        return
      }

      const selectedInspector =
        inspectors.find(
          item =>
            item.id ===
            inspectorId,
        )

      if (!selectedInspector) {
        setActionError(
          'Người được chọn không có vai trò INSPECTOR.',
        )

        return
      }

      if (
        ![
          'PASS',
          'FAIL',
          'PENDING',
        ].includes(result)
      ) {
        setActionError(
          'Kết quả phải là PASS, FAIL hoặc PENDING.',
        )

        return
      }

      const payload:
        AdminInspectionPayload =
        {
          batchId,

          inspectorId,

          result,

          notes:
            notes || null,
        }

      if (editing) {
        await crud.update.mutateAsync(
          {
            id: editing.id,
            payload,
          },
        )

        setMessage(
          'Đã cập nhật kiểm định.',
        )
      } else {
        await crud.create.mutateAsync(
          payload,
        )

        setMessage(
          'Đã thêm kiểm định.',
        )
      }

      setOpen(false)
      setEditing(null)
    } catch (error) {
      console.error(
        'Lỗi lưu kiểm định:',
        error,
      )

      setActionError(
        error instanceof Error
          ? error.message
          : 'Không thể lưu kiểm định.',
      )
    }
  }

  async function remove(
    row: AdminInspection,
  ) {
    if (
      !window.confirm(
        `Xóa kiểm định KD-${row.id}?`,
      )
    ) {
      return
    }

    try {
      setActionError('')

      await crud.remove.mutateAsync(
        row.id,
      )

      setMessage(
        'Đã xóa kiểm định.',
      )
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Không thể xóa kiểm định.',
      )
    }
  }

  const columns:
    DataTableColumn<AdminInspection>[] =
    [
      {
        key: 'id',
        label: 'Mã',

        render: row => (
          <Typography
            sx={{
              fontWeight: 800,
            }}
          >
            KD-{row.id}
          </Typography>
        ),
      },

      {
        key: 'batch',
        label: 'Lô hàng',

        render: row =>
          row.batchCode ??
          `#${row.batchId}`,
      },

      {
        key: 'inspector',
        label:
          'Kiểm định viên',
        minWidth: 200,

        render: row =>
          row.inspectorName ??
          `#${row.inspectorId}`,
      },

      {
        key: 'result',
        label: 'Kết quả',

        render: row =>
          row.result ? (
            <StatusChip
              status={
                row.result
              }
            />
          ) : (
            '-'
          ),
      },

      {
        key: 'notes',
        label: 'Ghi chú',
        minWidth: 220,

        render: row =>
          row.notes ?? '-',
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
              setActionError('')
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

  return (
    <>
      <PageHeader
        title="Quản lý kiểm định"
        description="Chỉ Kiểm định viên (Inspector) mới có thể tạo kết quả kiểm định."
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
            onClick={
              openCreateDialog
            }
          >
            Thêm kiểm định
          </Button>
        }
      />

      {actionError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
          onClose={() =>
            setActionError('')
          }
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
            ? 'Sửa kiểm định'
            : 'Thêm kiểm định'
        }
        saving={
          crud.create.isPending ||
          crud.update.isPending
        }
        initial={
          editing
            ? {
                batchId:
                  editing.batchId,

                inspectorId:
                  editing.inspectorId,

                result:
                  editing.result ??
                  'PASS',

                notes:
                  editing.notes ??
                  '',
              }
            : {
                batchId:
                  batches
                    .data?.[0]
                    ?.id ?? '',

                inspectorId:
                  inspectors[0]
                    ?.id ?? '',

                result: 'PASS',

                notes: '',
              }
        }
        fields={[
          {
            name: 'batchId',
            label: 'Lô hàng',
            type: 'select',
            required: true,

            options: (
              batches.data ??
              []
            ).map(
              item => ({
                value:
                  item.id,

                label:
                  item.batchCode,
              }),
            ),
          },

          {
            name:
              'inspectorId',

            label:
              'Kiểm định viên',

            type: 'select',

            required: true,

            // QUAN TRỌNG:
            // chỉ hiện INSPECTOR
            options:
              inspectors.map(
                item => ({
                  value:
                    item.id,

                  label:
                    item.fullName ??
                    item.email,
                }),
              ),
          },

          {
            name: 'result',
            label: 'Kết quả',
            type: 'select',
            required: true,

            options: [
              {
                value: 'PASS',
                label: 'PASS',
              },

              {
                value: 'FAIL',
                label: 'FAIL',
              },

              {
                value:
                  'PENDING',

                label:
                  'PENDING',
              },
            ],
          },

          {
            name: 'notes',
            label: 'Ghi chú',
            type: 'multiline',
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