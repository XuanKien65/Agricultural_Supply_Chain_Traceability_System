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
  useAdminCertificates,
  useAdminInspections,
  useCertificateCrud,
} from '../admin.queries'

import type {
  AdminCertificate,
  AdminCertificatePayload,
} from '../admin.types'

import {
  AdminFormDialog,
  type FormValues,
} from '../components/AdminFormDialog'

import { AdminRowActions } from '../components/AdminRowActions'

import { useAuthStore } from '@/features/auth/auth.store'

export function AdminCertificatesPage() {
  const currentUser = useAuthStore((s) => s.user)
  const isOrgAdmin = currentUser?.role === 'ORGADMIN'
  const orgId = currentUser?.organizationId

  const certificates = useAdminCertificates()
  const batches = useAdminBatches()
  const inspections = useAdminInspections()
  const crud = useCertificateCrud()

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<AdminCertificate | null>(null)
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

  const data =
    certificates.data ?? []

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
            item.certificateType ??
            ''
          } ${
            item.batchCode ??
            ''
          } ${
            item.fileUrl ??
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
    certificates.isLoading ||
    batches.isLoading ||
    inspections.isLoading
  ) {
    return (
      <PageLoader label="Đang tải chứng nhận..." />
    )
  }

  const error =
    certificates.error ??
    batches.error ??
    inspections.error

  if (error) {
    return (
      <Alert severity="error">
        {error instanceof Error
          ? error.message
          : 'Không tải được chứng nhận.'}
      </Alert>
    )
  }

  async function save(
    values: FormValues,
  ) {
    try {
      setActionError('')

      const batchId = Number(values.batchId)
      const certificateType = String(values.certificateType || '').trim()
      const fileUrl = String(values.fileUrl || '').trim()
      const inspectionId = values.inspectionId === '' || values.inspectionId === null
        ? null
        : Number(values.inspectionId)

      if (!values.batchId || Number.isNaN(batchId) || batchId <= 0) {
        setActionError('Vui lòng chọn Lô hàng cấp chứng nhận.')
        return
      }

      if (!certificateType) {
        setActionError('Vui lòng nhập Loại chứng nhận (ví dụ: VietGAP, GlobalGAP...).')
        return
      }

      if (!fileUrl) {
        setActionError('Vui lòng nhập URL file tài liệu chứng nhận.')
        return
      }

      const payload: AdminCertificatePayload = {
        batchId,
        inspectionId,
        certificateType,
        fileUrl,
      }

      if (editing) {
        await crud.update.mutateAsync({
          id: editing.id,
          payload,
        })
        setMessage('Đã cập nhật chứng nhận.')
      } else {
        await crud.create.mutateAsync(payload)
        setMessage('Đã thêm chứng nhận mới.')
      }

      setOpen(false)
      setEditing(null)
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Không thể lưu chứng nhận.'
      setActionError(errMsg)
    }
  }

  async function remove(
    row: AdminCertificate,
  ) {
    if (
      !window.confirm(
        `Xóa chứng nhận #${row.id}?`,
      )
    ) {
      return
    }

    await crud.remove.mutateAsync(
      row.id,
    )

    setMessage(
      'Đã xóa chứng nhận.',
    )
  }

  const columns:
    DataTableColumn<AdminCertificate>[] =
    [
      {
        key: 'type',
        label:
          'Loại chứng nhận',
        minWidth: 180,

        render: row => (
          <Typography
            sx={{
              fontWeight: 800,
            }}
          >
            {row.certificateType ??
              '-'}
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
        key: 'inspection',
        label: 'Kiểm định',

        render: row =>
          row.inspectionId
            ? `KD-${row.inspectionId}`
            : 'Độc lập',
      },

      {
        key: 'date',
        label: 'Ngày cấp',

        render: row =>
          formatDateTime(
            row.issuedAt,
          ),
      },

      {
        key: 'file',
        label: 'File',

        render: row =>
          row.fileUrl ? (
            <Button
              component="a"
              href={
                row.fileUrl
              }
              target="_blank"
              size="small"
            >
              Xem file
            </Button>
          ) : (
            '-'
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
        title="Quản lý chứng nhận"
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
            Thêm chứng nhận
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
            ? 'Sửa chứng nhận'
            : 'Thêm chứng nhận'
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

                inspectionId:
                  editing.inspectionId,

                certificateType:
                  editing.certificateType ??
                  '',

                fileUrl:
                  editing.fileUrl ??
                  '',
              }
            : {
                batchId: '',
                inspectionId: '',
                certificateType: '',
                fileUrl: '',
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
            name: 'inspectionId',
            label: 'Kiểm định liên quan',
            type: 'select',
            options: (inspections.data ?? []).map(item => ({
              value: item.id,
              label: `KD-${item.id} - ${item.batchCode ?? item.batchId}`,
            })),
          },
          {
            name: 'certificateType',
            label: 'Loại chứng nhận',
            required: true,
          },
          {
            name: 'fileUrl',
            label: 'URL file chứng nhận',
            required: true,
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