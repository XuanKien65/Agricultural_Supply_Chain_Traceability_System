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

import { PageHeader } from '@/components/ui/PageHeader'
import { PageLoader } from '@/components/ui/PageLoader'
import { StatusChip } from '@/components/ui/StatusChip'
import { formatDateTime } from '@/utils/format'

import {
  useAdminBatches,
  useAdminRecalls,
  useAdminUsers,
  useRecallCrud,
} from '../admin.queries'

import type {
  AdminRecall,
  AdminRecallPayload,
} from '../admin.types'

import {
  AdminFormDialog,
  type FormValues,
} from '../components/AdminFormDialog'

import { AdminRowActions } from '../components/AdminRowActions'

import { useAuthStore } from '@/features/auth/auth.store'

export function AdminRecallsPage() {
  const currentUser = useAuthStore((s) => s.user)
  const isOrgAdmin = currentUser?.role === 'ORGADMIN'
  const orgId = currentUser?.organizationId

  const recalls = useAdminRecalls()
  const batches = useAdminBatches()
  const users = useAdminUsers()
  const crud = useRecallCrud()

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<AdminRecall | null>(null)
  const [actionError, setActionError] = useState('')
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

  const availableBatches = useMemo(() => {
    let list = batches.data ?? []
    if (isOrgAdmin && orgId) {
      list = list.filter((b) => b.currentOrganizationId === orgId)
    }
    return list
  }, [batches.data, isOrgAdmin, orgId])

  const availableUsers = useMemo(() => {
    let list = users.data ?? []
    if (isOrgAdmin && orgId) {
      list = list.filter((u) => u.organizationId === orgId)
    }
    return list
  }, [users.data, isOrgAdmin, orgId])

  const data =
    recalls.data ?? []

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
          `${
            item.batchCode ??
            ''
          } ${
            item.reason ?? ''
          } ${
            item.severity ??
            ''
          } ${
            item.createdByName ??
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
    recalls.isLoading ||
    batches.isLoading ||
    users.isLoading
  ) {
    return (
      <PageLoader label="Đang tải thu hồi..." />
    )
  }

  const error =
    recalls.error ??
    batches.error ??
    users.error

  if (error) {
    return (
      <Alert severity="error">
        {error instanceof Error
          ? error.message
          : 'Không tải được thu hồi.'}
      </Alert>
    )
  }

  async function save(
    values: FormValues,
  ) {
    try {
      setActionError('')

      const batchId = Number(values.batchId)
      const reason = String(values.reason || '').trim()
      const severity = String(values.severity || '').trim()
      const createdBy = Number(values.createdBy)

      if (!values.batchId || Number.isNaN(batchId) || batchId <= 0) {
        setActionError('Vui lòng chọn Lô hàng cần thu hồi.')
        return
      }

      if (!reason) {
        setActionError('Vui lòng nhập Lý do thu hồi.')
        return
      }

      if (!severity) {
        setActionError('Vui lòng chọn Mức độ thu hồi.')
        return
      }

      if (!values.createdBy || Number.isNaN(createdBy) || createdBy <= 0) {
        setActionError('Vui lòng chọn Người tạo lệnh thu hồi.')
        return
      }

      const payload: AdminRecallPayload = {
        batchId,
        reason,
        severity,
        createdBy,
      }

      if (editing) {
        await crud.update.mutateAsync({
          id: editing.id,
          payload,
        })
        setMessage('Đã cập nhật thu hồi.')
      } else {
        await crud.create.mutateAsync(payload)
        setMessage('Đã tạo lệnh thu hồi sản phẩm.')
      }

      setOpen(false)
      setEditing(null)
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Không thể tạo lệnh thu hồi.'
      setActionError(errMsg)
    }
  }

  async function remove(
    row: AdminRecall,
  ) {
    if (
      !window.confirm(
        `Xóa thu hồi RC-${row.id}?`,
      )
    ) {
      return
    }

    await crud.remove.mutateAsync(
      row.id,
    )

    setMessage(
      'Đã xóa thu hồi.',
    )
  }

  const columns:
    DataTableColumn<AdminRecall>[] =
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
            RC-{row.id}
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
        key: 'severity',
        label: 'Mức độ',

        render: row =>
          row.severity ? (
            <StatusChip
              status={
                row.severity
              }
            />
          ) : (
            '-'
          ),
      },

      {
        key: 'reason',
        label: 'Lý do',
        minWidth: 260,

        render: row =>
          row.reason ?? '-',
      },

      {
        key: 'creator',
        label: 'Người tạo',

        render: row =>
          row.createdByName ??
          `#${row.createdBy}`,
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

  return (
    <>
      <PageHeader
        title="Cảnh báo & Thu hồi sản phẩm"
        search={search}
        onSearchChange={setSearch}
        action={
          <Button
            variant="contained"
            color="error"
            startIcon={<AddRounded />}
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            Tạo lệnh thu hồi
          </Button>
        }
      />

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
            ? 'Sửa thu hồi'
            : 'Tạo thu hồi'
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

                reason:
                  editing.reason ??
                  '',

                severity:
                  editing.severity ??
                  'HIGH',

                createdBy:
                  editing.createdBy,
              }
            : {
                batchId: '',
                reason: '',
                severity: '',
                createdBy: '',
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
            name: 'reason',
            label: 'Lý do thu hồi',
            type: 'multiline',
            required: true,
          },
          {
            name: 'severity',
            label: 'Mức độ',
            type: 'select',
            required: true,
            options: [
              'LOW',
              'MEDIUM',
              'HIGH',
              'CRITICAL',
            ].map(value => ({
              value,
              label: value,
            })),
          },
          {
            name: 'createdBy',
            label: 'Người tạo',
            type: 'select',
            required: true,
            options: availableUsers.map(item => ({
              value: item.id,
              label: item.fullName ?? item.email,
            })),
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