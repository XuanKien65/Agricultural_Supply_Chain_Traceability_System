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
  type: '',
  status: '',
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

  const [actionError, setActionError] = useState('')

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
    try {
      setActionError('')

      const name = String(values.name || '').trim()
      const type = String(values.type || '').trim()
      const status = String(values.status || '').trim()

      if (!name) {
        setActionError('Vui lòng nhập Tên tổ chức.')
        return
      }

      if (!type) {
        setActionError('Vui lòng chọn Loại tổ chức.')
        return
      }

      if (!status) {
        setActionError('Vui lòng chọn Trạng thái tổ chức.')
        return
      }

      const payload: AdminOrganizationPayload = {
        name,
        type,
        status,
      }

      if (editing) {
        await crud.update.mutateAsync({
          id: editing.id,
          payload,
        })

        setMessage('Đã cập nhật tổ chức.')
      } else {
        await crud.create.mutateAsync(payload)
        setMessage('Đã thêm tổ chức mới.')
      }

      setOpen(false)
      setEditing(null)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Không thể lưu tổ chức.'
      setActionError(errMsg)
    }
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
        title="Quản lý Tổ chức & Tác nhân Chuỗi cung ứng"
        search={search}
        onSearchChange={setSearch}
        action={
          <Button
            variant="contained"
            startIcon={<AddRounded />}
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
        error={actionError}
        fields={[
          {
            name: 'name',
            label: 'Tên tổ chức',
            required: true,
          },
          {
            name: 'type',
            label: 'Loại tổ chức',
            type: 'select',
            required: true,
            options: [
              { value: 'FARM', label: 'FARM (Nông trại)' },
              { value: 'PROCESSOR', label: 'PROCESSOR (Nhà chế biến)' },
              { value: 'DISTRIBUTOR', label: 'DISTRIBUTOR (Nhà phân phối)' },
              { value: 'RETAILER', label: 'RETAILER (Đơn vị bán lẻ)' },
            ],
          },
          {
            name: 'status',
            label: 'Trạng thái',
            type: 'select',
            required: true,
            options: [
              { value: 'ACTIVE', label: 'ACTIVE (Hoạt động)' },
              { value: 'INACTIVE', label: 'INACTIVE (Tạm ngưng)' },
              { value: 'SUSPENDED', label: 'SUSPENDED (Đang khóa)' },
            ],
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