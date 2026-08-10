import type { ReactNode } from 'react'
import { Box, InputAdornment, TextField, Typography } from '@mui/material'
import { SearchRounded } from '@mui/icons-material'

interface Props {
  title: string
  description: string
  search?: string
  onSearchChange?: (value: string) => void
  action?: ReactNode
}

export function PageHeader({ title, description, search, onSearchChange, action }: Props) {
  return (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { md: 'center' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
          {title}
        </Typography>
        <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 14 }}>
          {description}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.2 }}>
        {onSearchChange && (
          <TextField
            size="small"
            value={search ?? ''}
            placeholder="Tìm kiếm..."
            onChange={(event) => onSearchChange(event.target.value)}
            sx={{ width: { xs: '100%', sm: 300 }, bgcolor: 'white' }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
        {action}
      </Box>
    </Box>
  )
}
