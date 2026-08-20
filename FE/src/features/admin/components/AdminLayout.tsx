import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  LogoutRounded,
  NotificationsRounded,
} from '@mui/icons-material'

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Toolbar,
  Typography,
  Badge,
  IconButton,
  Menu,
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

import {
  notificationsApi,
} from '@/features/notifications/notifications.api'

import AdminSidebar
  from './AdminSidebar'

export default function AdminLayout() {
  const navigate =
    useNavigate()

  const queryClient =
    useQueryClient()

  const [notificationAnchor, setNotificationAnchor] =
    useState<HTMLElement | null>(null)

  const notificationsQuery =
    useQuery({
      queryKey: ['notifications'],
      queryFn: notificationsApi.getAll,
    })

  const markReadMutation =
    useMutation({
      mutationFn: notificationsApi.markRead,
      onSuccess: () =>
        void queryClient.invalidateQueries({
          queryKey: ['notifications'],
        }),
    })

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

            <IconButton
              color="primary"
              onClick={(event) =>
                setNotificationAnchor(
                  event.currentTarget,
                )
              }
              aria-label="Thông báo"
            >
              <Badge
                color="error"
                badgeContent={
                  notificationsQuery.data?.filter(
                    notification =>
                      !notification.isRead,
                  ).length ?? 0
                }
              >
                <NotificationsRounded />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={() =>
                setNotificationAnchor(null)
              }
              slotProps={{
                paper: {
                  sx: {
                    width: 360,
                    maxWidth: 'calc(100vw - 32px)',
                    p: 1,
                  },
                },
              }}
            >
              {(notificationsQuery.data ?? []).slice(0, 5).map(notification => (
                <Box
                  key={notification.id}
                  onClick={() => {
                    if (!notification.isRead) {
                      markReadMutation.mutate(
                        notification.id,
                      )
                    }
                  }}
                  sx={{
                    p: 1.25,
                    cursor: 'pointer',
                    borderRadius: 1,
                    bgcolor: notification.isRead
                      ? 'transparent'
                      : 'success.50',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: 14 }}>
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                </Box>
              ))}

              {!notificationsQuery.data?.length && (
                <Typography sx={{ p: 2 }} color="text.secondary">
                  Chưa có thông báo.
                </Typography>
              )}

              <Button
                fullWidth
                onClick={() => {
                  setNotificationAnchor(null)
                  navigate('/admin/notifications')
                }}
                sx={{ textTransform: 'none' }}
              >
                Xem tất cả thông báo
              </Button>
            </Menu>

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