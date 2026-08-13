import {
  DeleteOutlineRounded,
  EditRounded,
} from '@mui/icons-material'

import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/material'

export function AdminRowActions({
  onEdit,
  onDelete,
  deleting = false,
}: {
  onEdit: () => void
  onDelete: () => void
  deleting?: boolean
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent:
          'flex-end',
      }}
    >
      <Tooltip title="Sửa">
        <IconButton
          size="small"
          onClick={onEdit}
        >
          <EditRounded
            fontSize="small"
          />
        </IconButton>
      </Tooltip>

      <Tooltip title="Xóa">
        <span>
          <IconButton
            size="small"
            color="error"
            disabled={deleting}
            onClick={onDelete}
          >
            <DeleteOutlineRounded
              fontSize="small"
            />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}