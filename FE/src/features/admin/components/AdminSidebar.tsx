import {
  AgricultureRounded,
  ApartmentRounded,
  BadgeRounded,
  DashboardRounded,
  FactCheckRounded,
  Inventory2Rounded,
  LocalShippingRounded,
  PeopleAltRounded,
  TimelineRounded,
  WarningAmberRounded,
  WorkspacePremiumRounded,
} from '@mui/icons-material'

import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

const items = [
  {
    label: 'Tổng quan',
    path: '/admin',
    icon: <DashboardRounded />,
  },
  {
    label: 'Vai trò',
    path: '/admin/roles',
    icon: <BadgeRounded />,
  },
  {
    label: 'Đơn vị',
    path: '/admin/units',
    icon: <ApartmentRounded />,
  },
  {
    label: 'Người dùng',
    path: '/admin/users',
    icon: <PeopleAltRounded />,
  },
  {
    label: 'Sản phẩm',
    path: '/admin/products',
    icon: <Inventory2Rounded />,
  },
  {
    label: 'Lô hàng',
    path: '/admin/batches',
    icon: <LocalShippingRounded />,
  },
  {
    label: 'Sự kiện',
    path: '/admin/events',
    icon: <TimelineRounded />,
  },
  {
    label: 'Kiểm định',
    path: '/admin/inspections',
    icon: <FactCheckRounded />,
  },
  {
    label: 'Chứng nhận',
    path: '/admin/certificates',
    icon: <WorkspacePremiumRounded />,
  },
  {
    label: 'Thu hồi',
    path: '/admin/recalls',
    icon: <WarningAmberRounded />,
  },
]

interface Props {
  onNavigate?: () => void
}

export function AdminSidebar({
  onNavigate,
}: Props) {
  const navigate = useNavigate()
  const location = useLocation()

  function isActive(
    path: string,
  ) {
    if (path === '/admin') {
      return (
        location.pathname ===
        '/admin'
      )
    }

    return location.pathname.startsWith(
      path,
    )
  }

  return (
    <Box
      sx={{
        height: '100%',

        bgcolor: '#123D24',

        color: 'white',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2.3,

          display: 'flex',
          alignItems: 'center',

          gap: 1.2,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,

            display: 'grid',
            placeItems: 'center',

            borderRadius: 2.2,

            bgcolor: '#E8F5E9',
            color: '#19713A',
          }}
        >
          <AgricultureRounded />
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 900,
            }}
          >
            AgriTrace
          </Typography>

          <Typography
            sx={{
              color: '#A8CFB5',

              fontSize: 10,
              fontWeight: 700,
            }}
          >
            ADMIN PANEL
          </Typography>
        </Box>
      </Box>

      <Divider
        sx={{
          borderColor:
            'rgba(255,255,255,0.1)',
        }}
      />

      <List
        sx={{
          px: 1.4,
          py: 1.6,
        }}
      >
        {items.map((item) => {
          const active =
            isActive(item.path)

          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path)

                onNavigate?.()
              }}
              sx={{
                mb: 0.4,

                borderRadius: 2,

                color: active
                  ? 'white'
                  : '#B7D4C0',

                bgcolor: active
                  ? 'rgba(255,255,255,0.14)'
                  : 'transparent',

                '&:hover': {
                  bgcolor:
                    'rgba(255,255,255,0.1)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,

                  color: active
                    ? 'white'
                    : '#8EBA9C',
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={
                  item.label
                }
                primaryTypographyProps={{
                  fontSize: 14,

                  fontWeight:
                    active
                      ? 800
                      : 600,
                }}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}