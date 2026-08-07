import type { ReactNode } from 'react'

import {
  Box,
  Paper,
  Typography,
} from '@mui/material'

interface Props {
  title: string
  value: number
  description: string
  icon: ReactNode
  iconBg: string
  iconColor: string
}

export function StatCard({
  title,
  value,
  description,
  icon,
  iconBg,
  iconColor,
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,

        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',

          justifyContent:
            'space-between',

          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              color:
                'text.secondary',

              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,

              fontSize: 32,
              lineHeight: 1.2,

              fontWeight: 900,
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              mt: 0.7,

              color:
                'text.secondary',

              fontSize: 12,
            }}
          >
            {description}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 48,
            height: 48,

            flexShrink: 0,

            display: 'grid',
            placeItems: 'center',

            borderRadius: 2.5,

            bgcolor: iconBg,
            color: iconColor,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  )
}