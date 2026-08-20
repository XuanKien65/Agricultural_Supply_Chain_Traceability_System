import {
  LogoutRounded,
} from '@mui/icons-material'

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Toolbar,
  Typography,
} from '@mui/material'

import {
  Outlet,
  useNavigate,
} from 'react-router-dom'

import {
  authApi,
} from '@/features/auth/auth.api'

import {
  useAuthStore,
} from '@/features/auth/auth.store'

import AdminSidebar
  from './AdminSidebar'

export default function AdminLayout() {
  const navigate =
    useNavigate()

  const user =
    useAuthStore(
      (state) =>
        state.user,
    )

  const clearAuth =
    useAuthStore(
      (state) =>
        state.clearAuth,
    )

  const handleLogout =
    async () => {
      try {
        await authApi.logout()
      } finally {
        clearAuth()

        navigate(
          '/login',
          {
            replace: true,
          },
        )
      }
    }

  return (
    <Box
      sx={{
        minHeight: '100vh',

        display: 'flex',

        bgcolor: '#f6f8f7',
      }}
    >
      <AdminSidebar />

      <Box
        sx={{
          flex: 1,

          minWidth: 0,
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'white',

            color:
              'text.primary',

            borderBottom:
              '1px solid',

            borderColor:
              'divider',
          }}
        >
          <Toolbar
            sx={{
              gap: 2,
            }}
          >
            <Avatar
              sx={{
                bgcolor:
                  'success.main',
              }}
            >
              {user?.fullName
                ?.charAt(0)
                .toUpperCase() ??
                'A'}
            </Avatar>

            <Box
              sx={{
                flex: 1,
              }}
            >
              <Typography
                fontWeight={700}
              >
                {user?.fullName}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {user?.role}
              </Typography>
            </Box>

            <Button
              startIcon={
                <LogoutRounded />
              }
              onClick={
                handleLogout
              }
              sx={{
                textTransform:
                  'none',
              }}
            >
              Đăng xuất
            </Button>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            p: {
              xs: 2,
              md: 4,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}