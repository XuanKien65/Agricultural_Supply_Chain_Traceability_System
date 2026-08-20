import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'
import {
  LogoutRounded,
} from '@mui/icons-material'

import {
  AccountCircleRounded,
  LockResetRounded,
} from '@mui/icons-material'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import { ApiError } from '@/lib/api/http'

import { authApi } from './auth.api'
import { useAuthStore } from './auth.store'

export default function AccountPage() {
  const navigate = useNavigate()

  const user = useAuthStore(
    (state) => state.user,
  )

  const clearAuth = useAuthStore(
    (state) => state.clearAuth,
  )

  const setUser = useAuthStore(
    (state) => state.setUser,
  )

  const [loadingProfile, setLoadingProfile] =
    useState(false)

  const [currentPassword, setCurrentPassword] =
    useState('')

  const [newPassword, setNewPassword] =
    useState('')

  const [
    confirmNewPassword,
    setConfirmNewPassword,
  ] = useState('')

  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true)

        const profile =
          await authApi.getMe()

        setUser(profile)
      } catch {
        // Nếu API /auth/me không khả dụng,
        // vẫn dùng thông tin đã lưu trong store.
      } finally {
        setLoadingProfile(false)
      }
    }

    void loadProfile()
  }, [setUser])

  const handleChangePassword =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault()

      setError('')
      setSuccess('')

      if (
        !currentPassword ||
        !newPassword ||
        !confirmNewPassword
      ) {
        setError(
          'Vui lòng nhập đầy đủ thông tin mật khẩu.',
        )

        return
      }

      if (
        newPassword !==
        confirmNewPassword
      ) {
        setError(
          'Mật khẩu mới và xác nhận mật khẩu không trùng nhau.',
        )

        return
      }

      if (newPassword.length < 8) {
        setError(
          'Mật khẩu mới phải có ít nhất 8 ký tự.',
        )

        return
      }

      try {
        setSubmitting(true)

        await authApi.changePassword({
          currentPassword,
          newPassword,
          confirmNewPassword,
        })

        setSuccess(
          'Đổi mật khẩu thành công.',
        )

        setCurrentPassword('')
        setNewPassword('')
        setConfirmNewPassword('')
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError(
            'Không thể đổi mật khẩu.',
          )
        }
      } finally {
        setSubmitting(false)
      }
    }

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 1,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={900}
        >
          Tài khoản
        </Typography>

        <Button
          startIcon={<LogoutRounded />}
          color="error"
          variant="outlined"
          onClick={handleLogout}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            whiteSpace: 'nowrap',
          }}
        >
          Đăng xuất
        </Button>
      </Box>

      <Typography
        color="text.secondary"
        sx={{
          mb: 3,
        }}
      >
        Xem thông tin tài khoản và thay đổi mật khẩu.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2.5,
            md: 4,
          },
          borderRadius: 3,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              bgcolor: 'success.main',
              color: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loadingProfile ? (
              <CircularProgress
                size={25}
                color="inherit"
              />
            ) : (
              <AccountCircleRounded
                sx={{
                  fontSize: 32,
                }}
              />
            )}
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
            >
              Thông tin cá nhân
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Thông tin được lấy từ tài khoản đang đăng nhập.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 2,
          }}
        >
          <TextField
            label="Họ và tên"
            value={
              user?.fullName ?? ''
            }
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />

          <TextField
            label="Email"
            value={
              user?.email ?? ''
            }
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />

          <TextField
            label="Vai trò"
            value={
              user?.role ?? ''
            }
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />

          <TextField
            label="Tổ chức"
            value={
              user?.organizationName ??
              'Không thuộc tổ chức'
            }
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2.5,
            md: 4,
          },
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <LockResetRounded
            color="success"
          />

          <Typography
            variant="h6"
            fontWeight={800}
          >
            Đổi mật khẩu
          </Typography>
        </Box>

        <Divider
          sx={{
            my: 3,
          }}
        />

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{
              mb: 2,
            }}
          >
            {success}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={
            handleChangePassword
          }
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            label="Mật khẩu hiện tại"
            type="password"
            value={currentPassword}
            onChange={(event) =>
              setCurrentPassword(
                event.target.value,
              )
            }
            required
            fullWidth
          />

          <TextField
            label="Mật khẩu mới"
            type="password"
            value={newPassword}
            onChange={(event) =>
              setNewPassword(
                event.target.value,
              )
            }
            required
            fullWidth
          />

          <TextField
            label="Xác nhận mật khẩu mới"
            type="password"
            value={
              confirmNewPassword
            }
            onChange={(event) =>
              setConfirmNewPassword(
                event.target.value,
              )
            }
            required
            fullWidth
          />

          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                minWidth: 160,
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              {submitting
                ? 'Đang xử lý...'
                : 'Đổi mật khẩu'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}