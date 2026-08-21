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
import { formatDateTime } from '@/utils/format'

import {
  useAdminBatches,
  useAdminEvents,
  useAdminOrganizations,
  useAdminUsers,
  useCreateAdminEvent,
} from '../admin.queries'

import type {
  AdminEventPayload,
  AdminSupplyChainEvent,
} from '../admin.types'

import {
  AdminFormDialog,
  type FormValues,
} from '../components/AdminFormDialog'

import { useAuthStore } from '@/features/auth/auth.store'

export function AdminEventsPage() {
  const currentUser = useAuthStore((s) => s.user)
  const isOrgAdmin = currentUser?.role === 'ORGADMIN'
  const orgId = currentUser?.organizationId

  const events = useAdminEvents()
  const batches = useAdminBatches()
  const organizations = useAdminOrganizations()
  const users = useAdminUsers()
  const create = useCreateAdminEvent()

  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const rows = useMemo(() => {
    let list = events.data ?? []
    if (isOrgAdmin && orgId) {
      list = list.filter((item) => item.organizationId === orgId)
    }
    const q = search.trim().toLowerCase()
    if (!q) return list

    return list.filter(
      (item) =>
        `${item.eventType ?? ''} ${item.batchCode ?? ''} ${item.organizationName ?? ''} ${item.userName ?? ''} ${item.location ?? ''}`
          .toLowerCase()
          .includes(q),
    )
  }, [events.data, isOrgAdmin, orgId, search])

  const organizationOptions = useMemo(() => {
    let list = organizations.data ?? []
    if (isOrgAdmin && orgId) {
      list = list.filter((o) => o.id === orgId)
    }
    return list.map((item) => ({ value: item.id, label: item.name }))
  }, [organizations.data, isOrgAdmin, orgId])

  const userOptions = useMemo(() => {
    let list = users.data ?? []
    if (isOrgAdmin && orgId) {
      list = list.filter((u) => u.organizationId === orgId)
    }
    return list.map((item) => ({
      value: item.id,
      label: item.fullName ? `${item.fullName} (${item.email})` : item.email,
    }))
  }, [users.data, isOrgAdmin, orgId])

  const batchOptions = useMemo(() => {
    let list = batches.data ?? []
    if (isOrgAdmin && orgId) {
      list = list.filter((b) => b.currentOrganizationId === orgId)
    }
    return list.map((item) => ({ value: item.id, label: item.batchCode }))
  }, [batches.data, isOrgAdmin, orgId])

  if (
    events.isLoading ||
    batches.isLoading ||
    organizations.isLoading ||
    users.isLoading
  ) {
    return <PageLoader label="Đang tải sự kiện chuỗi cung ứng..." />
  }

  const error =
    events.error ??
    batches.error ??
    organizations.error ??
    users.error

  if (error) {
    return (
      <Alert severity="error">
        {error instanceof Error
          ? error.message
          : 'Không tải được sự kiện.'}
      </Alert>
    )
  }

  async function save(
    values: FormValues,
  ) {
    try {
      setActionError('')

      const batchId = Number(values.batchId)
      const eventType = String(values.eventType || '').trim()
      const organizationId = Number(values.organizationId)
      const userId = Number(values.userId)

      if (!values.batchId || Number.isNaN(batchId) || batchId <= 0) {
        setActionError('Vui lòng chọn Lô hàng.')
        return
      }

      if (!eventType) {
        setActionError('Vui lòng chọn Loại sự kiện.')
        return
      }

      if (!values.organizationId || Number.isNaN(organizationId) || organizationId <= 0) {
        setActionError('Vui lòng chọn Tổ chức.')
        return
      }

      if (!values.userId || Number.isNaN(userId) || userId <= 0) {
        setActionError('Vui lòng chọn Người thực hiện.')
        return
      }

      const payload: AdminEventPayload = {
        batchId,
        eventType,
        organizationId,
        userId,
        eventData: String(values.eventData || '').trim() || null,
        location: String(values.location || '').trim() || null,
        previousHash: String(values.previousHash || '').trim() || null,
        currentHash: String(values.currentHash || '').trim() || null,
      }

      await create.mutateAsync(payload)
      setMessage('Đã ghi sự kiện mới.')
      setOpen(false)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Không thể ghi sự kiện.'
      setActionError(errMsg)
    }
  }

  const columns:
    DataTableColumn<AdminSupplyChainEvent>[] =
    [
      {
        key: 'type',
        label: 'Sự kiện',

        render: row => (
          <Typography
            sx={{
              fontWeight: 800,
            }}
          >
            {row.eventType}
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
        key: 'org',
        label: 'Tổ chức',
        minWidth: 180,

        render: row =>
          row.organizationName ??
          `#${row.organizationId}`,
      },

      {
        key: 'user',
        label:
          'Người ghi nhận',
        minWidth: 180,

        render: row =>
          row.userName ??
          `#${row.userId}`,
      },

      {
        key: 'location',
        label: 'Vị trí',

        render: row =>
          row.location ?? '-',
      },

      {
        key: 'date',
        label: 'Thời gian',

        render: row =>
          formatDateTime(
            row.createdAt,
          ),
      },
    ]

  return (
    <>
      <PageHeader
        title="Chuỗi sự kiện chuỗi cung ứng"
        search={search}
        onSearchChange={setSearch}
        action={
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => setOpen(true)}
          >
            Thêm sự kiện
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
        title="Thêm sự kiện"
        saving={
          create.isPending
        }
        initial={{
          batchId: '',
          eventType: '',
          organizationId: isOrgAdmin && orgId ? orgId : '',
          userId: '',
          eventData: '',
          location: '',
          previousHash: '',
          currentHash: '',
        }}
        error={actionError}
        fields={[
          {
            name: 'batchId',
            label: 'Lô hàng',
            type: 'select',
            required: true,
            options: batchOptions,
          },
          {
            name: 'eventType',
            label: 'Loại sự kiện',
            type: 'select',
            required: true,
            options: [
              'HARVEST',
              'PROCESS',
              'PACKAGE',
              'TRANSPORT',
              'INSPECT',
              'RECEIVE',
              'SPLIT',
              'MERGE',
            ].map((value) => ({
              value,
              label: value,
            })),
          },
          {
            name: 'organizationId',
            label: 'Tổ chức',
            type: 'select',
            required: true,
            disabled: isOrgAdmin,
            options: organizationOptions,
          },
          {
            name: 'userId',
            label: 'Người thực hiện',
            type: 'select',
            required: true,
            options: userOptions,
          },

          {
            name: 'eventData',
            label:
              'Dữ liệu sự kiện',
            type: 'multiline',
          },

          {
            name: 'location',
            label: 'Vị trí',
          },

          {
            name:
              'previousHash',
            label:
              'Previous Hash',
          },

          {
            name:
              'currentHash',
            label:
              'Current Hash',
          },
        ]}
        onClose={() =>
          setOpen(false)
        }
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