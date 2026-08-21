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

import { useAuthStore } from '@/features/auth/auth.store'

export function AdminInspectionsPage() {
  const currentUser = useAuthStore((s) => s.user)
  const isOrgAdmin = currentUser?.role === 'ORGADMIN'
  const orgId = currentUser?.organizationId

  const inspections = useAdminInspections()
  const batches = useAdminBatches()
  const users = useAdminUsers()
  const crud = useInspectionCrud()

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<AdminInspection | null>(null)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const availableBatches = useMemo(() => {
    let list = batches.data ?? []
    if (isOrgAdmin && orgId) {
      list = list.filter((b) => b.currentOrganizationId === orgId)
    }
    return list
  }, [batches.data, isOrgAdmin, orgId])

  const inspectors = useMemo(() => {
    let list = (users.data ?? []).filter(
      (user) => user.role?.trim().toUpperCase() === 'INSPECTOR',
    )
    if (isOrgAdmin && orgId) {
      list = list.filter((user) => user.organizationId === orgId)
    }
    return list
  }, [users.data, isOrgAdmin, orgId])

  const data = useMemo(() => {
    let list = inspections.data ?? []
    if (isOrgAdmin && orgId) {
      list = list.filter((ins) => availableBatches.some((b) => b.id === ins.batchId) || inspectors.some((u) => u.id === ins.inspectorId))
    }
    return list
  }, [inspections.data, isOrgAdmin, orgId, availableBatches, inspectors])

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
                batchId: '',
                inspectorId: '',
                result: '',
                notes: '',
              }
        }
        error={actionError}
        fields={[
          {
            name: 'batchId',
            label: 'Lô hàng',
            type: 'select',
            required: true,
            options: availableBatches.map(item => ({
              value: item.id,
              label: item.batchCode,
            })),
          },
          {
            name: 'inspectorId',
            label: 'Kiểm định viên',
            type: 'select',
            required: true,
            options: inspectors.map(item => ({
              value: item.id,
              label: item.fullName ?? item.email,
            })),
          },
          {
            name: 'result',
            label: 'Kết quả',
            type: 'select',
            required: true,
            options: [
              { value: 'PASS', label: 'PASS (Đạt)' },
              { value: 'FAIL', label: 'FAIL (Không đạt)' },
              { value: 'PENDING', label: 'PENDING (Chờ)' },
            ],
          },
          {
            name: 'notes',
            label: 'Ghi chú',
            type: 'multiline',
          },
        ]}
        onClose={() => {
          setActionError('')
          setOpen(false)
          setEditing(null)
        }}
        onSave={values => void save(values)}
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