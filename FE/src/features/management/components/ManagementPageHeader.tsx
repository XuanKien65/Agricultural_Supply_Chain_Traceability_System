import {
  Box,
  Typography,
} from '@mui/material'

interface Props {
  title: string

  description?: string

  action?: React.ReactNode
}

export default function ManagementPageHeader({
  title,
  description,
  action,
}: Props) {
  return (
    <Box
      sx={{
        display: 'flex',

        alignItems: {
          xs: 'flex-start',
          md: 'center',
        },

        justifyContent:
          'space-between',

        flexDirection: {
          xs: 'column',
          md: 'row',
        },

        gap: 2,

        mb: 3,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          fontWeight={800}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {action}
    </Box>
  )
}