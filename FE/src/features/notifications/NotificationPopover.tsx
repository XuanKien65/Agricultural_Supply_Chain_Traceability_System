import { useEffect, useState, type MouseEvent } from 'react'
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material'
import { NotificationsNoneRounded, CheckCircleOutlineRounded } from '@mui/icons-material'
import { notificationsApi } from './notifications.api'
import type { AppNotification } from './notifications.types'

export function NotificationPopover() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const open = Boolean(anchorEl)

  async function loadData() {
    try {
      setLoading(true)
      const [list, count] = await Promise.all([
        notificationsApi.getNotifications().catch(() => []),
        notificationsApi.getUnreadCount().catch(() => 0),
      ])
      setNotifications(list)
      setUnreadCount(count)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Periodic poll every 30s
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    setAnchorEl(e.currentTarget)
    loadData()
  }

  function handleClose() {
    setAnchorEl(null)
  }

  async function handleMarkRead(id: number) {
    try {
      await notificationsApi.markRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      /* ignore */
    }
  }

  async function handleMarkAllRead() {
    try {
      await notificationsApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <Tooltip title="Thông báo hệ thống">
        <IconButton onClick={handleClick} size="medium">
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsNoneRounded />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 360, maxHeight: 480, borderRadius: 3, p: 0, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 800 }}>
            Thông báo ({notifications.length})
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllRead}
              startIcon={<CheckCircleOutlineRounded fontSize="small" />}
              sx={{ textTransform: 'none', fontSize: 12, fontWeight: 700 }}
            >
              Đã đọc tất cả
            </Button>
          )}
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography sx={{ fontSize: 13 }}>Không có thông báo mới nào</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 360, overflowY: 'auto' }}>
            {notifications.map((n) => (
              <ListItem
                key={n.id}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                sx={{
                  bgcolor: n.isRead ? 'transparent' : 'action.hover',
                  cursor: 'pointer',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: n.isRead ? 600 : 800,
                        color: n.isRead ? 'text.primary' : 'primary.main',
                      }}
                    >
                      {n.title}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                        {n.message}
                      </Typography>
                      <Typography color="text.disabled" sx={{ fontSize: 10, mt: 0.5 }}>
                        {new Date(n.createdAt).toLocaleString('vi-VN')}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  )
}
