import {
  useState,
} from 'react'

import {
  AddRounded,
  DeleteOutlineRounded,
  EditRounded,
} from '@mui/icons-material'

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import {
  managementApi,
} from '../management.api'

import {
  useManagementMutation,
  useOrganizations,
  useProducts,
} from '../management.queries'

import type {
  Product,
} from '../management.types'

import ManagementPageHeader from '../components/ManagementPageHeader'

export default function ProductsManagementPage() {
  const [search, setSearch] =
    useState('')

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false)

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false)

  const [
    editingProduct,
    setEditingProduct,
  ] =
    useState<Product | null>(
      null,
    )

  const [
    deletingProduct,
    setDeletingProduct,
  ] =
    useState<Product | null>(
      null,
    )

  const [
    organizationId,
    setOrganizationId,
  ] =
    useState<number | ''>('')

  const [name, setName] =
    useState('')

  const [
    category,
    setCategory,
  ] = useState('')

  const [unit, setUnit] =
    useState('kg')

  const productsQuery =
    useProducts({
      page: 1,
      pageSize: 100,
      search:
        search.trim() ||
        undefined,
    })

  const organizationsQuery =
    useOrganizations({
      page: 1,
      pageSize: 100,
    })

  const saveMutation =
    useManagementMutation<
      void,
      Product
    >(
      async () => {
        if (
          organizationId ===
          ''
        ) {
          throw new Error(
            'Vui lòng chọn tổ chức.',
          )
        }

        if (editingProduct) {
          return managementApi.updateProduct(
            editingProduct.productId,
            {
              organizationId,

              name:
                name.trim(),

              category:
                category.trim() ||
                null,

              unit:
                unit.trim() ||
                null,
            },
          )
        }

        return managementApi.createProduct({
          organizationId,

          name:
            name.trim(),

          category:
            category.trim() ||
            null,

          unit:
            unit.trim() ||
            null,
        })
      },

      ['products'],
    )

  const deleteMutation =
    useManagementMutation<
      number,
      void
    >(
      (id) =>
        managementApi.deleteProduct(
          id,
        ),

      ['products'],
    )

  const rows =
    productsQuery.data
      ?.items ?? []

  const organizations =
    organizationsQuery.data
      ?.items ?? []

  const openCreateDialog =
    () => {
      setEditingProduct(null)
      setOrganizationId(
        organizations[0]?.organizationId ??
          '',
      )
      setName('')
      setCategory('')
      setUnit('kg')
      setDialogOpen(true)
    }

  const openEditDialog =
    (product: Product) => {
      setEditingProduct(
        product,
      )

      setOrganizationId(
        product.organizationId,
      )

      setName(
        product.name,
      )

      setCategory(
        product.category ??
          '',
      )

      setUnit(
        product.unit ??
          '',
      )

      setDialogOpen(true)
    }

  const openDeleteDialog =
    (product: Product) => {
      setDeletingProduct(
        product,
      )

      setDeleteDialogOpen(
        true,
      )
    }

  const handleSave =
    async () => {
      if (
        !name.trim() ||
        organizationId ===
          ''
      ) {
        return
      }

      await saveMutation.mutateAsync()

      setDialogOpen(false)
    }

  const handleDelete =
    async () => {
      if (!deletingProduct) {
        return
      }

      await deleteMutation.mutateAsync(
        deletingProduct.productId,
      )

      setDeleteDialogOpen(
        false,
      )

      setDeletingProduct(null)
    }

  return (
    <Box>
      <ManagementPageHeader
        title="Quản lý sản phẩm"
        description="Quản lý danh mục nông sản của các tổ chức."
        action={
          <Button
            variant="contained"
            startIcon={
              <AddRounded />
            }
            onClick={
              openCreateDialog
            }
            sx={{
              textTransform:
                'none',
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            Thêm sản phẩm
          </Button>
        }
      />

      {productsQuery.isError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
        >
          Không thể tải danh sách sản phẩm.
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
        }}
      >
        <TextField
          label="Tìm sản phẩm"
          placeholder="Nhập tên sản phẩm..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          size="small"
          sx={{
            width: {
              xs: '100%',
              md: 360,
            },
          }}
        />
      </Paper>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 3,
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor:
                  'grey.50',
              }}
            >
              <TableCell>
                ID
              </TableCell>

              <TableCell>
                Sản phẩm
              </TableCell>

              <TableCell>
                Danh mục
              </TableCell>

              <TableCell>
                Đơn vị
              </TableCell>

              <TableCell>
                Tổ chức
              </TableCell>

              <TableCell
                align="right"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map(
              (product) => (
                <TableRow
                  key={
                    product.productId
                  }
                  hover
                >
                  <TableCell>
                    {
                      product.productId
                    }
                  </TableCell>

                  <TableCell>
                    <Typography
                      fontWeight={
                        700
                      }
                    >
                      {
                        product.name
                      }
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {product.category ??
                      '—'}
                  </TableCell>

                  <TableCell>
                    {product.unit ??
                      '—'}
                  </TableCell>

                  <TableCell>
                    {product.organizationName ??
                      product.organizationId}
                  </TableCell>

                  <TableCell
                    align="right"
                  >
                    <IconButton
                      onClick={() =>
                        openEditDialog(
                          product,
                        )
                      }
                    >
                      <EditRounded />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() =>
                        openDeleteDialog(
                          product,
                        )
                      }
                    >
                      <DeleteOutlineRounded />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ),
            )}

            {!productsQuery.isLoading &&
              rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{
                      py: 5,
                    }}
                  >
                    Không có sản phẩm.
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() =>
          setDialogOpen(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingProduct
            ? 'Cập nhật sản phẩm'
            : 'Thêm sản phẩm'}
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              pt: 1,
              display: 'flex',
              flexDirection:
                'column',
              gap: 2,
            }}
          >
            <TextField
              select
              label="Tổ chức"
              value={
                organizationId
              }
              onChange={(event) =>
                setOrganizationId(
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
              fullWidth
              required
            >
              {organizations.map(
                (organization) => (
                  <MenuItem
                    key={
                      organization.organizationId
                    }
                    value={
                      organization.organizationId
                    }
                  >
                    {
                      organization.name
                    }
                  </MenuItem>
                ),
              )}
            </TextField>

            <TextField
              label="Tên sản phẩm"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              fullWidth
              required
            />

            <TextField
              label="Danh mục"
              placeholder="Ví dụ: Rau củ"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value,
                )
              }
              fullWidth
            />

            <TextField
              label="Đơn vị"
              placeholder="Ví dụ: kg"
              value={unit}
              onChange={(event) =>
                setUnit(
                  event.target.value,
                )
              }
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDialogOpen(false)
            }
            sx={{
              textTransform:
                'none',
            }}
          >
            Hủy
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSave
            }
            disabled={
              saveMutation.isPending ||
              !name.trim() ||
              organizationId ===
                ''
            }
            sx={{
              textTransform:
                'none',
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={
          deleteDialogOpen
        }
        onClose={() =>
          setDeleteDialogOpen(
            false,
          )
        }
      >
        <DialogTitle>
          Xóa sản phẩm
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Bạn có chắc muốn xóa
            sản phẩm "
            {deletingProduct?.name}
            " không?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDeleteDialogOpen(
                false,
              )
            }
          >
            Hủy
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={
              handleDelete
            }
            disabled={
              deleteMutation.isPending
            }
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}