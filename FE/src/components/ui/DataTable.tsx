import type { ReactNode } from 'react'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
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
}

export function DataTable<T>({ rows, columns, getRowId }: Props<T>) {
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
            {rows.map((row) => (
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

      {rows.length === 0 && (
        <Typography sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
          Không tìm thấy dữ liệu.
        </Typography>
      )}
    </Paper>
  )
}
