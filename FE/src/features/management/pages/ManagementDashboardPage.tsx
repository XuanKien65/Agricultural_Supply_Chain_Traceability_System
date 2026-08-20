import {
  ApartmentRounded,
  Inventory2Rounded,
  PeopleRounded,
} from '@mui/icons-material'

import {
  Box,
  Paper,
  Typography,
} from '@mui/material'

import {
  useAuthStore,
} from '@/features/auth/auth.store'

const cards = [
  {
    title:
      'Quản lý tổ chức',

    description:
      'Quản lý các đơn vị tham gia chuỗi cung ứng.',

    icon:
      <ApartmentRounded
        sx={{
          fontSize: 36,
        }}
      />,
  },

  {
    title:
      'Quản lý người dùng',

    description:
      'Tạo tài khoản và quản lý trạng thái người dùng.',

    icon:
      <PeopleRounded
        sx={{
          fontSize: 36,
        }}
      />,
  },

  {
    title:
      'Quản lý sản phẩm',

    description:
      'Quản lý danh mục sản phẩm nông nghiệp.',

    icon:
      <Inventory2Rounded
        sx={{
          fontSize: 36,
        }}
      />,
  },
]

export default function ManagementDashboardPage() {
  const user =
    useAuthStore(
      (state) =>
        state.user,
    )

  return (
    <Box>
      <Typography
        variant="h4"
        fontWeight={900}
      >
        Xin chào,
        {' '}
        {user?.fullName}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mt: 1,
          mb: 4,
        }}
      >
        Tổng quan khu vực quản trị
        AgriTrace.
      </Typography>

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            md:
              'repeat(3, 1fr)',
          },

          gap: 3,
        }}
      >
        {cards.map(
          (card) => (
            <Paper
              key={
                card.title
              }
              variant="outlined"
              sx={{
                p: 3,

                borderRadius: 3,

                minHeight: 180,
              }}
            >
              <Box
                sx={{
                  color:
                    'success.main',

                  mb: 2,
                }}
              >
                {card.icon}
              </Box>

              <Typography
                variant="h6"
                fontWeight={800}
              >
                {card.title}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                }}
              >
                {
                  card.description
                }
              </Typography>
            </Paper>
          ),
        )}
      </Box>
    </Box>
  )
}