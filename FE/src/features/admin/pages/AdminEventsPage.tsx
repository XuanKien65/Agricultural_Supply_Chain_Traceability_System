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

export function AdminEventsPage() {
  const events =
    useAdminEvents()

  const batches =
    useAdminBatches()

  const organizations =
    useAdminOrganizations()

  const users =
    useAdminUsers()

  const create =
    useCreateAdminEvent()

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    open,
    setOpen,
  ] = useState(false)

  const [
    message,
    setMessage,
  ] = useState('')

  const data =
    events.data ?? []

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
          `${item.eventType} ${
            item.batchCode ?? ''
          } ${
            item.organizationName ??
            ''
          } ${
            item.userName ?? ''
          } ${
            item.location ??
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
    events.isLoading ||
    batches.isLoading ||
    organizations.isLoading ||
    users.isLoading
  ) {
    return (
      <PageLoader label="Đang tải sự kiện..." />
    )
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
    const payload:
      AdminEventPayload =
      {
        batchId:
          Number(
            values.batchId,
          ),

        eventType:
          String(
            values.eventType,
          ),

        organizationId:
          Number(
            values.organizationId,
          ),

        userId:
          Number(
            values.userId,
          ),

        eventData:
          String(
            values.eventData ||
              '',
          ) || null,

        location:
          String(
            values.location ||
              '',
          ) || null,

        previousHash:
          String(
            values.previousHash ||
              '',
          ) || null,

        currentHash:
          String(
            values.currentHash ||
              '',
          ) || null,
      }

    await create.mutateAsync(
      payload,
    )

    setMessage(
      'Đã ghi sự kiện mới.',
    )

    setOpen(false)
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
        title="Chuỗi sự kiện"
        description="SupplyChainEvents chỉ thêm mới và xem lịch sử."
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
            onClick={() =>
              setOpen(true)
            }
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
          batchId:
            batches
              .data?.[0]
              ?.id ?? '',

          eventType:
            'HARVEST',

          organizationId:
            organizations
              .data?.[0]
              ?.id ?? '',

          userId:
            users
              .data?.[0]
              ?.id ?? '',

          eventData: '',
          location: '',
          previousHash: '',
          currentHash: '',
        }}
        fields={[
          {
            name: 'batchId',
            label: 'Lô hàng',
            type: 'select',
            required: true,

            options: (
              batches.data ??
              []
            ).map(item => ({
              value: item.id,
              label:
                item.batchCode,
            })),
          },

          {
            name: 'eventType',
            label:
              'Loại sự kiện',
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
            ].map(value => ({
              value,
              label: value,
            })),
          },

          {
            name:
              'organizationId',
            label: 'Tổ chức',
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
            name: 'userId',
            label:
              'Người thực hiện',
            type: 'select',
            required: true,

            options: (
              users.data ?? []
            ).map(item => ({
              value: item.id,

              label:
                item.fullName ??
                item.email,
            })),
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