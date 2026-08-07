import {
  useEffect,
  useState,
} from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'

import type {
  NguoiDung,
  NguoiDungFormData,
} from '../admin.types'

import {
  useAdminStore,
} from '../admin.store'

interface Props {
  open: boolean
  initial: NguoiDung | null
  onClose: () => void

  onSave: (
    data: NguoiDungFormData,
  ) => void
}

const emptyForm:
  NguoiDungFormData = {
    maVaiTro: 2,
    maDonVi: 1,

    tenDangNhap: '',
    email: '',
    hoTen: '',

    trangThai: 'Active',
  }

export function UserDialog({
  open,
  initial,
  onClose,
  onSave,
}: Props) {
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

  const [form, setForm] =
    useState<NguoiDungFormData>(
      emptyForm,
    )

  useEffect(() => {
    if (initial) {
      setForm({
        maVaiTro:
          initial.maVaiTro,

        maDonVi:
          initial.maDonVi,

        tenDangNhap:
          initial.tenDangNhap,

        email:
          initial.email,

        hoTen:
          initial.hoTen,

        trangThai:
          initial.trangThai,
      })
    } else {
      setForm(emptyForm)
    }
  }, [initial, open])

  const isAdmin =
    form.maVaiTro === 1

  function handleSave() {
    if (
      !form.hoTen.trim() ||
      !form.tenDangNhap.trim() ||
      !form.email.trim()
    ) {
      return
    }

    onSave({
      ...form,

      maDonVi:
        isAdmin
          ? null
          : form.maDonVi,
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle
        sx={{
          fontWeight: 900,
        }}
      >
        {initial
          ? 'Cập nhật người dùng'
          : 'Thêm người dùng'}
      </DialogTitle>

      <DialogContent
        sx={{
          pt: '12px !important',

          display: 'grid',
          gap: 2,
        }}
      >
        <TextField
          label="Họ tên"
          value={form.hoTen}
          onChange={(event) =>
            setForm(
              (current) => ({
                ...current,

                hoTen:
                  event.target
                    .value,
              }),
            )
          }
          required
        />

        <TextField
          label="Tên đăng nhập"
          value={
            form.tenDangNhap
          }
          onChange={(event) =>
            setForm(
              (current) => ({
                ...current,

                tenDangNhap:
                  event.target
                    .value,
              }),
            )
          }
          required
        />

        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm(
              (current) => ({
                ...current,

                email:
                  event.target
                    .value,
              }),
            )
          }
          required
        />

        <FormControl>
          <InputLabel>
            Vai trò
          </InputLabel>

          <Select
            label="Vai trò"
            value={form.maVaiTro}
            onChange={(event) => {
              const maVaiTro =
                Number(
                  event.target
                    .value,
                )

              setForm(
                (current) => ({
                  ...current,

                  maVaiTro,

                  maDonVi:
                    maVaiTro ===
                    1
                      ? null
                      : (current.maDonVi ??
                        donVis[0]
                          ?.maDonVi ??
                        null),
                }),
              )
            }}
          >
            {vaiTros.map(
              (vaiTro) => (
                <MenuItem
                  key={
                    vaiTro.maVaiTro
                  }
                  value={
                    vaiTro.maVaiTro
                  }
                >
                  {
                    vaiTro.tenVaiTro
                  }
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        <FormControl
          disabled={isAdmin}
        >
          <InputLabel>
            Đơn vị
          </InputLabel>

          <Select
            label="Đơn vị"
            value={
              form.maDonVi ?? ''
            }
            onChange={(event) =>
              setForm(
                (current) => ({
                  ...current,

                  maDonVi:
                    Number(
                      event
                        .target
                        .value,
                    ),
                }),
              )
            }
          >
            {donVis.map(
              (donVi) => (
                <MenuItem
                  key={
                    donVi.maDonVi
                  }
                  value={
                    donVi.maDonVi
                  }
                >
                  {donVi.tenDonVi}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>
            Trạng thái
          </InputLabel>

          <Select
            label="Trạng thái"
            value={
              form.trangThai
            }
            onChange={(event) =>
              setForm(
                (current) => ({
                  ...current,

                  trangThai:
                    event.target
                      .value as NguoiDung['trangThai'],
                }),
              )
            }
          >
            <MenuItem value="Active">
              Hoạt động
            </MenuItem>

            <MenuItem value="Inactive">
              Ngừng hoạt động
            </MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
        }}
      >
        <Button
          onClick={onClose}
        >
          Hủy
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            bgcolor: '#19713A',

            '&:hover': {
              bgcolor:
                '#145C30',
            },
          }}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  )
}