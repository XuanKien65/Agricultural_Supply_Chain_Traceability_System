import {
  useState,
  type FormEvent,
} from 'react'

import {
  AgricultureRounded,
  LockRounded,
} from '@mui/icons-material'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import {
  Navigate,
  useNavigate,
} from 'react-router-dom'

import { ApiError }
  from '@/lib/api/http'

import { authApi }
  from './auth.api'

import { useAuthStore }
  from './auth.store'

export default function LoginPage() {
  const navigate =
    useNavigate()

  const isAuthenticated =
    useAuthStore(
      (state) =>
        state.isAuthenticated,
    )

  const setAuth =
    useAuthStore(
      (state) =>
        state.setAuth,
    )

  const [email, setEmail] =
    useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  if (isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  const handleSubmit =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault()

      if (
        !email.trim() ||
        !password
      ) {
        setError(
          'Vui lòng nhập email và mật khẩu.',
        )

        return
      }

      try {
        setLoading(true)
        setError('')

        const result =
          await authApi.login({
            email:
              email.trim(),

            password,
          })

        setAuth(
          result.accessToken,
          result.refreshToken,
          result.user,
        )

        if (
          result.user.role ===
            'ADMIN' ||
          result.user.role ===
            'ORGADMIN'
        ) {
          navigate(
            '/admin',
            {
              replace: true,
            },
          )

          return
        }

        navigate(
          '/',
          {
            replace: true,
          },
        )
      } catch (err) {
        if (
          err instanceof ApiError
        ) {
          setError(
            err.message,
          )
        } else {
          setError(
            'Không thể đăng nhập.',
          )
        }
      } finally {
        setLoading(false)
      }
    }

  return (
    <Box
      sx={{
        minHeight: '100vh',

        display: 'flex',

        alignItems: 'center',

        background:
          'linear-gradient(135deg, #eef7ef 0%, #ffffff 48%, #e6f4ea 100%)',

        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 3,
              sm: 5,
            },

            borderRadius: 4,

            border:
              '1px solid rgba(46,125,50,0.14)',

            boxShadow:
              '0 24px 80px rgba(20,80,40,0.12)',
          }}
        >
          <Box
            sx={{
              width: 70,

              height: 70,

              borderRadius: 3,

              bgcolor:
                'success.main',

              color: 'white',

              display: 'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              mx: 'auto',

              mb: 2,
            }}
          >
            <AgricultureRounded
              sx={{
                fontSize: 40,
              }}
            />
          </Box>

          <Typography
            variant="h4"
            fontWeight={900}
            textAlign="center"
          >
            AgriTrace
          </Typography>

          <Typography
            color="text.secondary"
            textAlign="center"
            sx={{
              mt: 1,
              mb: 4,
            }}
          >
            Hệ thống truy xuất
            nguồn gốc nông sản
          </Typography>

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

          <Box
            component="form"
            onSubmit={
              handleSubmit
            }
            sx={{
              display: 'flex',

              flexDirection:
                'column',

              gap: 2.5,
            }}
          >
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              value={email}
              autoComplete="email"
              onChange={(e) =>
                setEmail(
                  e.target.value,
                )
              }
            />

            <TextField
              fullWidth
              required
              type="password"
              label="Mật khẩu"
              value={password}
              autoComplete="current-password"
              onChange={(e) =>
                setPassword(
                  e.target.value,
                )
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRounded />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                minHeight: 50,

                borderRadius: 2.5,

                fontWeight: 700,

                textTransform:
                  'none',
              }}
            >
              {loading ? (
                <CircularProgress
                  size={23}
                  color="inherit"
                />
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}