import {
  Suspense,
  useState,
} from 'react'

import {
  AppBar,
  Avatar,
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import {
  LogoutRounded,
  MenuRounded,
  NotificationsNoneRounded,
} from '@mui/icons-material'

import {
  Outlet,
  useNavigate,
} from 'react-router-dom'

import { useAuthStore } from '@/features/auth/auth.store'

import { AdminSidebar } from './AdminSidebar'

const drawerWidth = 260

export function AdminLayout() {
  const theme = useTheme()

  const desktop =
    useMediaQuery(
      theme.breakpoints.up('md'),
    )

  const navigate =
    useNavigate()

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false)

  const user =
    useAuthStore(
      (state) => state.user,
    )

  const logout =
    useAuthStore(
      (state) => state.logout,
    )

  return (
    <Box
      sx={{
        minHeight: '100vh',

        display: 'flex',

        bgcolor: '#F4F7F5',
      }}
    >
      <Box
        component="nav"
        sx={{
          width: {
            md: drawerWidth,
          },

          flexShrink: {
            md: 0,
          },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() =>
            setMobileOpen(false)
          }
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: 'block',
              md: 'none',
            },

            '& .MuiDrawer-paper': {
              width: drawerWidth,
              border: 0,
            },
          }}
        >
          <AdminSidebar
            onNavigate={() =>
              setMobileOpen(false)
            }
          />
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: {
              xs: 'none',
              md: 'block',
            },

            '& .MuiDrawer-paper': {
              width: drawerWidth,

              border: 0,

              boxSizing:
                'border-box',
            },
          }}
        >
          <AdminSidebar />
        </Drawer>
      </Box>

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          ml: {
            md: `${drawerWidth}px`,
          },

          width: {
            md: `calc(100% - ${drawerWidth}px)`,
          },

          bgcolor: 'white',

          color:
            'text.primary',

          borderBottom:
            '1px solid',

          borderColor:
            'divider',

          zIndex:
            theme.zIndex.drawer - 1,
        }}
      >
        <Toolbar
          sx={{
            minHeight:
              '68px !important',
          }}
        >
          {!desktop && (
            <IconButton
              onClick={() =>
                setMobileOpen(true)
              }
              sx={{
                mr: 1,
              }}
            >
              <MenuRounded />
            </IconButton>
          )}

          <Typography
            sx={{
              flex: 1,

              color:
                'text.secondary',

              fontSize: 14,

              fontWeight: 700,
            }}
          >
            Hệ thống truy xuất
            nguồn gốc nông sản
          </Typography>

          <Tooltip title="Thông báo">
            <IconButton>
              <NotificationsNoneRounded />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              ml: 1.5,

              display: 'flex',

              alignItems:
                'center',

              gap: 1,
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,

                bgcolor:
                  '#E8F5E9',

                color:
                  '#19713A',

                fontSize: 13,

                fontWeight: 900,
              }}
            >
              AD
            </Avatar>

            <Box
              sx={{
                display: {
                  xs: 'none',
                  sm: 'block',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {user?.name ??
                  'Admin'}
              </Typography>

              <Typography
                sx={{
                  color:
                    'text.secondary',

                  fontSize: 11,
                }}
              >
                {user?.email ?? ''}
              </Typography>
            </Box>

            <Tooltip title="Đăng xuất">
              <IconButton
                onClick={() => {
                  logout()

                  navigate(
                    '/login',
                  )
                }}
              >
                <LogoutRounded />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,

          width: {
            md: `calc(100% - ${drawerWidth}px)`,
          },
        }}
      >
        <Toolbar
          sx={{
            minHeight:
              '68px !important',
          }}
        />

        <Box
          sx={{
            p: {
              xs: 2,
              md: 3,
            },

            maxWidth: 1600,

            mx: 'auto',
          }}
        >
          <Suspense
            fallback={
              <Box
                sx={{
                  height: 300,

                  display:
                    'grid',

                  placeItems:
                    'center',
                }}
              >
                <CircularProgress />
              </Box>
            }
          >
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  )
}