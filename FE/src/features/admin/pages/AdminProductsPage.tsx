import { useAuthStore } from '@/features/auth/auth.store'

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
  useAdminOrganizations,
  useAdminProducts,
  useProductCrud,
} from '../admin.queries'

import type {
  AdminProduct,
  AdminProductPayload,
} from '../admin.types'

import {
  AdminFormDialog,
  type FormValues,
} from '../components/AdminFormDialog'

import {
  AdminRowActions,
} from '../components/AdminRowActions'

export function AdminProductsPage() {
  const productsQuery =
    useAdminProducts()

  const organizationsQuery =
    useAdminOrganizations()

  const crud =
    useProductCrud()

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    editing,
    setEditing,
  ] =
    useState<AdminProduct | null>(
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

  const currentUser = useAuthStore(state => state.user)
  const isOrgAdmin = currentUser?.role === 'ORGADMIN'

  const products = useMemo(() => {
    let list = productsQuery.data ?? []
    if (isOrgAdmin && currentUser?.organizationId) {
      list = list.filter(p => p.organizationId === currentUser.organizationId)
    }
    return list
  }, [productsQuery.data, isOrgAdmin, currentUser?.organizationId])

  const organizations =
    organizationsQuery.data ?? []

  const rows =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase()

      if (!q) {
        return products
      }

      return products.filter(
        item =>
          `${
            item.name ?? ''
          } ${
            item.category ?? ''
          } ${
            item.unit ?? ''
          } ${
            item.organizationName ??
            ''
          }`
            .toLowerCase()
            .includes(q),
      )
    }, [
      products,
      search,
    ])

  if (
    productsQuery.isLoading ||
    organizationsQuery.isLoading
  ) {
    return (
      <PageLoader
        label="Đang tải sản phẩm..."
      />
    )
  }

  const queryError =
    productsQuery.error ??
    organizationsQuery.error

  if (queryError) {
    return (
      <Alert severity="error">
        {queryError instanceof Error
          ? queryError.message
          : 'Không tải được dữ liệu sản phẩm.'}
      </Alert>
    )
  }

  // =========================================================
  // MỞ FORM THÊM
  // =========================================================

  function openCreateDialog() {
    setActionError('')

    // Products.OrganizationId trong DB là NOT NULL.
    // Vì vậy bắt buộc phải có ít nhất 1 Organization.
    if (organizations.length === 0) {
      setActionError(
        'Chưa có tổ chức nào. Hãy sang mục Đơn vị tạo một tổ chức trước khi thêm sản phẩm.',
      )

      return
    }

    setEditing(null)
    setOpen(true)
  }

  // =========================================================
  // MỞ FORM SỬA
  // =========================================================

  function openEditDialog(
    row: AdminProduct,
  ) {
    setActionError('')
    setEditing(row)
    setOpen(true)
  }

  // =========================================================
  // LƯU PRODUCT
  // =========================================================

  async function save(
    values: FormValues,
  ) {
    try {
      setActionError('')

      const name =
        String(
          values.name ?? '',
        ).trim()

      const category =
        String(
          values.category ?? '',
        ).trim()

      const unit =
        String(
          values.unit ?? '',
        ).trim()

      const organizationId =
        Number(
          values.organizationId,
        )

      if (!name) {
        setActionError('Tên sản phẩm không được để trống.')
        return
      }

      if (
        !Number.isInteger(organizationId) ||
        organizationId <= 0
      ) {
        setActionError('Bạn phải chọn một tổ chức sở hữu sản phẩm.')
        return
      }

      // Kiểm tra trùng tên sản phẩm trong cùng 1 tổ chức
      const isDuplicate = products.some(
        p =>
          (!editing || p.id !== editing.id) &&
          p.organizationId === organizationId &&
          (p.name ?? '').trim().toLowerCase() === name.toLowerCase(),
      )

      if (isDuplicate) {
        setActionError(`Sản phẩm "${name}" đã tồn tại trong tổ chức này. Vui lòng nhập tên khác.`)
        return
      }

      const payload:
        AdminProductPayload =
        {
          name,

          category:
            category || null,

          unit:
            unit || null,

          organizationId,
        }

      if (editing) {
        await crud.update.mutateAsync({
          id: editing.id,
          payload,
        })

        setMessage(
          'Đã cập nhật sản phẩm.',
        )
      } else {
        await crud.create.mutateAsync(
          payload,
        )

        setMessage(
          'Đã thêm sản phẩm vào database.',
        )
      }

      setOpen(false)
      setEditing(null)
    } catch (error) {
      console.error(
        'Lỗi lưu sản phẩm:',
        error,
      )

      setActionError(
        error instanceof Error
          ? error.message
          : 'Không thể lưu sản phẩm.',
      )
    }
  }

  // =========================================================
  // XÓA PRODUCT
  // =========================================================

  async function remove(
    row: AdminProduct,
  ) {
    const confirmDelete =
      window.confirm(
        `Bạn có chắc muốn xóa sản phẩm "${
          row.name ??
          `#${row.id}`
        }"?`,
      )

    if (!confirmDelete) {
      return
    }

    try {
      setActionError('')

      await crud.remove.mutateAsync(
        row.id,
      )

      setMessage(
        'Đã xóa sản phẩm.',
      )
    } catch (error) {
      console.error(
        'Lỗi xóa sản phẩm:',
        error,
      )

      setActionError(
        error instanceof Error
          ? error.message
          : 'Không thể xóa sản phẩm.',
      )
    }
  }

  // =========================================================
  // TABLE
  // =========================================================

  const columns:
    DataTableColumn<AdminProduct>[] =
    [
      {
        key: 'id',
        label: 'ID',

        render: row =>
          `SP-${row.id}`,
      },

      {
        key: 'name',
        label: 'Tên sản phẩm',
        minWidth: 220,

        render: row => (
          <Typography
            sx={{
              fontWeight: 800,
            }}
          >
            {row.name ?? '-'}
          </Typography>
        ),
      },

      {
        key: 'category',
        label: 'Danh mục',

        render: row =>
          row.category ?? '-',
      },

      {
        key: 'unit',
        label: 'Đơn vị tính',

        render: row =>
          row.unit ?? '-',
      },

      {
        key: 'organization',
        label: 'Tổ chức sở hữu',
        minWidth: 220,

        render: row =>
          row.organizationName ??
          `Organization #${row.organizationId}`,
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
            onEdit={() =>
              openEditDialog(row)
            }
            onDelete={() =>
              void remove(row)
            }
          />
        ),
      },
    ]

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <PageHeader
        title="Quản lý sản phẩm"
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
            Thêm sản phẩm
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
            ? 'Sửa sản phẩm'
            : 'Thêm sản phẩm'
        }
        saving={
          crud.create.isPending ||
          crud.update.isPending
        }
        initial={
          editing
            ? {
                name:
                  editing.name ??
                  '',

                category:
                  editing.category ??
                  '',

                unit:
                  editing.unit ??
                  '',

                organizationId:
                  editing.organizationId,
              }
            : {
                name: '',
                category: '',
                unit: '',
                organizationId: isOrgAdmin && currentUser?.organizationId ? currentUser.organizationId : '',
              }
        }
        error={actionError}
        fields={[
          {
            name: 'name',
            label: 'Tên sản phẩm',
            required: true,
          },
          {
            name: 'category',
            label: 'Danh mục',
            required: true,
          },
          {
            name: 'unit',
            label: 'Đơn vị tính',
            required: true,
          },
          {
            name: 'organizationId',
            label: 'Tổ chức',
            type: 'select',
            required: true,
            disabled: isOrgAdmin,
            options: (isOrgAdmin && currentUser?.organizationId
              ? organizations.filter((o) => o.id === currentUser.organizationId)
              : organizations
            ).map((organization) => ({
              value: organization.id,
              label: `${organization.name} (${organization.type})`,
            })),
          },
        ]}
        onClose={() => {
          if (
            crud.create.isPending ||
            crud.update.isPending
          ) {
            return
          }

          setActionError('')
          setOpen(false)
          setEditing(null)
        }}
        onSave={values =>
          void save(values)
        }
      />

      <Snackbar
        open={
          Boolean(message)
        }
        autoHideDuration={
          2500
        }
        message={message}
        onClose={() =>
          setMessage('')
        }
      />
    </>
  )
}