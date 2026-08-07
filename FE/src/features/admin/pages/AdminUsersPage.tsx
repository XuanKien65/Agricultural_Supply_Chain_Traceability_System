import {
  useMemo,
  useState,
} from 'react'

import {
  AddRounded,
  DeleteOutlineRounded,
  EditRounded,
} from '@mui/icons-material'

import {
  Box,
  Button,
  IconButton,
  Typography,
} from '@mui/material'

import {
  useAdminStore,
} from '../admin.store'

import {
  AdminDataTable,
  type AdminColumn,
} from '../components/AdminDataTable'

import {
  PageHeader,
} from '../components/PageHeader'

import {
  StatusChip,
} from '../components/StatusChip'

import {
  UserDialog,
} from '../components/UserDialog'

import type {
  NguoiDung,
  NguoiDungFormData,
} from '../admin.types'

export function AdminUsersPage() {
  const nguoiDungs =
    useAdminStore(
      (state) =>
        state.nguoiDungs,
    )

  const vaiTros =
    useAdminStore(
      (state) =>
        state.vaiTros,
    )

  const donVis =
    useAdminStore(
      (state) =>
        state.donVis,
    )

  const addNguoiDung =
    useAdminStore(
      (state) =>
        state.addNguoiDung,
    )

  const updateNguoiDung =
    useAdminStore(
      (state) =>
        state.updateNguoiDung,
    )

  const deleteNguoiDung =
    useAdminStore(
      (state) =>
        state.deleteNguoiDung,
    )

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false)

  const [
    editing,
    setEditing,
  ] =
    useState<NguoiDung | null>(
      null,
    )

  const rows = useMemo(() => {
    const q =
      search
        .trim()
        .toLowerCase()

    if (!q) {
      return nguoiDungs
    }

    return nguoiDungs.filter(
      (item) =>
        `${item.hoTen} ${item.tenDangNhap} ${item.email}`
          .toLowerCase()
          .includes(q),
    )
  }, [nguoiDungs, search])

  function save(
    data: NguoiDungFormData,
  ) {
    if (editing) {
      updateNguoiDung(
        editing.maNguoiDung,
        data,
      )
    } else {
      addNguoiDung(data)
    }

    setDialogOpen(false)

    setEditing(null)
  }

  const columns:
    AdminColumn<NguoiDung>[] = [
      {
        key: 'user',

        label: 'Người dùng',

        minWidth: 200,

        render: (row) => (
          <Box>
            <Typography
              fontWeight={800}
            >
              {row.hoTen}
            </Typography>

            <Typography
              sx={{
                color:
                  'text.secondary',

                fontSize: 12,
              }}
            >
              @{row.tenDangNhap}
            </Typography>
          </Box>
        ),
      },

      {
        key: 'email',

        label: 'Email',

        minWidth: 200,

        render: (row) =>
          row.email,
      },

      {
        key: 'role',

        label: 'Vai trò',

        render: (row) =>
          vaiTros.find(
            (item) =>
              item.maVaiTro ===
              row.maVaiTro,
          )?.tenVaiTro ?? '-',
      },

      {
        key: 'unit',

        label: 'Đơn vị',

        minWidth: 230,

        render: (row) =>
          row.maDonVi
            ? (donVis.find(
                (item) =>
                  item.maDonVi ===
                  row.maDonVi,
              )?.tenDonVi ??
              '-')
            : 'Ban quản trị',
      },

      {
        key: 'date',

        label: 'Ngày tạo',

        render: (row) =>
          row.ngayTao,
      },

      {
        key: 'status',

        label:
          'Trạng thái',

        render: (row) => (
          <StatusChip
            status={
              row.trangThai
            }
          />
        ),
      },

      {
        key: 'actions',

        label: 'Thao tác',

        align: 'right',

        render: (row) => (
          <Box>
            <IconButton
              size="small"
              onClick={() => {
                setEditing(row)

                setDialogOpen(
                  true,
                )
              }}
            >
              <EditRounded fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              color="error"
              disabled={
                row.maNguoiDung ===
                1
              }
              onClick={() => {
                if (
                  window.confirm(
                    `Xóa người dùng ${row.hoTen}?`,
                  )
                ) {
                  deleteNguoiDung(
                    row.maNguoiDung,
                  )
                }
              }}
            >
              <DeleteOutlineRounded fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ]

  return (
    <>
      <PageHeader
        title="Quản lý người dùng"
        description="Quản lý NguoiDung, vai trò và đơn vị trực thuộc. Dữ liệu đang lưu trong Zustand MockData."
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

              setDialogOpen(
                true,
              )
            }}
            sx={{
              bgcolor:
                '#19713A',

              '&:hover': {
                bgcolor:
                  '#145C30',
              },
            }}
          >
            Thêm người dùng
          </Button>
        }
      />

      <AdminDataTable
        rows={rows}
        columns={columns}
        getRowId={(row) =>
          row.maNguoiDung
        }
      />

      <UserDialog
        open={dialogOpen}
        initial={editing}
        onClose={() =>
          setDialogOpen(false)
        }
        onSave={save}
      />
    </>
  )
}