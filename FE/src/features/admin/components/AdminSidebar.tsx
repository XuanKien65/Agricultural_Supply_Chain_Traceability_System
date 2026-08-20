import {
  ApartmentRounded,
  DashboardRounded,
  Inventory2Rounded,
  ListAltRounded,
  PeopleRounded,
  PersonRounded,
} from '@mui/icons-material'

import {
  Box,
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

import {
  useAuthStore,
} from '@/features/auth/auth.store'

const menuItems = [
  {
    label: 'Tổng quan',
    path: '/admin',
    icon:
      <DashboardRounded />,
    roles: [
      'ADMIN',
      'ORGADMIN',
    ],
  },

  {
    label: 'Tổ chức',
    path:
      '/admin/organizations',
    icon:
      <ApartmentRounded />,
    roles: ['ADMIN'],
  },

  {
    label: 'Người dùng',
    path: '/admin/users',
    icon: <PeopleRounded />,
    roles: [
      'ADMIN',
      'ORGADMIN',
    ],
  },

  {
    label: 'Sản phẩm',
    path:
      '/admin/products',
    icon:
      <Inventory2Rounded />,
    roles: [
      'ADMIN',
      'ORGADMIN',
    ],
  },

  {
    label: 'Danh mục',
    path:
      '/admin/lookups',
    icon:
      <ListAltRounded />,
    roles: [
      'ADMIN',
      'ORGADMIN',
    ],
  },

  {
    label: 'Tài khoản',
    path:
      '/admin/account',
    icon:
      <PersonRounded />,
    roles: [
      'ADMIN',
      'ORGADMIN',
    ],
  },
]

export default function AdminSidebar() {
  const navigate =
    useNavigate()

  const location =
    useLocation()

  const user =
    useAuthStore(
      (state) =>
        state.user,
    )

  return (
    <Box
      sx={{
        width: 260,

        minHeight: '100vh',

        bgcolor: '#123524',

        color: 'white',

        px: 2,

        py: 3,

        flexShrink: 0,
      }}
    >
      <Typography
        variant="h5"
        fontWeight={900}
        sx={{
          px: 2,
          mb: 3,
        }}
      >
        AgriTrace
      </Typography>

      <List>
        {menuItems
          .filter(
            (item) =>
              user &&
              item.roles.includes(
                user.role,
              ),
          )
          .map((item) => {
            const selected =
              location.pathname ===
                item.path ||
              (
                item.path !==
                  '/admin' &&
                location.pathname
                  .startsWith(
                    item.path,
                  )
              )

            return (
              <ListItemButton
                key={
                  item.path
                }
                selected={
                  selected
                }
                onClick={() =>
                  navigate(
                    item.path,
                  )
                }
                sx={{
                  borderRadius: 2,

                  mb: 0.75,

                  '&:hover': {
                    bgcolor:
                      'rgba(255,255,255,0.10)',
                  },

                  '&.Mui-selected':
                    {
                      bgcolor:
                        'rgba(255,255,255,0.16)',
                    },

                  '&.Mui-selected:hover':
                    {
                      bgcolor:
                        'rgba(255,255,255,0.20)',
                    },
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      'inherit',

                    minWidth: 42,
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={
                    item.label
                  }
                />
              </ListItemButton>
            )
          })}
      </List>
    </Box>
  )
}