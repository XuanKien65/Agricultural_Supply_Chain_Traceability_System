import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'

export interface DataTableColumn<T> {
  key: string
  label: string
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  render: (row: T) => ReactNode
}

interface Props<T> {
  rows: T[]
  columns: DataTableColumn<T>[]
  getRowId: (row: T) => string | number
  defaultRowsPerPage?: number
}

export function DataTable<T>({ rows, columns, getRowId, defaultRowsPerPage = 10 }: Props<T>) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage)

  useEffect(() => {
    setPage(0)
  }, [rows.length])

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align ?? 'left'}
                  sx={{
                    minWidth: column.minWidth,
                    bgcolor: '#F6F8F7',
                    color: 'text.secondary',
                    fontSize: 12,
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((row) => (
              <TableRow key={getRowId(row)} hover>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    align={column.align ?? 'left'}
                    sx={{ py: 1.5, borderColor: '#EEF1EF' }}
                  >
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {rows.length === 0 ? (
        <Typography sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
          Không tìm thấy dữ liệu.
        </Typography>
      ) : (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10))
            setPage(0)
          }}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} trong ${count}`}
        />
      )}
    </Paper>
  )
}
