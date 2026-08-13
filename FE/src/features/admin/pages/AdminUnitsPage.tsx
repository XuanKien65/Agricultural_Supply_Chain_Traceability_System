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
import { formatDate } from '@/utils/format'

import {
  useAdminOrganizations,
  useOrganizationCrud,
} from '../admin.queries'

import type {
  AdminOrganization,
  AdminOrganizationPayload,
} from '../admin.types'

import {
  AdminFormDialog,
  type FormValues,
} from '../components/AdminFormDialog'

import { AdminRowActions } from '../components/AdminRowActions'

const empty = {
  name: '',
  type: 'FARM',
  status: 'ACTIVE',
}

export function AdminUnitsPage() {
  const {
    data = [],
    isLoading,
    error,
  } = useAdminOrganizations()

  const crud =
    useOrganizationCrud()

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    editing,
    setEditing,
  ] =
    useState<AdminOrganization | null>(
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
          `${item.name} ${item.type} ${item.status}`
            .toLowerCase()
            .includes(q),
      )
    }, [
      data,
      search,
    ])

  if (isLoading) {
    return (
      <PageLoader label="Đang tải tổ chức..." />
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        {error instanceof Error
          ? error.message
          : 'Không tải được tổ chức.'}
      </Alert>
    )
  }

  async function save(
    values: FormValues,
  ) {
    const payload:
      AdminOrganizationPayload =
      {
        name:
          String(
            values.name,
          ),

        type:
          String(
            values.type,
          ),

        status:
          String(
            values.status,
          ),
      }

    if (editing) {
      await crud.update.mutateAsync({
        id: editing.id,
        payload,
      })

      setMessage(
        'Đã cập nhật tổ chức.',
      )
    } else {
      await crud.create.mutateAsync(
        payload,
      )

      setMessage(
        'Đã thêm tổ chức.',
      )
    }

    setOpen(false)
    setEditing(null)
  }

  async function remove(
    row: AdminOrganization,
  ) {
    if (
      !window.confirm(
        `Vô hiệu hóa tổ chức ${row.name}?`,
      )
    ) {
      return
    }

    await crud.remove.mutateAsync(
      row.id,
    )

    setMessage(
      'Đã vô hiệu hóa tổ chức.',
    )
  }

  const columns:
    DataTableColumn<AdminOrganization>[] =
    [
      {
        key: 'name',
        label: 'Tổ chức',
        minWidth: 240,

        render: row => (
          <Typography
            sx={{
              fontWeight: 800,
            }}
          >
            {row.name}
          </Typography>
        ),
      },

      {
        key: 'type',
        label: 'Loại',

        render: row =>
          row.type,
      },

      {
        key: 'status',
        label: 'Trạng thái',

        render: row => (
          <StatusChip
            status={
              row.status
            }
          />
        ),
      },

      {
        key: 'created',
        label: 'Ngày tạo',

        render: row =>
          formatDate(
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
        title="Quản lý tổ chức"
        description="CRUD bảng Organizations."
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
            Thêm tổ chức
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
            ? 'Sửa tổ chức'
            : 'Thêm tổ chức'
        }
        saving={
          crud.create.isPending ||
          crud.update.isPending
        }
        initial={
          editing
            ? {
                name:
                  editing.name,

                type:
                  editing.type,

                status:
                  editing.status,
              }
            : empty
        }
        fields={[
          {
            name: 'name',
            label:
              'Tên tổ chức',
            required: true,
          },

          {
            name: 'type',
            label: 'Loại',
            type: 'select',
            required: true,

            options: [
              'FARM',
              'PROCESSOR',
              'DISTRIBUTOR',
              'RETAILER',
            ].map(value => ({
              value,
              label: value,
            })),
          },

          {
            name: 'status',
            label:
              'Trạng thái',
            type: 'select',
            required: true,

            options: [
              'ACTIVE',
              'INACTIVE',
              'SUSPENDED',
            ].map(value => ({
              value,
              label: value,
            })),
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